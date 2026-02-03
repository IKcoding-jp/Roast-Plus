// FSRS関連の型定義
import { Card as FSRSCard, RecordLog } from 'ts-fsrs';

export interface QuizCard extends FSRSCard {
  questionId: string;
  lastReviewedAt?: string; // ISO 8601
  hasAnsweredCorrectly?: boolean; // 一度でも正解したことがあるか
}

export type QuizRating = 'again' | 'hard' | 'good' | 'easy';

export interface QuizReviewResult {
  card: QuizCard;
  recordLog: RecordLog;
}
