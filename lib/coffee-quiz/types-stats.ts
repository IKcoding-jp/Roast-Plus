// 統計関連の型定義
import type { QuizCategory, QuizDifficulty } from './types-quiz';

export interface QuizStats {
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  averageAccuracy: number;
  categoryStats: {
    [key in QuizCategory]: CategoryStat;
  };
  difficultyStats: {
    [key in QuizDifficulty]: DifficultyStat;
  };
  weeklyActivity: WeeklyActivity[];
}

export interface CategoryStat {
  total: number;
  correct: number;
  accuracy: number;
  masteredCount: number;
}

export interface DifficultyStat {
  total: number;
  correct: number;
  accuracy: number;
}

export interface WeeklyActivity {
  date: string; // YYYY-MM-DD
  questionsAnswered: number;
  correctAnswers: number;
}

// 初期値
export const INITIAL_QUIZ_STATS: QuizStats = {
  totalQuestions: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  averageAccuracy: 0,
  categoryStats: {
    basics: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
    roasting: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
    brewing: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
    history: { total: 0, correct: 0, accuracy: 0, masteredCount: 0 },
  },
  difficultyStats: {
    beginner: { total: 0, correct: 0, accuracy: 0 },
    intermediate: { total: 0, correct: 0, accuracy: 0 },
    advanced: { total: 0, correct: 0, accuracy: 0 },
  },
  weeklyActivity: [],
};
