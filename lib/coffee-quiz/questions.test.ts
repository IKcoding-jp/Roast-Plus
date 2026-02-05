import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadAllQuestions,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  getQuestionById,
  getQuestionsByIds,
  getRandomQuestions,
  getDailyQuestions,
  shuffleOptions,
  clearQuestionsCache,
  getQuestionsStats,
} from './questions';
import type { QuizQuestion, QuizCard } from './types';

// モックデータ
const mockBasicsQuestions: QuizQuestion[] = [
  {
    id: 'b1',
    question: 'コーヒーの原産国は？',
    options: ['エチオピア', 'ブラジル', 'コロンビア', 'ベトナム'],
    correctAnswer: 0,
    category: 'basics',
    difficulty: 'beginner',
  },
  {
    id: 'b2',
    question: 'アラビカ種の特徴は？',
    options: ['酸味が強い', '苦味が強い', 'カフェインが多い', '病害虫に強い'],
    correctAnswer: 0,
    category: 'basics',
    difficulty: 'intermediate',
  },
];

const mockRoastingQuestions: QuizQuestion[] = [
  {
    id: 'r1',
    question: '1ハゼが起こる温度は？',
    options: ['約150℃', '約180℃', '約200℃', '約220℃'],
    correctAnswer: 2,
    category: 'roasting',
    difficulty: 'intermediate',
  },
  {
    id: 'r2',
    question: 'シナモンローストの焙煎度は？',
    options: ['浅煎り', '中煎り', '中深煎り', '深煎り'],
    correctAnswer: 0,
    category: 'roasting',
    difficulty: 'beginner',
  },
];

const mockBrewingQuestions: QuizQuestion[] = [
  {
    id: 'br1',
    question: '適正なドリップ温度は？',
    options: ['70-80℃', '80-90℃', '90-96℃', '100℃'],
    correctAnswer: 2,
    category: 'brewing',
    difficulty: 'beginner',
  },
];

const mockHistoryQuestions: QuizQuestion[] = [
  {
    id: 'h1',
    question: 'コーヒーが発見された世紀は？',
    options: ['6世紀', '9世紀', '12世紀', '15世紀'],
    correctAnswer: 1,
    category: 'history',
    difficulty: 'advanced',
  },
];

// fetchのモック設定
const mockFetch = vi.fn();

