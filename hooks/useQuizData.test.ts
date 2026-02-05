import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizData } from './useQuizData';
import type { AnswerResult } from './useQuizData';
import type { QuizProgress, QuizCard, QuizQuestion } from '@/types';

// モックデータを定義
const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'basics',
    difficulty: 'beginner',
    question: 'テスト問題1',
    options: [
      { id: 'opt1', text: '正解', isCorrect: true },
      { id: 'opt2', text: '不正解', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    category: 'roasting',
    difficulty: 'intermediate',
    question: 'テスト問題2',
    options: [
      { id: 'opt3', text: '正解', isCorrect: true },
      { id: 'opt4', text: '不正解', isCorrect: false },
    ],
  },
];

const mockInitialProgress: QuizProgress = {
  userId: 'local',
  cards: [],
  checkmarks: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  },
  level: {
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: 100,
  },
  earnedBadges: [],
  dailyGoals: [],
  settings: {
    dailyGoal: 10,
    notificationsEnabled: false,
  },
  stats: {
    totalAnswered: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    masteredQuestions: 0,
    categoryStats: {
      basics: { answered: 0, correct: 0, incorrect: 0 },
      roasting: { answered: 0, correct: 0, incorrect: 0 },
      brewing: { answered: 0, correct: 0, incorrect: 0 },
      history: { answered: 0, correct: 0, incorrect: 0 },
    },
    difficultyStats: {
      beginner: { answered: 0, correct: 0, incorrect: 0 },
      intermediate: { answered: 0, correct: 0, incorrect: 0 },
      advanced: { answered: 0, correct: 0, incorrect: 0 },
    },
    weeklyActivity: [],
    byCategory: {
      basics: { answered: 0, correct: 0, incorrect: 0 },
      roasting: { answered: 0, correct: 0, incorrect: 0 },
      brewing: { answered: 0, correct: 0, incorrect: 0 },
      history: { answered: 0, correct: 0, incorrect: 0 },
    },
    byDifficulty: {
      beginner: { answered: 0, correct: 0, incorrect: 0 },
      intermediate: { answered: 0, correct: 0, incorrect: 0 },
      advanced: { answered: 0, correct: 0, incorrect: 0 },
    },
  },
  createdAt: '2024-02-05T00:00:00.000Z',
  updatedAt: '2024-02-05T00:00:00.000Z',
};

const mockCard: QuizCard = {
  questionId: 'q1',
  state: {
    stability: 1,
    difficulty: 5,
  },
  due: new Date('2024-02-06T00:00:00.000Z').toISOString(),
  lastReview: new Date('2024-02-05T00:00:00.000Z').toISOString(),
  hasAnsweredCorrectly: false,
};

// localStorage モック
const mockGetQuizProgress = vi.fn();
const mockSetQuizProgress = vi.fn();

// questions モック
const mockGetAllQuestions = vi.fn();
const mockLoadAllQuestions = vi.fn();
const mockGetQuestionsStats = vi.fn();
const mockGetQuestionById = vi.fn();

// FSRS モック
const mockCreateQuizCard = vi.fn();
const mockReviewCard = vi.fn();
const mockDetermineRating = vi.fn();
const mockGetDueCards = vi.fn();
const mockSortCardsByPriority = vi.fn();
const mockGetCardMastery = vi.fn();
const mockIsCardMastered = vi.fn();

// gamification モック
const mockCalculateXP = vi.fn();
const mockAddXP = vi.fn();
const mockUpdateStreak = vi.fn();
const mockUpdateStats = vi.fn();
const mockUpdateDailyGoal = vi.fn();
const mockGetTodayGoal = vi.fn();
const mockCheckNewBadges = vi.fn();
const mockEarnBadges = vi.fn();

// 定数モック
const MOCK_INITIAL_STREAK_INFO = {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
};

const MOCK_INITIAL_LEVEL_INFO = {
  currentLevel: 1,
  currentXP: 0,
  xpToNextLevel: 100,
};

