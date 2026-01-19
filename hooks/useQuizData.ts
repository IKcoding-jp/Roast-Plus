'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  QuizProgress,
  QuizCard,
  QuizSettings,
  QuizQuestion,
  QuizCategory,
  EarnedBadge,
} from '@/lib/coffee-quiz/types';
import {
  DEFAULT_QUIZ_SETTINGS,
  INITIAL_QUIZ_STATS,
  INITIAL_LEVEL_INFO,
  INITIAL_STREAK_INFO,
} from '@/lib/coffee-quiz/types';
import {
  createQuizCard,
  reviewCard,
  determineRating,
  getDueCards,
  sortCardsByPriority,
  isCardMastered,
  getCardMastery,
} from '@/lib/coffee-quiz/fsrs';
import {
  calculateXP,
  addXP,
  updateStreak,
  updateDailyGoal,
  updateStats,
  checkNewBadges,
  earnBadges,
  getTodayGoal,
} from '@/lib/coffee-quiz/gamification';
import { getQuestionById, getQuestionsStats, getQuestionsByIds, loadAllQuestions } from '@/lib/coffee-quiz/questions';
import type { QuizDifficulty } from '@/lib/coffee-quiz/types';

const QUIZ_PROGRESS_COLLECTION = 'quiz_progress';
const SAVE_DEBOUNCE_MS = 1000;

interface AnswerResult {
  isCorrect: boolean;
  xpEarned: number;
  leveledUp: boolean;
  newLevel?: number;
  newBadges: EarnedBadge[];
  streakUpdated: boolean;
}

// 問題の統計情報の型
export interface QuestionsStats {
  total: number;
  byCategory: Record<QuizCategory, number>;
  byDifficulty: Record<QuizDifficulty, number>;
}

