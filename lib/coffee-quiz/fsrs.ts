// FSRS（分散学習アルゴリズム）ユーティリティ
import {
  FSRS,
  Rating,
  createEmptyCard,
  type Card,
  type RecordLog,
  type FSRSParameters,
  type Grade,
} from 'ts-fsrs';
import type { QuizCard, QuizRating, QuizQuestion } from './types';

// Firestore Timestampの型定義
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

/**
 * Firestore TimestampまたはISO文字列をDateに変換
 */
function toDate(value: Date | FirestoreTimestamp | string | null | undefined): Date | undefined {
  if (!value) return undefined;

  // 既にDateの場合
  if (value instanceof Date) return value;

  // Firestore Timestampの場合（toDateメソッドがある場合）
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  // Firestore Timestampの場合（seconds/nanosecondsがある場合）
  if (typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
    return new Date(value.seconds * 1000 + value.nanoseconds / 1000000);
  }

  // ISO文字列の場合
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

/**
 * QuizCardのTimestampフィールドをDateに正規化
 */
function normalizeCard(card: QuizCard): QuizCard {
  return {
    ...card,
    due: toDate(card.due as unknown as Date | FirestoreTimestamp | string) ?? new Date(),
    last_review: toDate(card.last_review as unknown as Date | FirestoreTimestamp | string),
  } as QuizCard;
}

// ========================================
// FSRS設定
// ========================================

const FSRS_PARAMS: Partial<FSRSParameters> = {
  request_retention: 0.9, // 目標定着率: 90%
  maximum_interval: 365, // 最大間隔: 365日
  w: [
    0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
    0.34, 1.26, 0.29, 2.61,
  ],
};

// FSRSインスタンス（シングルトン）
let fsrsInstance: FSRS | null = null;

export function getFSRS(): FSRS {
  if (!fsrsInstance) {
    fsrsInstance = new FSRS(FSRS_PARAMS);
  }
  return fsrsInstance;
}

// ========================================
// カード操作
// ========================================

/**
 * 新しいクイズカードを作成
 */
export function createQuizCard(questionId: string): QuizCard {
  const emptyCard = createEmptyCard();
  return {
    ...emptyCard,
    questionId,
  };
}

/**
 * クイズの回答結果に基づいてカードを更新
 * @param card 更新対象のカード
 * @param rating 評価（again/hard/good/easy）
 * @param now 現在時刻（オプション）
 */
export function reviewCard(
  card: QuizCard,
  rating: QuizRating,
  now: Date = new Date()
): { card: QuizCard; recordLog: RecordLog } {
  const fsrs = getFSRS();
  const fsrsRating = convertToFSRSRating(rating);

  // Firestoreから取得したカードのTimestampをDateに正規化
  const normalizedCard = normalizeCard(card);

  // next関数を使用して指定したRatingでスケジュールする
  const result = fsrs.next(normalizedCard, now, fsrsRating);
  const newCardData = result.card;

  const updatedCard: QuizCard = {
    ...newCardData,
    questionId: card.questionId,
    lastReviewedAt: now.toISOString(),
  };

  // recordLogはrepeatの結果を返す（他のRatingの結果も含む）
  const recordLog = fsrs.repeat(normalizedCard, now);

  return {
    card: updatedCard,
    recordLog,
  };
}

/**
 * QuizRatingをFSRSのGrade（next関数で使用するRating）に変換
 */
export function convertToFSRSRating(rating: QuizRating): Grade {
  switch (rating) {
    case 'again':
      return Rating.Again;
    case 'hard':
      return Rating.Hard;
    case 'good':
      return Rating.Good;
    case 'easy':
      return Rating.Easy;
  }
}

/**
 * 回答時間と正解/不正解からQuizRatingを決定
 * @param isCorrect 正解かどうか
 * @param responseTimeMs 回答時間（ミリ秒）
 */
export function determineRating(
  isCorrect: boolean,
  responseTimeMs: number
): QuizRating {
  if (!isCorrect) {
    return 'again';
  }

  // 正解の場合、回答時間で評価を決定
  const responseTimeSec = responseTimeMs / 1000;

  if (responseTimeSec < 5) {
    return 'easy'; // 5秒未満 → Easy
  } else if (responseTimeSec < 15) {
    return 'good'; // 5-15秒 → Good
  } else {
    return 'hard'; // 15秒以上 → Hard
  }
}

// ========================================
// 復習スケジューリング
// ========================================

/**
 * 今日復習すべきカードを取得
 * @param cards すべてのカード
 * @param now 現在時刻
 */
export function getDueCards(cards: QuizCard[], now: Date = new Date()): QuizCard[] {
  return cards.filter((card) => {
    if (!card.due) return true; // 未学習のカードも含める
    const dueDate = toDate(card.due as unknown as Date | FirestoreTimestamp | string);
    if (!dueDate) return true;
    return dueDate <= now;
  });
}

/**
 * カードを優先度でソート（期限が近い順、未学習優先）
 */
export function sortCardsByPriority(cards: QuizCard[]): QuizCard[] {
  return [...cards].sort((a, b) => {
    const dueDateA = toDate(a.due as unknown as Date | FirestoreTimestamp | string);
    const dueDateB = toDate(b.due as unknown as Date | FirestoreTimestamp | string);

    // 未学習カードを優先
    if (!dueDateA && dueDateB) return -1;
    if (dueDateA && !dueDateB) return 1;
    if (!dueDateA && !dueDateB) return 0;

    // 期限が近い順
    return dueDateA!.getTime() - dueDateB!.getTime();
  });
}

/**
 * 新しい問題のカードを優先的に取得
 * @param cards すべてのカード
 * @param questions 問題リスト
 * @param count 取得する数
 */
export function getNewCards(
  cards: QuizCard[],
  questions: QuizQuestion[],
  count: number
): QuizCard[] {
  const existingQuestionIds = new Set(cards.map((c) => c.questionId));
  const newQuestions = questions.filter((q) => !existingQuestionIds.has(q.id));

  return newQuestions.slice(0, count).map((q) => createQuizCard(q.id));
}

// ========================================
// 統計ヘルパー
// ========================================

/**
 * カードの習熟度を計算（0-100%）
 * stability（安定度）に基づく
 */
export function getCardMastery(card: QuizCard): number {
  if (!card.stability) return 0;

  // stability が高いほど習熟度が高い
  // stability 30日以上で100%とする
  const maxStability = 30;
  const mastery = Math.min(100, (card.stability / maxStability) * 100);
  return Math.round(mastery);
}

/**
 * カードがマスター済みかどうかを判定
 * stability が十分に高い（30日以上）場合にマスター済みとする
 */
export function isCardMastered(card: QuizCard): boolean {
  return (card.stability ?? 0) >= 30;
}

/**
 * 次の復習予定日を取得
 */
export function getNextReviewDate(card: QuizCard): Date | null {
  if (!card.due) return null;
  return toDate(card.due as unknown as Date | FirestoreTimestamp | string) ?? null;
}

/**
 * カードの状態を日本語で取得
 */
export function getCardStateLabel(card: QuizCard): string {
  if (!card.due) return '未学習';

  const now = new Date();
  const due = toDate(card.due as unknown as Date | FirestoreTimestamp | string);

  if (!due) return '未学習';

  if (due <= now) {
    return '復習可能';
  }

  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return '明日復習';
  } else if (diffDays <= 7) {
    return `${diffDays}日後に復習`;
  } else {
    return `${Math.ceil(diffDays / 7)}週間後に復習`;
  }
}
