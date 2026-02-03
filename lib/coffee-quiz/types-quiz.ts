// クイズ問題の型定義

export type QuizCategory = 'basics' | 'roasting' | 'brewing' | 'history';
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  question: string;
  options: QuizOption[];
  explanation: string;
  imageUrl?: string;
}

// カテゴリ表示名
export const CATEGORY_LABELS: Record<QuizCategory, string> = {
  basics: '基礎知識',
  roasting: '焙煎理論',
  brewing: '抽出理論',
  history: '歴史と文化',
};

export const DIFFICULTY_LABELS: Record<QuizDifficulty, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
};
