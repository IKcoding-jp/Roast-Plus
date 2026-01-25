'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  QuizQuestion,
  QuizSession,
  QuizCategory,
} from '@/lib/coffee-quiz/types';
import {
  getDailyQuestions,
  getRandomQuestions,
  getQuestionsByCategory,
  shuffleOptions,
} from '@/lib/coffee-quiz/questions';
import { useQuizData } from './useQuizData';

export type QuizMode = 'daily' | 'review' | 'category' | 'random' | 'single' | 'shuffle' | 'sequential';

interface UseQuizSessionOptions {
  mode?: QuizMode;
  category?: QuizCategory;
  count?: number;
  questionIds?: string[];  // 特定の問題IDを指定
}

interface QuizSessionState {
  session: QuizSession | null;
  currentQuestion: QuizQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  isLoading: boolean;
  isComplete: boolean;
  sessionStats: {
    correct: number;
    incorrect: number;
    totalXP: number;
    accuracy: number;
  };
}

interface AnswerFeedback {
  isCorrect: boolean;
  xpEarned: number;
  leveledUp: boolean;
  newLevel?: number;
  explanation: string;
  correctOptionId: string;
}

export function useQuizSession(options: UseQuizSessionOptions = {}) {
  const { mode = 'daily', category, count = 10, questionIds } = options;
  const { recordAnswer, progress, getDueCardsForReview } = useQuizData();

  const [state, setState] = useState<QuizSessionState>({
    session: null,
    currentQuestion: null,
    currentIndex: 0,
    totalQuestions: 0,
    isLoading: false,
    isComplete: false,
    sessionStats: {
      correct: 0,
      incorrect: 0,
      totalXP: 0,
      accuracy: 0,
    },
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const startTimeRef = useRef<number>(0);
  const consecutiveCorrectRef = useRef<number>(0);

  // セッション開始
  const startSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      let loadedQuestions: QuizQuestion[] = [];

      const { getQuestionsByIds } = await import('@/lib/coffee-quiz/questions');

      switch (mode) {
        case 'daily':
          loadedQuestions = await getDailyQuestions(
            count,
            progress?.settings.enabledCategories,
            progress?.cards  // マスター判定用
          );
          break;
        case 'category':
          // questionIdsが指定されている場合はそちらを優先
          if (questionIds && questionIds.length > 0) {
            loadedQuestions = await getQuestionsByIds(questionIds);
          } else if (category) {
            const categoryQuestions = await getQuestionsByCategory(category);
            loadedQuestions = categoryQuestions.slice(0, count);
          }
          break;
        case 'review':
          // 復習モード: FSRSで期限が来たカードの問題を取得
          const dueCards = getDueCardsForReview();
          const dueQuestionIds = dueCards.slice(0, count).map((c) => c.questionId);
          loadedQuestions = await getQuestionsByIds(dueQuestionIds);
          break;
        case 'random':
          loadedQuestions = await getRandomQuestions(count);
          break;
        case 'single':
        case 'shuffle':
        case 'sequential':
          // 指定された問題IDで出題
          if (questionIds && questionIds.length > 0) {
            loadedQuestions = await getQuestionsByIds(questionIds);
          }
          break;
        
      }

      // 選択肢をシャッフル
      const shuffledQuestions = loadedQuestions.map(shuffleOptions);
      setQuestions(shuffledQuestions);

      // セッション作成
      const session: QuizSession = {
        id: crypto.randomUUID(),
        startedAt: new Date().toISOString(),
        questions: shuffledQuestions.map((q) => ({
          questionId: q.id,
        })),
        mode,
        category,
      };

      setState({
        session,
        currentQuestion: shuffledQuestions[0] || null,
        currentIndex: 0,
        totalQuestions: shuffledQuestions.length,
        isLoading: false,
        isComplete: shuffledQuestions.length === 0,
        sessionStats: {
          correct: 0,
          incorrect: 0,
          totalXP: 0,
          accuracy: 0,
        },
      });

      startTimeRef.current = Date.now();
      consecutiveCorrectRef.current = 0;
    } catch (error) {
      console.error('Failed to start quiz session:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [mode, category, count, questionIds, progress?.settings.enabledCategories, progress?.cards, getDueCardsForReview]);

  // 回答を送信
  const submitAnswer = useCallback(
    async (optionId: string) => {
      if (!state.currentQuestion || showFeedback) return;

      const responseTimeMs = Date.now() - startTimeRef.current;

      // 正解を確認
      const correctOption = state.currentQuestion.options.find((o) => o.isCorrect);
      const isCorrect = correctOption?.id === optionId;

      // 連続正解カウント
      if (isCorrect) {
        consecutiveCorrectRef.current++;
      } else {
        consecutiveCorrectRef.current = 0;
      }

      // 回答を記録
      const result = await recordAnswer(
        state.currentQuestion.id,
        optionId,
        responseTimeMs
      );

      // フィードバック設定
      setAnswerFeedback({
        isCorrect,
        xpEarned: result?.xpEarned ?? 0,
        leveledUp: result?.leveledUp ?? false,
        newLevel: result?.newLevel,
        explanation: state.currentQuestion.explanation,
        correctOptionId: correctOption?.id ?? '',
      });
      setShowFeedback(true);

      // 統計更新
      setState((prev) => {
        const newCorrect = prev.sessionStats.correct + (isCorrect ? 1 : 0);
        const newIncorrect = prev.sessionStats.incorrect + (isCorrect ? 0 : 1);
        const total = newCorrect + newIncorrect;

        return {
          ...prev,
          sessionStats: {
            correct: newCorrect,
            incorrect: newIncorrect,
            totalXP: prev.sessionStats.totalXP + (result?.xpEarned ?? 0),
            accuracy: total > 0 ? Math.round((newCorrect / total) * 100) : 0,
          },
        };
      });
    },
    [state.currentQuestion, showFeedback, recordAnswer]
  );

  // 次の問題へ
  const nextQuestion = useCallback(() => {
    setShowFeedback(false);
    setAnswerFeedback(null);

    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= questions.length) {
      // セッション完了
      setState((prev) => ({
        ...prev,
        isComplete: true,
        session: prev.session
          ? { ...prev.session, completedAt: new Date().toISOString() }
          : null,
      }));
    } else {
      // 次の問題
      setState((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        currentQuestion: questions[nextIndex],
      }));
      startTimeRef.current = Date.now();
    }
  }, [state.currentIndex, questions]);

  // セッションをリセット
  const resetSession = useCallback(() => {
    setState({
      session: null,
      currentQuestion: null,
      currentIndex: 0,
      totalQuestions: 0,
      isLoading: false,
      isComplete: false,
      sessionStats: {
        correct: 0,
        incorrect: 0,
        totalXP: 0,
        accuracy: 0,
      },
    });
    setQuestions([]);
    setAnswerFeedback(null);
    setShowFeedback(false);
    consecutiveCorrectRef.current = 0;
  }, []);

  return {
    ...state,
    questions,
    answerFeedback,
    showFeedback,
    startSession,
    submitAnswer,
    nextQuestion,
    resetSession,
    consecutiveCorrect: consecutiveCorrectRef.current,
  };
}