const MOCK_DEFAULT_QUIZ_SETTINGS = {
  dailyGoal: 10,
  notificationsEnabled: false,
};

const MOCK_INITIAL_QUIZ_STATS = {
  totalAnswered: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  masteredQuestions: 0,
  categoryStats: {
    basics: { answered: 0, correct: 0, incorrect: 0 },
    roasting: { answered: 0, correct: 0, incorrect: 0 },
    brewing: { answered: 0, correct: 0, incorrect: 0 },
    history: { answered: 0, correct: 0, incorrect: 0 },
  },
  difficultyStats: {
    beginner: { answered: 0, correct: 0, incorrect: 0 },
    intermediate: { answered: 0, correct: 0, incorrect: 0 },
    advanced: { answered: 0, correct: 0, incorrect: 0 },
  },
  weeklyActivity: [],
  byCategory: {
    basics: { answered: 0, correct: 0, incorrect: 0 },
    roasting: { answered: 0, correct: 0, incorrect: 0 },
    brewing: { answered: 0, correct: 0, incorrect: 0 },
    history: { answered: 0, correct: 0, incorrect: 0 },
  },
  byDifficulty: {
    beginner: { answered: 0, correct: 0, incorrect: 0 },
    intermediate: { answered: 0, correct: 0, incorrect: 0 },
    advanced: { answered: 0, correct: 0, incorrect: 0 },
  },
};

vi.mock('@/lib/localStorage', () => ({
  getQuizProgress: () => mockGetQuizProgress(),
  setQuizProgress: (progress: QuizProgress) => mockSetQuizProgress(progress),
}));

vi.mock('@/lib/coffee-quiz/questions', () => ({
  getAllQuestions: () => mockGetAllQuestions(),
  loadAllQuestions: () => mockLoadAllQuestions(),
  getQuestionsStats: () => mockGetQuestionsStats(),
  getQuestionById: (id: string) => mockGetQuestionById(id),
}));

vi.mock('@/lib/coffee-quiz/fsrs', () => ({
  createQuizCard: (questionId: string) => mockCreateQuizCard(questionId),
  reviewCard: (card: QuizCard, rating: number) => mockReviewCard(card, rating),
  determineRating: (isCorrect: boolean, responseTimeMs: number) =>
    mockDetermineRating(isCorrect, responseTimeMs),
  getDueCards: (cards: QuizCard[]) => mockGetDueCards(cards),
  sortCardsByPriority: (cards: QuizCard[]) => mockSortCardsByPriority(cards),
  getCardMastery: (card: QuizCard) => mockGetCardMastery(card),
  isCardMastered: (card: QuizCard) => mockIsCardMastered(card),
}));

vi.mock('@/lib/coffee-quiz/gamification', () => ({
  calculateXP: (params: unknown) => mockCalculateXP(params),
  addXP: (level: unknown, xp: number) => mockAddXP(level, xp),
  updateStreak: (streak: unknown) => mockUpdateStreak(streak),
  updateStats: (stats: unknown, isCorrect: boolean, category: string, difficulty: string, mastered: boolean) =>
    mockUpdateStats(stats, isCorrect, category, difficulty, mastered),
  updateDailyGoal: (dailyGoals: unknown[], isCorrect: boolean, xp: number, goalTarget: number) =>
    mockUpdateDailyGoal(dailyGoals, isCorrect, xp, goalTarget),
  getTodayGoal: (dailyGoals: unknown[]) => mockGetTodayGoal(dailyGoals),
  checkNewBadges: (params: unknown) => mockCheckNewBadges(params),
  earnBadges: (earnedBadges: unknown[], newBadgeTypes: string[]) =>
    mockEarnBadges(earnedBadges, newBadgeTypes),
}));

