// クイズセッション関連の型定義
import type { QuizCategory } from './types-quiz';

export interface QuizSession {
  id: string;
  startedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  questions: QuizSessionQuestion[];
  mode: 'daily' | 'review' | 'category' | 'random' | 'single' | 'shuffle' | 'sequential';
  category?: QuizCategory;
}

export interface QuizSessionQuestion {
  questionId: string;
  answeredAt?: string; // ISO 8601
  selectedOptionId?: string;
  isCorrect?: boolean;
  responseTimeMs?: number;
  xpEarned?: number;
}