export function useQuizData() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [questionsStats, setQuestionsStats] = useState<QuestionsStats | null>(null);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<QuizProgress | null>(null);

  // 問題の統計情報と全問題を読み込み
  useEffect(() => {
    Promise.all([
      getQuestionsStats(),
      loadAllQuestions(),
    ]).then(([stats, questions]) => {
      setQuestionsStats(stats);
      setAllQuestions(questions);
    }).catch(console.error);
  }, []);

  // Firestoreからデータを読み込み
  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, QUIZ_PROGRESS_COLLECTION, user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as QuizProgress;
          // ペンディングの保存がなければ更新
          if (!pendingSaveRef.current) {
            setProgress(data);
          }
        } else {
          // 初期データを作成
          const initialProgress = createInitialProgress(user.uid);
          setProgress(initialProgress);
          // Firestoreに保存
          setDoc(docRef, initialProgress).catch(console.error);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Quiz progress subscription error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // デバウンス付き保存
  const saveProgress = useCallback(
    async (newProgress: QuizProgress) => {
      if (!user) return;

      pendingSaveRef.current = newProgress;
      setProgress(newProgress);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const docRef = doc(db, QUIZ_PROGRESS_COLLECTION, user.uid);
          await setDoc(docRef, {
            ...newProgress,
            updatedAt: new Date().toISOString(),
          });
          pendingSaveRef.current = null;
        } catch (err) {
          console.error('Failed to save quiz progress:', err);
          setError(err as Error);
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [user]
  );

  // 回答を記録
  const recordAnswer = useCallback(
    async (
      questionId: string,
      selectedOptionId: string,
      responseTimeMs: number
    ): Promise<AnswerResult | null> => {
      if (!progress) return null;

      // 問題を取得
      const question = await getQuestionById(questionId);
      if (!question) return null;

      // 正解判定
      const selectedOption = question.options.find((o) => o.id === selectedOptionId);
      const isCorrect = selectedOption?.isCorrect ?? false;

      // カードを探すか作成
      let card = progress.cards.find((c) => c.questionId === questionId);
      const isFirstTime = !card;
      if (!card) {
        card = createQuizCard(questionId);
      }

      // FSRSでカードを更新
      const rating = determineRating(isCorrect, responseTimeMs);
      const { card: updatedCard } = reviewCard(card, rating);

      // 連続正解数を計算（セッション内）
      const consecutiveCorrect = isCorrect ? 1 : 0; // 簡易版、セッション状態管理で改善可能

      // XP計算
      const xpEarned = calculateXP({
        isCorrect,
        difficulty: question.difficulty,
        responseTimeMs,
        isFirstTime,
        consecutiveCorrect,
      });

      // レベル更新
      const { newLevelInfo, leveledUp, newLevel } = addXP(progress.level, xpEarned);

      // ストリーク更新
      const newStreak = updateStreak(progress.streak);
      const streakUpdated = newStreak.currentStreak !== progress.streak.currentStreak;

      // 統計更新
      const isMastered = isCardMastered(updatedCard);
      const newStats = updateStats(
        progress.stats,
        isCorrect,
        question.category,
        question.difficulty,
        isMastered && isFirstTime
      );

      // デイリーゴール更新
      const newDailyGoals = updateDailyGoal(
        progress.dailyGoals,
        isCorrect,
        xpEarned,
        progress.settings.dailyGoal
      );

      // バッジチェック
      const todayGoal = getTodayGoal(newDailyGoals);
      const newBadgeTypes = checkNewBadges({
        streak: newStreak,
        stats: newStats,
        sessionCorrect: todayGoal?.correctAnswers ?? 0,
        sessionTotal: todayGoal?.completedQuestions ?? 0,
        sessionTimeMs: responseTimeMs,
        earnedBadges: progress.earnedBadges,
      });
      const newEarnedBadges = earnBadges(progress.earnedBadges, newBadgeTypes);

      // カードリストを更新
      const newCards = progress.cards.filter((c) => c.questionId !== questionId);
      newCards.push(updatedCard);

      // 新しいProgressを作成
      const newProgress: QuizProgress = {
        ...progress,
        cards: newCards,
        level: newLevelInfo,
        streak: newStreak,
        stats: newStats,
        dailyGoals: newDailyGoals,
        earnedBadges: newEarnedBadges,
        updatedAt: new Date().toISOString(),
      };

      // 保存
      await saveProgress(newProgress);

      return {
        isCorrect,
        xpEarned,
        leveledUp,
        newLevel,
        newBadges: newBadgeTypes.map((type) => ({
          type,
          earnedAt: new Date().toISOString(),
        })),
        streakUpdated,
      };
    },
    [progress, saveProgress]
  );

  // 復習が必要なカードを取得
  const getDueCardsForReview = useCallback((): QuizCard[] => {
    if (!progress) return [];
    const dueCards = getDueCards(progress.cards);
    return sortCardsByPriority(dueCards);
  }, [progress]);

  // 設定を更新
  const updateSettings = useCallback(
    async (newSettings: Partial<QuizSettings>) => {
      if (!progress) return;

      const updatedProgress: QuizProgress = {
        ...progress,
        settings: { ...progress.settings, ...newSettings },
        updatedAt: new Date().toISOString(),
      };

      await saveProgress(updatedProgress);
    },
    [progress, saveProgress]
  );


  // 今日のゴール
  const todayGoal = progress ? getTodayGoal(progress.dailyGoals) : null;

  // カテゴリ別平均定着率を計算
  const categoryMasteryStats: Record<QuizCategory, number> = (() => {
    const categories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];
    const result: Record<QuizCategory, number> = {
      basics: 0,
      roasting: 0,
      brewing: 0,
      history: 0,
    };

    if (!progress || allQuestions.length === 0) return result;

    for (const category of categories) {
      // このカテゴリの問題IDを取得
      const categoryQuestionIds = allQuestions
        .filter((q) => q.category === category)
        .map((q) => q.id);

      // このカテゴリのカードを取得
      const categoryCards = progress.cards.filter((c) =>
        categoryQuestionIds.includes(c.questionId)
      );

      if (categoryCards.length === 0) {
        result[category] = 0;
        continue;
      }

      // 平均定着率を計算
      const totalMastery = categoryCards.reduce(
        (sum, card) => sum + getCardMastery(card),
        0
      );
      result[category] = Math.round(totalMastery / categoryCards.length);
    }

    return result;
  })();

  // 進捗をリセット
  const resetProgress = useCallback(async () => {
    if (!user) return;

    const initialProgress = createInitialProgress(user.uid);
    const docRef = doc(db, QUIZ_PROGRESS_COLLECTION, user.uid);
    await setDoc(docRef, initialProgress);
    setProgress(initialProgress);
  }, [user]);

  return {
    progress,
    loading,
    error,
    recordAnswer,
    getDueCardsForReview,
    updateSettings,
    todayGoal,
    isAuthenticated: !!user,
    questionsStats,
    categoryMasteryStats,
    resetProgress,
  };
}

// 初期Progressを作成
function createInitialProgress(userId: string): QuizProgress {
  const now = new Date().toISOString();
  return {
    userId,
    cards: [],
    checkmarks: [],
    streak: { ...INITIAL_STREAK_INFO },
    level: { ...INITIAL_LEVEL_INFO },
    earnedBadges: [],
    dailyGoals: [],
    settings: { ...DEFAULT_QUIZ_SETTINGS },
    stats: { ...INITIAL_QUIZ_STATS },
    createdAt: now,
    updatedAt: now,
  };
}