vi.mock('@/lib/coffee-quiz/types', () => ({
  INITIAL_STREAK_INFO: {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  },
  INITIAL_LEVEL_INFO: {
    currentLevel: 1,
    currentXP: 0,
    xpToNextLevel: 100,
  },
  DEFAULT_QUIZ_SETTINGS: {
    dailyGoal: 10,
    notificationsEnabled: false,
  },
  INITIAL_QUIZ_STATS: {
    totalAnswered: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    masteredQuestions: 0,
    categoryStats: {
      basics: { answered: 0, correct: 0, incorrect: 0 },
      roasting: { answered: 0, correct: 0, incorrect: 0 },
      brewing: { answered: 0, correct: 0, incorrect: 0 },
      history: { answered: 0, correct: 0, incorrect: 0 },
    },
    difficultyStats: {
      beginner: { answered: 0, correct: 0, incorrect: 0 },
      intermediate: { answered: 0, correct: 0, incorrect: 0 },
      advanced: { answered: 0, correct: 0, incorrect: 0 },
    },
    weeklyActivity: [],
    byCategory: {
      basics: { answered: 0, correct: 0, incorrect: 0 },
      roasting: { answered: 0, correct: 0, incorrect: 0 },
      brewing: { answered: 0, correct: 0, incorrect: 0 },
      history: { answered: 0, correct: 0, incorrect: 0 },
    },
    byDifficulty: {
      beginner: { answered: 0, correct: 0, incorrect: 0 },
      intermediate: { answered: 0, correct: 0, incorrect: 0 },
      advanced: { answered: 0, correct: 0, incorrect: 0 },
    },
  },
}));

