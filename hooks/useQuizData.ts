'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getQuizProgress, setQuizProgress as saveToLocalStorage } from '@/lib/localStorage';
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
import { getQuestionById, getQuestionsStats, loadAllQuestions } from '@/lib/coffee-quiz/questions';
import type { QuizDifficulty } from '@/lib/coffee-quiz/types';

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
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [questionsStats, setQuestionsStats] = useState<QuestionsStats | null>(null);
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<QuizProgress | null>(null);

  // SSR対策: クライアントサイドでのみlocalStorageを使用
  // useEffect内でのsetStateはハイドレーション完了を検知する標準パターン
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

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

  // localStorageからデータを読み込み
  useEffect(() => {
    if (!isHydrated) return;

    try {
      const stored = getQuizProgress();
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(stored);
      } else {
        // 初期データを作成
        const initialProgress = createInitialProgress();
         
        setProgress(initialProgress);
        saveToLocalStorage(initialProgress);
      }
    } catch (err) {
      console.error('Failed to load quiz progress:', err);
       
      setError(err as Error);
    }
     
    setLoading(false);
  }, [isHydrated]);

  // デバウンス付き保存
  const saveProgress = useCallback(
    (newProgress: QuizProgress) => {
      pendingSaveRef.current = newProgress;
      setProgress(newProgress);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          saveToLocalStorage({
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
    []
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

      // 正解時にhasAnsweredCorrectlyフラグを設定（一度trueになったら変更しない）
      if (isCorrect) {
        updatedCard.hasAnsweredCorrectly = true;
      } else if (card.hasAnsweredCorrectly) {
        // 既存のフラグを維持
        updatedCard.hasAnsweredCorrectly = true;
      }

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

  // カテゴリ別平均定着率と定着済み問題数を計算
  const categoryMasteryStats: Record<QuizCategory, { averageMastery: number; masteredCount: number; answeredCorrectlyCount: number }> = (() => {
    const categories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];
    const result: Record<QuizCategory, { averageMastery: number; masteredCount: number; answeredCorrectlyCount: number }> = {
      basics: { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 },
      roasting: { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 },
      brewing: { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 },
      history: { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 },
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

      if (categoryQuestionIds.length === 0) {
        result[category] = { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 };
        continue;
      }

      // 平均定着率を計算（未学習の問題も含めた全問題数で計算）
      const totalMastery = categoryCards.reduce(
        (sum, card) => sum + getCardMastery(card),
        0
      );
      // 定着済み問題数を計算（67%以上で定着済み＝マスター）
      const masteredCount = categoryCards.filter(
        (card) => getCardMastery(card) >= 67
      ).length;
      // 一度でも正解した問題数を計算（X/75問の表示用）
      const answeredCorrectlyCount = categoryCards.filter(
        (card) => card.hasAnsweredCorrectly === true
      ).length;

      result[category] = {
        averageMastery: Math.round(totalMastery / categoryQuestionIds.length),
        masteredCount,
        answeredCorrectlyCount,
      };
    }

    return result;
  })();

  // 難易度別平均定着率と定着済み問題数を計算
  const difficultyMasteryStats: Record<QuizDifficulty, { averageMastery: number; masteredCount: number; answeredCorrectlyCount: number }> = (() => {
    const difficulties: QuizDifficulty[] = ['beginner', 'intermediate', 'advanced'];
    const result: Record<QuizDifficulty, { averageMastery: number; masteredCount: number; answeredCorrectlyCount: number }> = {
      beginner: { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 },
      intermediate: { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 },
      advanced: { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 },
    };

    if (!progress || allQuestions.length === 0) return result;

    for (const difficulty of difficulties) {
      // この難易度の問題IDを取得
      const difficultyQuestionIds = allQuestions
        .filter((q) => q.difficulty === difficulty)
        .map((q) => q.id);

      // この難易度のカードを取得
      const difficultyCards = progress.cards.filter((c) =>
        difficultyQuestionIds.includes(c.questionId)
      );

      if (difficultyQuestionIds.length === 0) {
        result[difficulty] = { averageMastery: 0, masteredCount: 0, answeredCorrectlyCount: 0 };
        continue;
      }

      // 平均定着率を計算（未学習の問題も含めた全問題数で計算）
      const totalMastery = difficultyCards.reduce(
        (sum, card) => sum + getCardMastery(card),
        0
      );
      // 定着済み問題数を計算（67%以上で定着済み＝マスター）
      const masteredCount = difficultyCards.filter(
        (card) => getCardMastery(card) >= 67
      ).length;
      // 一度でも正解した問題数を計算
      const answeredCorrectlyCount = difficultyCards.filter(
        (card) => card.hasAnsweredCorrectly === true
      ).length;

      result[difficulty] = {
        averageMastery: Math.round(totalMastery / difficultyQuestionIds.length),
        masteredCount,
        answeredCorrectlyCount,
      };
    }

    return result;
  })();

  // 進捗をリセット
  const resetProgress = useCallback(() => {
    const initialProgress = createInitialProgress();
    saveToLocalStorage(initialProgress);
    setProgress(initialProgress);
  }, []);

  // localStorageから進捗を再読み込み
  const refreshProgress = useCallback(() => {
    if (!isHydrated) return;
    try {
      const stored = getQuizProgress();
      if (stored) {
        setProgress(stored);
      }
    } catch (err) {
      console.error('Failed to refresh quiz progress:', err);
    }
  }, [isHydrated]);

  return {
    progress,
    loading,
    error,
    recordAnswer,
    getDueCardsForReview,
    updateSettings,
    todayGoal,
    isAuthenticated: true, // localStorageベースなので常にtrue
    questionsStats,
    categoryMasteryStats,
    difficultyMasteryStats,
    resetProgress,
    refreshProgress,
  };
}

// 初期Progressを作成
function createInitialProgress(): QuizProgress {
  const now = new Date().toISOString();
  return {
    userId: 'local', // localStorageベースなので固定値
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
