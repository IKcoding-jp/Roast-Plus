import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { QuizQuestion } from '@/lib/coffee-quiz/types';

// モックの定義（ホイスティング対応のため、factoryの中で直接定義）
const mockRecordAnswer = vi.fn().mockResolvedValue({
  xpEarned: 10,
  leveledUp: false,
});

const mockGetDueCardsForReview = vi.fn().mockReturnValue([
  { questionId: 'q1', due: new Date() },
]);

// useQuizDataのモック
vi.mock('./useQuizData', () => ({
  useQuizData: () => ({
    recordAnswer: mockRecordAnswer,
    progress: {
      userId: 'test-user',
      totalXP: 100,
      level: 1,
      xpForNextLevel: 100,
      answeredQuestions: {},
      dailyGoals: [],
      achievements: [],
      streakDays: 0,
      lastActivityDate: '2024-02-05',
      cards: {},
      settings: {
        dailyGoal: 10,
        enabledCategories: ['basics'],
      },
    },
    getDueCardsForReview: mockGetDueCardsForReview,
  }),
}));

// questions.tsのモック（モックデータを直接定義）
vi.mock('@/lib/coffee-quiz/questions', () => ({
  getDailyQuestions: vi.fn().mockResolvedValue([
    {
      id: 'q1',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題1',
      options: [
        { id: 'o1', text: '選択肢1', isCorrect: true },
        { id: 'o2', text: '選択肢2', isCorrect: false },
      ],
      explanation: '説明1',
    },
    {
      id: 'q2',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題2',
      options: [
        { id: 'o3', text: '選択肢3', isCorrect: false },
        { id: 'o4', text: '選択肢4', isCorrect: true },
      ],
      explanation: '説明2',
    },
  ]),
  getRandomQuestions: vi.fn().mockResolvedValue([
    {
      id: 'q1',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題1',
      options: [
        { id: 'o1', text: '選択肢1', isCorrect: true },
        { id: 'o2', text: '選択肢2', isCorrect: false },
      ],
      explanation: '説明1',
    },
    {
      id: 'q2',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題2',
      options: [
        { id: 'o3', text: '選択肢3', isCorrect: false },
        { id: 'o4', text: '選択肢4', isCorrect: true },
      ],
      explanation: '説明2',
    },
  ]),
  getQuestionsByCategory: vi.fn().mockResolvedValue([
    {
      id: 'q1',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題1',
      options: [
        { id: 'o1', text: '選択肢1', isCorrect: true },
        { id: 'o2', text: '選択肢2', isCorrect: false },
      ],
      explanation: '説明1',
    },
    {
      id: 'q2',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題2',
      options: [
        { id: 'o3', text: '選択肢3', isCorrect: false },
        { id: 'o4', text: '選択肢4', isCorrect: true },
      ],
      explanation: '説明2',
    },
  ]),
  getQuestionsByIds: vi.fn().mockResolvedValue([
    {
      id: 'q1',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題1',
      options: [
        { id: 'o1', text: '選択肢1', isCorrect: true },
        { id: 'o2', text: '選択肢2', isCorrect: false },
      ],
      explanation: '説明1',
    },
    {
      id: 'q2',
      category: 'basics',
      difficulty: 'beginner',
      question: '問題2',
      options: [
        { id: 'o3', text: '選択肢3', isCorrect: false },
        { id: 'o4', text: '選択肢4', isCorrect: true },
      ],
      explanation: '説明2',
    },
  ]),
  shuffleOptions: vi.fn((q: QuizQuestion) => q), // シャッフルしない
}));

// crypto.randomUUID()のモック
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-session-id'),
});

// モック後にインポート
import { useQuizSession } from './useQuizSession';

