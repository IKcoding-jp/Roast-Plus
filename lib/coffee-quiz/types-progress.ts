// クイズ進捗・設定関連の型定義
import type { QuizCard } from './types-fsrs';
import type { StreakInfo, LevelInfo, EarnedBadge, DailyGoal } from './types-gamification';
import type { QuizStats } from './types-stats';
import type { QuizCategory } from './types-quiz';

// ========================================
// クイズ設定
// ========================================

export interface QuizSettings {
  dailyGoal: number; // デフォルト: 10
  enabledCategories: QuizCategory[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showExplanation: boolean;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  dailyGoal: 10,
  enabledCategories: ['basics', 'roasting', 'brewing', 'history'],
  soundEnabled: true,
  vibrationEnabled: true,
  showExplanation: true,
};

// ========================================
// チェックマーク（正解/間違い履歴）
// ========================================

export interface QuestionCheckmark {
  questionId: string;
  blueCheck: number;  // 0-3: 正解履歴
  redCheck: number;   // 0-3: 不正解履歴
  updatedAt: string;  // ISO 8601
}

// ========================================
// クイズ進捗（Firestoreに保存）
// ========================================

export interface QuizProgress {
  userId: string;
  cards: QuizCard[];
  checkmarks?: QuestionCheckmark[];  // 正解/間違いチェックマーク（廃止予定）
  streak: StreakInfo;
  level: LevelInfo;
  earnedBadges: EarnedBadge[];
  dailyGoals: DailyGoal[];
  settings: QuizSettings;
  stats: QuizStats;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