describe('useQuizData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-02-05T12:00:00.000Z'));

    // デフォルトのモック実装
    mockGetQuizProgress.mockReturnValue(mockInitialProgress);
    mockSetQuizProgress.mockImplementation(() => {});
    mockGetAllQuestions.mockReturnValue(mockQuestions);
    mockLoadAllQuestions.mockResolvedValue(mockQuestions);
    mockGetQuestionsStats.mockResolvedValue({
      total: 2,
      masteredCount: 0,
      answeredCorrectlyCount: 0,
    });
    mockGetQuestionById.mockImplementation((id: string) => {
      return Promise.resolve(mockQuestions.find((q) => q.id === id));
    });

    mockCreateQuizCard.mockImplementation((questionId: string) => ({
      ...mockCard,
      questionId,
    }));
    mockReviewCard.mockReturnValue({ card: { ...mockCard, state: { stability: 2, difficulty: 4 } } });
    mockDetermineRating.mockReturnValue(4);
    mockGetDueCards.mockReturnValue([]);
    mockSortCardsByPriority.mockImplementation((cards) => cards);
    mockGetCardMastery.mockReturnValue(0);
    mockIsCardMastered.mockReturnValue(false);

    mockCalculateXP.mockReturnValue(10);
    mockAddXP.mockReturnValue({
      newLevelInfo: { currentLevel: 1, currentXP: 10, xpToNextLevel: 100 },
      leveledUp: false,
      newLevel: 1,
    });
    mockUpdateStreak.mockReturnValue({
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: '2024-02-05',
    });
    mockUpdateStats.mockReturnValue(mockInitialProgress.stats);
    mockUpdateDailyGoal.mockReturnValue([]);
    mockGetTodayGoal.mockReturnValue(null);
    mockCheckNewBadges.mockReturnValue([]);
    mockEarnBadges.mockReturnValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('localStorageから進捗をロードする', async () => {
      const { result } = renderHook(() => useQuizData());

      // isHydratedがtrueになるまで待つ
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockGetQuizProgress).toHaveBeenCalled();
      expect(result.current.progress).toEqual(mockInitialProgress);
    });

    it('localStorageに進捗がない場合は初期進捗を作成する', async () => {
      mockGetQuizProgress.mockReturnValue(null);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.progress).toBeDefined();
      expect(result.current.progress?.userId).toBe('local');
      expect(result.current.progress?.cards).toEqual([]);
    });

    it('loadingとerrorが初期化される', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('isAuthenticatedが常にtrueを返す', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('recordAnswer', () => {
    it('正解を記録できる', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      let recordResult: AnswerResult;
      await act(async () => {
        recordResult = await result.current.recordAnswer('q1', 'opt1', 5000);
      });

      expect(recordResult.isCorrect).toBe(true);
      expect(mockCreateQuizCard).toHaveBeenCalledWith('q1');
      expect(mockDetermineRating).toHaveBeenCalledWith(true, 5000);
      expect(mockReviewCard).toHaveBeenCalled();
    });

    it('不正解を記録できる', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      let recordResult: AnswerResult;
      await act(async () => {
        recordResult = await result.current.recordAnswer('q1', 'opt2', 3000);
      });

      expect(recordResult.isCorrect).toBe(false);
      expect(mockDetermineRating).toHaveBeenCalledWith(false, 3000);
    });

    it('XPを計算する', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockCalculateXP.mockReturnValue(15);

      let recordResult: AnswerResult;
      await act(async () => {
        recordResult = await result.current.recordAnswer('q1', 'opt1', 5000);
      });

      expect(mockCalculateXP).toHaveBeenCalledWith({
        isCorrect: true,
        difficulty: 'beginner',
        responseTimeMs: 5000,
        isFirstTime: true,
        consecutiveCorrect: 1,
      });
      expect(recordResult.xpEarned).toBe(15);
    });

    it('レベルアップを検出する', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockAddXP.mockReturnValue({
        newLevelInfo: { currentLevel: 2, currentXP: 0, xpToNextLevel: 200 },
        leveledUp: true,
        newLevel: 2,
      });

      let recordResult: AnswerResult;
      await act(async () => {
        recordResult = await result.current.recordAnswer('q1', 'opt1', 5000);
      });

      expect(recordResult.leveledUp).toBe(true);
      expect(recordResult.newLevel).toBe(2);
    });

    it('バッジ獲得を検出する', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockCheckNewBadges.mockReturnValue(['first_correct']);
      mockEarnBadges.mockReturnValue([
        { type: 'first_correct', earnedAt: '2024-02-05T12:00:00.000Z' },
      ]);

      let recordResult: AnswerResult;
      await act(async () => {
        recordResult = await result.current.recordAnswer('q1', 'opt1', 5000);
      });

      expect(recordResult.newBadges).toHaveLength(1);
      expect(recordResult.newBadges[0].type).toBe('first_correct');
    });

    it('ストリーク更新を検出する', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockUpdateStreak.mockReturnValue({
        currentStreak: 2,
        longestStreak: 2,
        lastStudyDate: '2024-02-05',
      });

      let recordResult: AnswerResult;
      await act(async () => {
        recordResult = await result.current.recordAnswer('q1', 'opt1', 5000);
      });

      expect(recordResult.streakUpdated).toBe(true);
    });

    it('既存のカードを更新できる', async () => {
      const progressWithCard: QuizProgress = {
        ...mockInitialProgress,
        cards: [mockCard],
      };
      mockGetQuizProgress.mockReturnValue(progressWithCard);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        await result.current.recordAnswer('q1', 'opt1', 5000);
      });

      // createQuizCardではなくreviewCardが呼ばれる
      expect(mockReviewCard).toHaveBeenCalled();
    });
  });

  describe('getDueCardsForReview', () => {
    it('復習が必要なカードを取得する', async () => {
      const dueCards = [mockCard];
      mockGetDueCards.mockReturnValue(dueCards);
      mockSortCardsByPriority.mockReturnValue(dueCards);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const cards = result.current.getDueCardsForReview();

      expect(mockGetDueCards).toHaveBeenCalledWith([]);
      expect(mockSortCardsByPriority).toHaveBeenCalledWith(dueCards);
      expect(cards).toEqual(dueCards);
    });

    it('進捗がない場合は空配列を返す', async () => {
      mockGetQuizProgress.mockReturnValue(null);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const cards = result.current.getDueCardsForReview();

      expect(cards).toEqual([]);
    });
  });

  describe('updateSettings', () => {
    it('設定を更新できる', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        await result.current.updateSettings({ dailyGoal: 20 });
      });

      // デバウンス後に保存される
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });

      const lastCall = mockSetQuizProgress.mock.calls[mockSetQuizProgress.mock.calls.length - 1];
      expect(lastCall[0].settings.dailyGoal).toBe(20);
    });

    it('進捗がない場合は何もしない', async () => {
      mockGetQuizProgress.mockReturnValue(null);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const initialCallCount = mockSetQuizProgress.mock.calls.length;

      await act(async () => {
        await result.current.updateSettings({ dailyGoal: 20 });
      });

      expect(mockSetQuizProgress.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('todayGoal', () => {
    it('今日のゴールを取得できる', async () => {
      const mockTodayGoal = {
        date: '2024-02-05',
        completedQuestions: 5,
        correctAnswers: 4,
        earnedXP: 50,
      };
      mockGetTodayGoal.mockReturnValue(mockTodayGoal);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockGetTodayGoal).toHaveBeenCalled();
      expect(result.current.todayGoal).toEqual(mockTodayGoal);
    });

    it('進捗がない場合はnullを返す', async () => {
      mockGetQuizProgress.mockReturnValue(null);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.todayGoal).toBeNull();
    });
  });

  describe('categoryMasteryStats', () => {
    it('カテゴリ別の定着率を計算する', async () => {
      const cardsWithMastery: QuizCard[] = [
        { ...mockCard, questionId: 'q1' },
        { ...mockCard, questionId: 'q2' },
      ];
      const progressWithCards: QuizProgress = {
        ...mockInitialProgress,
        cards: cardsWithMastery,
      };
      mockGetQuizProgress.mockReturnValue(progressWithCards);

      mockGetCardMastery.mockReturnValue(50);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.categoryMasteryStats.basics.averageMastery).toBe(50);
      expect(result.current.categoryMasteryStats.roasting.averageMastery).toBe(50);
    });

    it('定着済み問題数を計算する', async () => {
      const cardsWithMastery: QuizCard[] = [
        { ...mockCard, questionId: 'q1' },
        { ...mockCard, questionId: 'q2' },
      ];
      const progressWithCards: QuizProgress = {
        ...mockInitialProgress,
        cards: cardsWithMastery,
      };
      mockGetQuizProgress.mockReturnValue(progressWithCards);

      mockGetCardMastery.mockImplementation((card: QuizCard) => {
        return card.questionId === 'q1' ? 70 : 50; // q1のみ定着済み(67%以上)
      });

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.categoryMasteryStats.basics.masteredCount).toBe(1);
    });

    it('正解済み問題数を計算する', async () => {
      const cardsWithAnswers: QuizCard[] = [
        { ...mockCard, questionId: 'q1', hasAnsweredCorrectly: true },
        { ...mockCard, questionId: 'q2', hasAnsweredCorrectly: false },
      ];
      const progressWithCards: QuizProgress = {
        ...mockInitialProgress,
        cards: cardsWithAnswers,
      };
      mockGetQuizProgress.mockReturnValue(progressWithCards);

      mockGetCardMastery.mockReturnValue(50);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.categoryMasteryStats.basics.answeredCorrectlyCount).toBe(1);
    });
  });

  describe('difficultyMasteryStats', () => {
    it('難易度別の定着率を計算する', async () => {
      const cardsWithMastery: QuizCard[] = [
        { ...mockCard, questionId: 'q1' },
        { ...mockCard, questionId: 'q2' },
      ];
      const progressWithCards: QuizProgress = {
        ...mockInitialProgress,
        cards: cardsWithMastery,
      };
      mockGetQuizProgress.mockReturnValue(progressWithCards);

      mockGetCardMastery.mockReturnValue(40);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.difficultyMasteryStats.beginner.averageMastery).toBe(40);
      expect(result.current.difficultyMasteryStats.intermediate.averageMastery).toBe(40);
    });

    it('定着済み問題数を計算する', async () => {
      const cardsWithMastery: QuizCard[] = [
        { ...mockCard, questionId: 'q1' },
        { ...mockCard, questionId: 'q2' },
      ];
      const progressWithCards: QuizProgress = {
        ...mockInitialProgress,
        cards: cardsWithMastery,
      };
      mockGetQuizProgress.mockReturnValue(progressWithCards);

      mockGetCardMastery.mockImplementation((card: QuizCard) => {
        return card.questionId === 'q1' ? 80 : 50; // q1のみ定着済み
      });

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.difficultyMasteryStats.beginner.masteredCount).toBe(1);
      expect(result.current.difficultyMasteryStats.intermediate.masteredCount).toBe(0);
    });
  });

  describe('resetProgress', () => {
    it('進捗をリセットできる', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.resetProgress();
      });

      expect(mockSetQuizProgress).toHaveBeenCalled();
      const lastCall = mockSetQuizProgress.mock.calls[mockSetQuizProgress.mock.calls.length - 1];
      expect(lastCall[0].cards).toEqual([]);
      expect(lastCall[0].userId).toBe('local');
    });
  });

  describe('refreshProgress', () => {
    it('localStorageから進捗を再読み込みできる', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const updatedProgress: QuizProgress = {
        ...mockInitialProgress,
        stats: {
          ...mockInitialProgress.stats,
          totalAnswered: 10,
        },
      };
      mockGetQuizProgress.mockReturnValue(updatedProgress);

      act(() => {
        result.current.refreshProgress();
      });

      expect(result.current.progress?.stats.totalAnswered).toBe(10);
    });

    it('エラー時にコンソールエラーを出力する', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      mockGetQuizProgress.mockImplementation(() => {
        throw new Error('Failed to load');
      });

      act(() => {
        result.current.refreshProgress();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to refresh quiz progress:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('実際のユースケース', () => {
    it('クイズセッション: 連続回答とゲーミフィケーション', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // 1問目: 正解
      await act(async () => {
        await result.current.recordAnswer('q1', 'opt1', 5000);
      });

      // 2問目: 正解でレベルアップ
      mockAddXP.mockReturnValue({
        newLevelInfo: { currentLevel: 2, currentXP: 0, xpToNextLevel: 200 },
        leveledUp: true,
        newLevel: 2,
      });

      let result2: AnswerResult;
      await act(async () => {
        result2 = await result.current.recordAnswer('q2', 'opt3', 4000);
      });

      expect(result2.leveledUp).toBe(true);
    });

    it('復習システム: 期限切れカードを取得', async () => {
      const progressWithCards: QuizProgress = {
        ...mockInitialProgress,
        cards: [mockCard],
      };
      mockGetQuizProgress.mockReturnValue(progressWithCards);

      const dueCards = [mockCard];
      mockGetDueCards.mockReturnValue(dueCards);
      mockSortCardsByPriority.mockReturnValue(dueCards);

      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const cards = result.current.getDueCardsForReview();

      expect(cards).toHaveLength(1);
      expect(cards[0].questionId).toBe('q1');
    });

    it('設定管理: デイリーゴールを変更', async () => {
      const { result } = renderHook(() => useQuizData());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      await act(async () => {
        await result.current.updateSettings({ dailyGoal: 15 });
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runAllTimersAsync();
      });

      const lastCall = mockSetQuizProgress.mock.calls[mockSetQuizProgress.mock.calls.length - 1];
      expect(lastCall[0].settings.dailyGoal).toBe(15);
    });
  });
});