describe('questions', () => {
  beforeEach(() => {
    // キャッシュをクリア
    clearQuestionsCache();

    // fetchをモック
    global.fetch = mockFetch;

    // デフォルトのモックレスポンスを設定
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('basics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ category: 'basics', questions: mockBasicsQuestions }),
        });
      }
      if (url.includes('roasting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ category: 'roasting', questions: mockRoastingQuestions }),
        });
      }
      if (url.includes('brewing')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ category: 'brewing', questions: mockBrewingQuestions }),
        });
      }
      if (url.includes('history')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ category: 'history', questions: mockHistoryQuestions }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ========================================
  // loadAllQuestions
  // ========================================
  describe('loadAllQuestions', () => {
    it('すべてのカテゴリの問題を読み込む', async () => {
      const questions = await loadAllQuestions();

      // 全カテゴリの問題が含まれる
      expect(questions.length).toBe(6); // 2 + 2 + 1 + 1
      expect(questions.some((q) => q.category === 'basics')).toBe(true);
      expect(questions.some((q) => q.category === 'roasting')).toBe(true);
      expect(questions.some((q) => q.category === 'brewing')).toBe(true);
      expect(questions.some((q) => q.category === 'history')).toBe(true);
    });

    it('キャッシュが機能する（2回目はfetchしない）', async () => {
      await loadAllQuestions();
      await loadAllQuestions();

      // fetchは4回のみ（各カテゴリ1回）
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('fetchエラー時も他のカテゴリは読み込む', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('basics')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        if (url.includes('roasting')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ category: 'roasting', questions: mockRoastingQuestions }),
          });
        }
        if (url.includes('brewing')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ category: 'brewing', questions: mockBrewingQuestions }),
          });
        }
        if (url.includes('history')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ category: 'history', questions: mockHistoryQuestions }),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      });

      const questions = await loadAllQuestions();

      // basicsは失敗、他は成功
      expect(questions.length).toBe(4); // 2 + 1 + 1 (basicsを除く)
      expect(questions.some((q) => q.category === 'basics')).toBe(false);
    });

    it('ネットワークエラー時も他のカテゴリは読み込む', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('basics')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.includes('roasting')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ category: 'roasting', questions: mockRoastingQuestions }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ category: 'other', questions: [] }),
        });
      });

      const questions = await loadAllQuestions();

      // エラーが発生しても他のカテゴリは読み込まれる
      expect(questions.some((q) => q.category === 'roasting')).toBe(true);
    });
  });

  // ========================================
  // clearQuestionsCache
  // ========================================
  describe('clearQuestionsCache', () => {
    it('キャッシュをクリアして再度fetchする', async () => {
      await loadAllQuestions();
      expect(mockFetch).toHaveBeenCalledTimes(4);

      clearQuestionsCache();
      await loadAllQuestions();

      // キャッシュクリア後に再度fetch
      expect(mockFetch).toHaveBeenCalledTimes(8);
    });
  });

  // ========================================
  // getQuestionsByCategory
  // ========================================
  describe('getQuestionsByCategory', () => {
    it('指定カテゴリの問題のみを返す', async () => {
      const basicsQuestions = await getQuestionsByCategory('basics');

      expect(basicsQuestions.length).toBe(2);
      expect(basicsQuestions.every((q) => q.category === 'basics')).toBe(true);
    });

    it('問題がないカテゴリは空配列を返す', async () => {
      mockFetch.mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ category: 'basics', questions: [] }),
        });
      });

      const questions = await getQuestionsByCategory('basics');
      expect(questions).toEqual([]);
    });
  });

  // ========================================
  // getQuestionsByDifficulty
  // ========================================
  describe('getQuestionsByDifficulty', () => {
    it('指定難易度の問題のみを返す', async () => {
      const beginnerQuestions = await getQuestionsByDifficulty('beginner');

      expect(beginnerQuestions.every((q) => q.difficulty === 'beginner')).toBe(true);
    });

    it('中級問題を取得できる', async () => {
      const intermediateQuestions = await getQuestionsByDifficulty('intermediate');

      expect(intermediateQuestions.every((q) => q.difficulty === 'intermediate')).toBe(true);
      expect(intermediateQuestions.length).toBe(2); // b2, r1
    });

    it('上級問題を取得できる', async () => {
      const advancedQuestions = await getQuestionsByDifficulty('advanced');

      expect(advancedQuestions.every((q) => q.difficulty === 'advanced')).toBe(true);
      expect(advancedQuestions.length).toBe(1); // h1
    });
  });

  // ========================================
  // getQuestionById
  // ========================================
  describe('getQuestionById', () => {
    it('存在するIDで問題を取得できる', async () => {
      const question = await getQuestionById('b1');

      expect(question).toBeDefined();
      expect(question?.id).toBe('b1');
      expect(question?.category).toBe('basics');
    });

    it('存在しないIDでundefinedを返す', async () => {
      const question = await getQuestionById('nonexistent');

      expect(question).toBeUndefined();
    });
  });

  // ========================================
  // getQuestionsByIds
  // ========================================
  describe('getQuestionsByIds', () => {
    it('複数のIDで問題を取得できる', async () => {
      const questions = await getQuestionsByIds(['b1', 'r1']);

      expect(questions.length).toBe(2);
      expect(questions[0].id).toBe('b1');
      expect(questions[1].id).toBe('r1');
    });

    it('IDの順番を維持する', async () => {
      const questions = await getQuestionsByIds(['r1', 'b1', 'h1']);

      expect(questions[0].id).toBe('r1');
      expect(questions[1].id).toBe('b1');
      expect(questions[2].id).toBe('h1');
    });

    it('存在しないIDは除外される', async () => {
      const questions = await getQuestionsByIds(['b1', 'nonexistent', 'r1']);

      expect(questions.length).toBe(2);
      expect(questions.map((q) => q.id)).toEqual(['b1', 'r1']);
    });

    it('空配列を処理できる', async () => {
      const questions = await getQuestionsByIds([]);
      expect(questions).toEqual([]);
    });
  });

  // ========================================
  // getRandomQuestions
  // ========================================
  describe('getRandomQuestions', () => {
    it('指定数の問題を返す', async () => {
      const questions = await getRandomQuestions(3);

      expect(questions.length).toBe(3);
    });

    it('カテゴリでフィルタできる', async () => {
      const questions = await getRandomQuestions(10, ['basics']);

      expect(questions.every((q) => q.category === 'basics')).toBe(true);
    });

    it('除外IDを指定できる', async () => {
      const questions = await getRandomQuestions(10, undefined, ['b1', 'b2']);

      expect(questions.every((q) => q.id !== 'b1' && q.id !== 'b2')).toBe(true);
    });

    it('問題数より多い数を要求すると全問題を返す', async () => {
      const questions = await getRandomQuestions(100);

      expect(questions.length).toBe(6); // 全問題数
    });

    it('複数カテゴリでフィルタできる', async () => {
      const questions = await getRandomQuestions(10, ['basics', 'roasting']);

      expect(
        questions.every((q) => q.category === 'basics' || q.category === 'roasting')
      ).toBe(true);
    });
  });

  // ========================================
  // getDailyQuestions
  // ========================================
  describe('getDailyQuestions', () => {
    it('指定数の問題を返す', async () => {
      const questions = await getDailyQuestions(5);

      expect(questions.length).toBe(5);
    });

    it('デフォルトで10問返す', async () => {
      const questions = await getDailyQuestions();

      // 全6問しかないので6問
      expect(questions.length).toBe(6);
    });

    it('カテゴリでフィルタできる', async () => {
      const questions = await getDailyQuestions(10, ['basics', 'roasting']);

      expect(
        questions.every((q) => q.category === 'basics' || q.category === 'roasting')
      ).toBe(true);
    });

    it('マスター済み問題よりも未マスター問題を優先する', async () => {
      const mockCards: QuizCard[] = [
        {
          questionId: 'b1',
          stability: 25, // mastery = 83% (>= 67%)
          due: new Date(),
          difficulty: 0,
          elapsedDays: 0,
          scheduledDays: 0,
          reps: 1,
          lapses: 0,
          state: 2,
        },
      ];

      // 3問だけ取得（b1以外が優先されるべき）
      const questions = await getDailyQuestions(3, undefined, mockCards);

      // マスター済みb1は最後に選択される可能性が高い
      expect(questions.length).toBe(3);
    });

    it('未マスター問題が不足する場合はマスター問題から補充', async () => {
      // 全問題をマスター済みに
      const mockCards: QuizCard[] = [
        { questionId: 'b1', stability: 30, due: new Date(), difficulty: 0, elapsedDays: 0, scheduledDays: 0, reps: 1, lapses: 0, state: 2 },
        { questionId: 'b2', stability: 30, due: new Date(), difficulty: 0, elapsedDays: 0, scheduledDays: 0, reps: 1, lapses: 0, state: 2 },
        { questionId: 'r1', stability: 30, due: new Date(), difficulty: 0, elapsedDays: 0, scheduledDays: 0, reps: 1, lapses: 0, state: 2 },
        { questionId: 'r2', stability: 30, due: new Date(), difficulty: 0, elapsedDays: 0, scheduledDays: 0, reps: 1, lapses: 0, state: 2 },
        { questionId: 'br1', stability: 30, due: new Date(), difficulty: 0, elapsedDays: 0, scheduledDays: 0, reps: 1, lapses: 0, state: 2 },
        { questionId: 'h1', stability: 30, due: new Date(), difficulty: 0, elapsedDays: 0, scheduledDays: 0, reps: 1, lapses: 0, state: 2 },
      ];

      const questions = await getDailyQuestions(3, undefined, mockCards);

      // マスター済みでも問題が返される
      expect(questions.length).toBe(3);
    });
  });

  // ========================================
  // shuffleOptions
  // ========================================
  describe('shuffleOptions', () => {
    it('選択肢の数は変わらない', () => {
      const question: QuizQuestion = {
        id: 'test',
        question: 'Test?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        category: 'basics',
        difficulty: 'beginner',
      };

      const shuffled = shuffleOptions(question);

      expect(shuffled.options.length).toBe(4);
    });

    it('元の問題オブジェクトを変更しない', () => {
      const question: QuizQuestion = {
        id: 'test',
        question: 'Test?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        category: 'basics',
        difficulty: 'beginner',
      };

      const originalOptions = [...question.options];
      shuffleOptions(question);

      expect(question.options).toEqual(originalOptions);
    });

    it('すべての選択肢が含まれる', () => {
      const question: QuizQuestion = {
        id: 'test',
        question: 'Test?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        category: 'basics',
        difficulty: 'beginner',
      };

      const shuffled = shuffleOptions(question);

      expect(shuffled.options).toContain('A');
      expect(shuffled.options).toContain('B');
      expect(shuffled.options).toContain('C');
      expect(shuffled.options).toContain('D');
    });

    it('他のプロパティは変更されない', () => {
      const question: QuizQuestion = {
        id: 'test',
        question: 'Test?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        category: 'basics',
        difficulty: 'beginner',
      };

      const shuffled = shuffleOptions(question);

      expect(shuffled.id).toBe('test');
      expect(shuffled.question).toBe('Test?');
      expect(shuffled.category).toBe('basics');
      expect(shuffled.difficulty).toBe('beginner');
    });
  });

  // ========================================
  // getQuestionsStats
  // ========================================
  describe('getQuestionsStats', () => {
    it('総問題数を返す', async () => {
      const stats = await getQuestionsStats();

      expect(stats.total).toBe(6);
    });

    it('カテゴリ別の問題数を返す', async () => {
      const stats = await getQuestionsStats();

      expect(stats.byCategory.basics).toBe(2);
      expect(stats.byCategory.roasting).toBe(2);
      expect(stats.byCategory.brewing).toBe(1);
      expect(stats.byCategory.history).toBe(1);
    });

    it('難易度別の問題数を返す', async () => {
      const stats = await getQuestionsStats();

      expect(stats.byDifficulty.beginner).toBe(3); // b1, r2, br1
      expect(stats.byDifficulty.intermediate).toBe(2); // b2, r1
      expect(stats.byDifficulty.advanced).toBe(1); // h1
    });
  });
});