describe('useQuizSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useQuizSession());

      expect(result.current.session).toBeNull();
      expect(result.current.currentQuestion).toBeNull();
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.totalQuestions).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.sessionStats).toEqual({
        correct: 0,
        incorrect: 0,
        totalXP: 0,
        accuracy: 0,
      });
    });
  });

  describe('startSession', () => {
    it('dailyモードでセッションを開始できる', async () => {
      const { result } = renderHook(() => useQuizSession({ mode: 'daily', count: 2 }));

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
      expect(result.current.session?.id).toBe('test-session-id');
      expect(result.current.currentQuestion).not.toBeNull();
      expect(result.current.totalQuestions).toBe(2);
      expect(result.current.questions).toHaveLength(2);
    });

    it('randomモードでセッションを開始できる', async () => {
      const { result } = renderHook(() => useQuizSession({ mode: 'random', count: 2 }));

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
      expect(result.current.questions).toHaveLength(2);
    });

    it('categoryモードでセッションを開始できる', async () => {
      const { result } = renderHook(() =>
        useQuizSession({ mode: 'category', category: 'basics', count: 2 })
      );

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
      expect(result.current.session?.category).toBe('basics');
    });

    it('reviewモードでセッションを開始できる', async () => {
      const { result } = renderHook(() => useQuizSession({ mode: 'review', count: 1 }));

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetDueCardsForReview).toHaveBeenCalled();
      expect(result.current.session).not.toBeNull();
    });

    it('questionIdsを指定してセッションを開始できる', async () => {
      const { result } = renderHook(() =>
        useQuizSession({ mode: 'category', questionIds: ['q1', 'q2'] })
      );

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('正解を送信すると統計が更新される', async () => {
      const { result } = renderHook(() => useQuizSession());

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      // 正解を送信
      await act(async () => {
        await result.current.submitAnswer('o1');
      });

      await waitFor(() => {
        expect(result.current.showFeedback).toBe(true);
      });

      expect(result.current.answerFeedback?.isCorrect).toBe(true);
      expect(result.current.sessionStats.correct).toBe(1);
      expect(result.current.sessionStats.incorrect).toBe(0);
      expect(result.current.sessionStats.totalXP).toBe(10);
      expect(mockRecordAnswer).toHaveBeenCalled();
    });

    it('不正解を送信すると統計が更新される', async () => {
      const { result } = renderHook(() => useQuizSession());

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      // 不正解を送信
      await act(async () => {
        await result.current.submitAnswer('o2');
      });

      await waitFor(() => {
        expect(result.current.showFeedback).toBe(true);
      });

      expect(result.current.answerFeedback?.isCorrect).toBe(false);
      expect(result.current.sessionStats.correct).toBe(0);
      expect(result.current.sessionStats.incorrect).toBe(1);
    });

    it('フィードバック表示中は回答を送信できない', async () => {
      const { result } = renderHook(() => useQuizSession());

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      // 1回目の回答
      await act(async () => {
        await result.current.submitAnswer('o1');
      });

      await waitFor(() => {
        expect(result.current.showFeedback).toBe(true);
      });

      const callCount = mockRecordAnswer.mock.calls.length;

      // 2回目の回答（無視される）
      await act(async () => {
        await result.current.submitAnswer('o2');
      });

      // recordAnswerは追加で呼ばれない
      expect(mockRecordAnswer).toHaveBeenCalledTimes(callCount);
    });
  });

  describe('nextQuestion', () => {
    it('次の問題に進める', async () => {
      const { result } = renderHook(() => useQuizSession());

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      const firstQuestionId = result.current.currentQuestion?.id;

      // 回答
      await act(async () => {
        await result.current.submitAnswer('o1');
      });

      await waitFor(() => {
        expect(result.current.showFeedback).toBe(true);
      });

      // 次の問題へ
      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.showFeedback).toBe(false);
      expect(result.current.answerFeedback).toBeNull();
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentQuestion?.id).not.toBe(firstQuestionId);
    });

    it('最後の問題の後はセッションが完了する', async () => {
      // getDailyQuestionsモックを1問だけ返すように変更
      const { getDailyQuestions } = await import('@/lib/coffee-quiz/questions');
      vi.mocked(getDailyQuestions).mockResolvedValueOnce([
        {
          id: 'q1',
          category: 'basics',
          difficulty: 'beginner',
          question: '問題1',
          options: [
            { id: 'o1', text: '選択肢1', isCorrect: true },
            { id: 'o2', text: '選択肢2', isCorrect: false },
          ],
          explanation: '説明1',
        },
      ]);

      const { result } = renderHook(() => useQuizSession({ count: 1 }));

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      // 回答
      await act(async () => {
        await result.current.submitAnswer('o1');
      });

      // 次へ進む（最後の問題）
      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.isComplete).toBe(true);
      expect(result.current.session?.completedAt).toBeDefined();
    });
  });

  describe('resetSession', () => {
    it('セッションをリセットできる', async () => {
      const { result } = renderHook(() => useQuizSession());

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.session).not.toBeNull();
      });

      // リセット
      act(() => {
        result.current.resetSession();
      });

      expect(result.current.session).toBeNull();
      expect(result.current.currentQuestion).toBeNull();
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.totalQuestions).toBe(0);
      expect(result.current.isComplete).toBe(false);
      expect(result.current.sessionStats).toEqual({
        correct: 0,
        incorrect: 0,
        totalXP: 0,
        accuracy: 0,
      });
    });
  });

  describe('startSession - 追加モード', () => {
    it('singleモードでquestionIdsを指定してセッションを開始できる', async () => {
      const { result } = renderHook(() =>
        useQuizSession({ mode: 'single', questionIds: ['q1', 'q2'] })
      );

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
      expect(result.current.totalQuestions).toBe(2);
    });

    it('shuffleモードでquestionIdsを指定してセッションを開始できる', async () => {
      const { result } = renderHook(() =>
        useQuizSession({ mode: 'shuffle', questionIds: ['q1'] })
      );

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
    });

    it('sequentialモードでquestionIdsを指定してセッションを開始できる', async () => {
      const { result } = renderHook(() =>
        useQuizSession({ mode: 'sequential', questionIds: ['q1', 'q2'] })
      );

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
      expect(result.current.totalQuestions).toBe(2);
    });

    it('single/shuffle/sequentialモードでquestionIdsが空の場合はセッションが空で開始', async () => {
      const { result } = renderHook(() =>
        useQuizSession({ mode: 'single', questionIds: [] })
      );

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).not.toBeNull();
      expect(result.current.totalQuestions).toBe(0);
      expect(result.current.isComplete).toBe(true);
    });

    it('セッション開始時にエラーが発生した場合isLoadingがfalseに戻る', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // getDailyQuestionsでエラーを投げる
      const { getDailyQuestions } = await import('@/lib/coffee-quiz/questions');
      vi.mocked(getDailyQuestions).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useQuizSession({ mode: 'daily' }));

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to start quiz session:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('統計計算', () => {
    it('正解率が正しく計算される', async () => {
      const { result } = renderHook(() => useQuizSession());

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      // 1問目: 正解
      await act(async () => {
        await result.current.submitAnswer('o1');
      });

      act(() => {
        result.current.nextQuestion();
      });

      // 2問目: 不正解
      await act(async () => {
        await result.current.submitAnswer('o3'); // 不正解
      });

      await waitFor(() => {
        expect(result.current.sessionStats.accuracy).toBe(50); // 1/2 = 50%
      });
    });

    it('XPが累積される', async () => {
      const { result } = renderHook(() => useQuizSession());

      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      // 1問目
      await act(async () => {
        await result.current.submitAnswer('o1');
      });

      expect(result.current.sessionStats.totalXP).toBe(10);

      act(() => {
        result.current.nextQuestion();
      });

      // 2問目
      await act(async () => {
        await result.current.submitAnswer('o4');
      });

      await waitFor(() => {
        expect(result.current.sessionStats.totalXP).toBe(20); // 10 + 10
      });
    });
  });

  describe('実際のユースケース', () => {
    it('完全なクイズフロー: 開始 → 回答 → 次へ → 完了', async () => {
      const { result } = renderHook(() => useQuizSession({ count: 2 }));

      // セッション開始
      await act(async () => {
        await result.current.startSession();
      });

      await waitFor(() => {
        expect(result.current.currentQuestion).not.toBeNull();
      });

      expect(result.current.totalQuestions).toBe(2);
      expect(result.current.currentIndex).toBe(0);

      // 1問目回答
      await act(async () => {
        await result.current.submitAnswer('o1');
      });

      await waitFor(() => {
        expect(result.current.showFeedback).toBe(true);
      });

      expect(result.current.sessionStats.correct).toBe(1);

      // 次へ
      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.showFeedback).toBe(false);

      // 2問目回答
      await act(async () => {
        await result.current.submitAnswer('o4');
      });

      await waitFor(() => {
        expect(result.current.showFeedback).toBe(true);
      });

      expect(result.current.sessionStats.correct).toBe(2);

      // 完了
      act(() => {
        result.current.nextQuestion();
      });

      expect(result.current.isComplete).toBe(true);
      expect(result.current.session?.completedAt).toBeDefined();
      expect(result.current.sessionStats.accuracy).toBe(100);
    });
  });
});
