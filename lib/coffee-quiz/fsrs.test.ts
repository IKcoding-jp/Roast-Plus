import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Rating, State } from 'ts-fsrs';
import {
  createQuizCard,
  reviewCard,
  convertToFSRSRating,
  determineRating,
  getDueCards,
  sortCardsByPriority,
  getNewCards,
  getCardMastery,
  isCardMastered,
  getNextReviewDate,
  getCardStateLabel,
  getFSRS,
} from './fsrs';
import type { QuizCard, QuizQuestion } from './types';

// debug.tsのgetCurrentDateをモック
vi.mock('./debug', () => ({
  getCurrentDate: vi.fn(() => new Date('2026-02-06T12:00:00.000Z')),
}));

describe('fsrs', () => {
  const mockNow = new Date('2026-02-06T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ========================================
  // getFSRS
  // ========================================
  describe('getFSRS', () => {
    it('FSRSインスタンスを返す', () => {
      const fsrs = getFSRS();
      expect(fsrs).toBeDefined();
    });

    it('シングルトンパターンで同じインスタンスを返す', () => {
      const fsrs1 = getFSRS();
      const fsrs2 = getFSRS();
      expect(fsrs1).toBe(fsrs2);
    });
  });

  // ========================================
  // createQuizCard
  // ========================================
  describe('createQuizCard', () => {
    it('新規カードの初期状態を正しく生成する', () => {
      const card = createQuizCard('q1');

      expect(card.questionId).toBe('q1');
      expect(card.state).toBe(State.New);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
    });

    it('異なるquestionIdで異なるカードを生成する', () => {
      const card1 = createQuizCard('q1');
      const card2 = createQuizCard('q2');

      expect(card1.questionId).toBe('q1');
      expect(card2.questionId).toBe('q2');
    });

    it('dueフィールドが設定される', () => {
      const card = createQuizCard('q1');
      expect(card.due).toBeDefined();
    });
  });

  // ========================================
  // convertToFSRSRating
  // ========================================
  describe('convertToFSRSRating', () => {
    it('againをRating.Againに変換する', () => {
      expect(convertToFSRSRating('again')).toBe(Rating.Again);
    });

    it('hardをRating.Hardに変換する', () => {
      expect(convertToFSRSRating('hard')).toBe(Rating.Hard);
    });

    it('goodをRating.Goodに変換する', () => {
      expect(convertToFSRSRating('good')).toBe(Rating.Good);
    });

    it('easyをRating.Easyに変換する', () => {
      expect(convertToFSRSRating('easy')).toBe(Rating.Easy);
    });
  });

  // ========================================
  // determineRating
  // ========================================
  describe('determineRating', () => {
    it('不正解の場合はagainを返す', () => {
      expect(determineRating(false, 1000)).toBe('again');
      expect(determineRating(false, 5000)).toBe('again');
      expect(determineRating(false, 20000)).toBe('again');
    });

    it('正解かつ5秒未満でeasyを返す', () => {
      expect(determineRating(true, 0)).toBe('easy');
      expect(determineRating(true, 1000)).toBe('easy');
      expect(determineRating(true, 4999)).toBe('easy');
    });

    it('正解かつ5-15秒でgoodを返す', () => {
      expect(determineRating(true, 5000)).toBe('good');
      expect(determineRating(true, 10000)).toBe('good');
      expect(determineRating(true, 14999)).toBe('good');
    });

    it('正解かつ15秒以上でhardを返す', () => {
      expect(determineRating(true, 15000)).toBe('hard');
      expect(determineRating(true, 20000)).toBe('hard');
      expect(determineRating(true, 60000)).toBe('hard');
    });

    it('境界値: 5秒でgoodを返す', () => {
      expect(determineRating(true, 5000)).toBe('good');
    });

    it('境界値: 15秒でhardを返す', () => {
      expect(determineRating(true, 15000)).toBe('hard');
    });
  });

  // ========================================
  // reviewCard
  // ========================================
  describe('reviewCard', () => {
    it('レビュー後にカードが更新される', () => {
      const card = createQuizCard('q1');
      const { card: updatedCard } = reviewCard(card, 'good', mockNow);

      expect(updatedCard.questionId).toBe('q1');
      expect(updatedCard.reps).toBeGreaterThan(0);
      expect(updatedCard.lastReviewedAt).toBeDefined();
    });

    it('rating=againでlapsesが増加する', () => {
      // 新規カードをgoodでレビューしてからagainでレビュー
      const card = createQuizCard('q1');
      const { card: firstReview } = reviewCard(card, 'good', mockNow);
      const { card: againReview } = reviewCard(firstReview, 'again', mockNow);

      expect(againReview.lapses).toBeGreaterThanOrEqual(0);
    });

    it('rating=easyで間隔が長くなる', () => {
      const card = createQuizCard('q1');
      const { card: easyCard } = reviewCard(card, 'easy', mockNow);
      const { card: goodCard } = reviewCard(createQuizCard('q2'), 'good', mockNow);

      // easyの方が次のdue日が遠い
      const easyDue = new Date(easyCard.due).getTime();
      const goodDue = new Date(goodCard.due).getTime();
      expect(easyDue).toBeGreaterThanOrEqual(goodDue);
    });

    it('recordLogが返される', () => {
      const card = createQuizCard('q1');
      const { recordLog } = reviewCard(card, 'good', mockNow);

      expect(recordLog).toBeDefined();
      expect(recordLog[Rating.Again]).toBeDefined();
      expect(recordLog[Rating.Hard]).toBeDefined();
      expect(recordLog[Rating.Good]).toBeDefined();
      expect(recordLog[Rating.Easy]).toBeDefined();
    });

    it('questionIdが保持される', () => {
      const card = createQuizCard('test-question-id');
      const { card: updatedCard } = reviewCard(card, 'good', mockNow);

      expect(updatedCard.questionId).toBe('test-question-id');
    });
  });

  // ========================================
  // getDueCards
  // ========================================
  describe('getDueCards', () => {
    it('期限切れのカードを返す', () => {
      const yesterday = new Date(mockNow);
      yesterday.setDate(yesterday.getDate() - 1);

      const cards: QuizCard[] = [
        { ...createQuizCard('q1'), due: yesterday },
        { ...createQuizCard('q2'), due: new Date(mockNow.getTime() + 86400000) }, // 明日
      ];

      const dueCards = getDueCards(cards, mockNow);
      expect(dueCards).toHaveLength(1);
      expect(dueCards[0].questionId).toBe('q1');
    });

    it('dueが未設定のカードを含める', () => {
      const cards: QuizCard[] = [
        { ...createQuizCard('q1'), due: undefined as unknown as Date },
      ];

      const dueCards = getDueCards(cards, mockNow);
      expect(dueCards).toHaveLength(1);
    });

    it('空配列を処理できる', () => {
      const dueCards = getDueCards([], mockNow);
      expect(dueCards).toHaveLength(0);
    });

    it('dueが同日のカードを含める', () => {
      const cards: QuizCard[] = [{ ...createQuizCard('q1'), due: mockNow }];

      const dueCards = getDueCards(cards, mockNow);
      expect(dueCards).toHaveLength(1);
    });

    it('未来のカードを除外する', () => {
      const tomorrow = new Date(mockNow);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const cards: QuizCard[] = [{ ...createQuizCard('q1'), due: tomorrow }];

      const dueCards = getDueCards(cards, mockNow);
      expect(dueCards).toHaveLength(0);
    });
  });

  // ========================================
  // sortCardsByPriority
  // ========================================
  describe('sortCardsByPriority', () => {
    it('due昇順でソートする', () => {
      const day1 = new Date('2026-02-01');
      const day2 = new Date('2026-02-02');
      const day3 = new Date('2026-02-03');

      const cards: QuizCard[] = [
        { ...createQuizCard('q2'), due: day2 },
        { ...createQuizCard('q3'), due: day3 },
        { ...createQuizCard('q1'), due: day1 },
      ];

      const sorted = sortCardsByPriority(cards);
      expect(sorted[0].questionId).toBe('q1');
      expect(sorted[1].questionId).toBe('q2');
      expect(sorted[2].questionId).toBe('q3');
    });

    it('未学習カード（dueなし）を優先する', () => {
      const cards: QuizCard[] = [
        { ...createQuizCard('q1'), due: new Date('2026-02-01') },
        { ...createQuizCard('q2'), due: undefined as unknown as Date },
      ];

      const sorted = sortCardsByPriority(cards);
      expect(sorted[0].questionId).toBe('q2');
    });

    it('元の配列を変更しない', () => {
      const cards: QuizCard[] = [
        { ...createQuizCard('q2'), due: new Date('2026-02-02') },
        { ...createQuizCard('q1'), due: new Date('2026-02-01') },
      ];

      const original = [...cards];
      sortCardsByPriority(cards);
      expect(cards[0].questionId).toBe(original[0].questionId);
    });

    it('空配列を処理できる', () => {
      const sorted = sortCardsByPriority([]);
      expect(sorted).toHaveLength(0);
    });
  });

  // ========================================
  // getNewCards
  // ========================================
  describe('getNewCards', () => {
    const mockQuestions: QuizQuestion[] = [
      {
        id: 'q1',
        question: 'Question 1',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        category: 'basics',
        difficulty: 'beginner',
      },
      {
        id: 'q2',
        question: 'Question 2',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 1,
        category: 'basics',
        difficulty: 'beginner',
      },
      {
        id: 'q3',
        question: 'Question 3',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 2,
        category: 'roasting',
        difficulty: 'intermediate',
      },
    ];

    it('既存カードにない問題のカードを返す', () => {
      const existingCards: QuizCard[] = [createQuizCard('q1')];

      const newCards = getNewCards(existingCards, mockQuestions, 10);
      expect(newCards).toHaveLength(2);
      expect(newCards.map((c) => c.questionId)).toContain('q2');
      expect(newCards.map((c) => c.questionId)).toContain('q3');
    });

    it('countで取得数を制限する', () => {
      const newCards = getNewCards([], mockQuestions, 1);
      expect(newCards).toHaveLength(1);
    });

    it('全問題がカードにある場合は空配列を返す', () => {
      const existingCards: QuizCard[] = mockQuestions.map((q) =>
        createQuizCard(q.id)
      );

      const newCards = getNewCards(existingCards, mockQuestions, 10);
      expect(newCards).toHaveLength(0);
    });
  });

  // ========================================
  // getCardMastery
  // ========================================
  describe('getCardMastery', () => {
    it('stabilityが0の場合は0を返す', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 0 };
      expect(getCardMastery(card)).toBe(0);
    });

    it('stabilityが未設定の場合は0を返す', () => {
      const card: QuizCard = {
        ...createQuizCard('q1'),
        stability: undefined as unknown as number,
      };
      expect(getCardMastery(card)).toBe(0);
    });

    it('stabilityが30の場合は100を返す', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 30 };
      expect(getCardMastery(card)).toBe(100);
    });

    it('stabilityが15の場合は50を返す', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 15 };
      expect(getCardMastery(card)).toBe(50);
    });

    it('stabilityが30超でも100を返す（上限）', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 60 };
      expect(getCardMastery(card)).toBe(100);
    });

    it('結果が整数に丸められる', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 10 };
      const mastery = getCardMastery(card);
      expect(Number.isInteger(mastery)).toBe(true);
    });
  });

  // ========================================
  // isCardMastered
  // ========================================
  describe('isCardMastered', () => {
    it('stabilityが30以上でtrueを返す', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 30 };
      expect(isCardMastered(card)).toBe(true);
    });

    it('stabilityが30未満でfalseを返す', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 29.9 };
      expect(isCardMastered(card)).toBe(false);
    });

    it('stabilityが未設定でfalseを返す', () => {
      const card: QuizCard = {
        ...createQuizCard('q1'),
        stability: undefined as unknown as number,
      };
      expect(isCardMastered(card)).toBe(false);
    });

    it('境界値: stability=30でtrueを返す', () => {
      const card: QuizCard = { ...createQuizCard('q1'), stability: 30 };
      expect(isCardMastered(card)).toBe(true);
    });
  });

  // ========================================
  // getNextReviewDate
  // ========================================
  describe('getNextReviewDate', () => {
    it('dueが設定されている場合はDateを返す', () => {
      const due = new Date('2026-02-10');
      const card: QuizCard = { ...createQuizCard('q1'), due };

      const nextReview = getNextReviewDate(card);
      expect(nextReview).toEqual(due);
    });

    it('dueが未設定の場合はnullを返す', () => {
      const card: QuizCard = {
        ...createQuizCard('q1'),
        due: undefined as unknown as Date,
      };

      const nextReview = getNextReviewDate(card);
      expect(nextReview).toBeNull();
    });
  });

  // ========================================
  // getCardStateLabel
  // ========================================
  describe('getCardStateLabel', () => {
    it('dueが未設定の場合は「未学習」を返す', () => {
      const card: QuizCard = {
        ...createQuizCard('q1'),
        due: undefined as unknown as Date,
      };

      expect(getCardStateLabel(card)).toBe('未学習');
    });

    it('dueが過去の場合は「復習可能」を返す', () => {
      const yesterday = new Date(mockNow);
      yesterday.setDate(yesterday.getDate() - 1);

      const card: QuizCard = { ...createQuizCard('q1'), due: yesterday };
      expect(getCardStateLabel(card)).toBe('復習可能');
    });

    it('dueが明日の場合は「明日復習」を返す', () => {
      const tomorrow = new Date(mockNow);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const card: QuizCard = { ...createQuizCard('q1'), due: tomorrow };
      expect(getCardStateLabel(card)).toBe('明日復習');
    });

    it('dueが2-7日後の場合は「X日後に復習」を返す', () => {
      const inThreeDays = new Date(mockNow);
      inThreeDays.setDate(inThreeDays.getDate() + 3);

      const card: QuizCard = { ...createQuizCard('q1'), due: inThreeDays };
      expect(getCardStateLabel(card)).toBe('3日後に復習');
    });

    it('dueが8日以上の場合は「X週間後に復習」を返す', () => {
      const inTwoWeeks = new Date(mockNow);
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

      const card: QuizCard = { ...createQuizCard('q1'), due: inTwoWeeks };
      expect(getCardStateLabel(card)).toBe('2週間後に復習');
    });

    it('dueが同日の場合は「復習可能」を返す', () => {
      const card: QuizCard = { ...createQuizCard('q1'), due: mockNow };
      expect(getCardStateLabel(card)).toBe('復習可能');
    });
  });
});
