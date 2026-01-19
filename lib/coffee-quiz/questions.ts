// クイズ問題ローダー
import type { QuizQuestion, QuizCategory, QuizDifficulty } from './types';

// 問題データのキャッシュ
let questionsCache: QuizQuestion[] | null = null;

// 問題JSONファイルのパス
const QUESTION_PATHS: Record<QuizCategory, string> = {
  basics: '/coffee-trivia/questions/basics.json',
  roasting: '/coffee-trivia/questions/roasting.json',
  brewing: '/coffee-trivia/questions/brewing.json',
  history: '/coffee-trivia/questions/history.json',
};

interface QuestionFile {
  category: QuizCategory;
  questions: QuizQuestion[];
}

/**
 * すべての問題を読み込む
 */
export async function loadAllQuestions(): Promise<QuizQuestion[]> {
  if (questionsCache) {
    return questionsCache;
  }

  const allQuestions: QuizQuestion[] = [];

  const categories: QuizCategory[] = ['basics', 'roasting', 'brewing', 'history'];

  for (const category of categories) {
    try {
      const response = await fetch(QUESTION_PATHS[category]);
      if (!response.ok) {
        console.error(`Failed to load ${category} questions:`, response.status);
        continue;
      }
      const data: QuestionFile = await response.json();
      allQuestions.push(...data.questions);
    } catch (error) {
      console.error(`Error loading ${category} questions:`, error);
    }
  }

  questionsCache = allQuestions;
  return allQuestions;
}

/**
 * カテゴリ別の問題を取得
 */
export async function getQuestionsByCategory(
  category: QuizCategory
): Promise<QuizQuestion[]> {
  const allQuestions = await loadAllQuestions();
  return allQuestions.filter((q) => q.category === category);
}

/**
 * 難易度別の問題を取得
 */
export async function getQuestionsByDifficulty(
  difficulty: QuizDifficulty
): Promise<QuizQuestion[]> {
  const allQuestions = await loadAllQuestions();
  return allQuestions.filter((q) => q.difficulty === difficulty);
}

/**
 * IDで問題を取得
 */
export async function getQuestionById(id: string): Promise<QuizQuestion | undefined> {
  const allQuestions = await loadAllQuestions();
  return allQuestions.find((q) => q.id === id);
}

/**
 * 複数のIDで問題を取得（IDの順番を維持）
 */
export async function getQuestionsByIds(ids: string[]): Promise<QuizQuestion[]> {
  const allQuestions = await loadAllQuestions();
  const questionMap = new Map(allQuestions.map(q => [q.id, q]));
  // IDの順番を維持して返す
  return ids
    .map(id => questionMap.get(id))
    .filter((q): q is QuizQuestion => q !== undefined);
}

/**
 * ランダムな問題を取得
 * @param count 取得する問題数
 * @param categories フィルタするカテゴリ（省略時は全カテゴリ）
 * @param excludeIds 除外する問題ID
 */
export async function getRandomQuestions(
  count: number,
  categories?: QuizCategory[],
  excludeIds?: string[]
): Promise<QuizQuestion[]> {
  let questions = await loadAllQuestions();

  // カテゴリでフィルタ
  if (categories && categories.length > 0) {
    const categorySet = new Set(categories);
    questions = questions.filter((q) => categorySet.has(q.category));
  }

  // 除外IDでフィルタ
  if (excludeIds && excludeIds.length > 0) {
    const excludeSet = new Set(excludeIds);
    questions = questions.filter((q) => !excludeSet.has(q.id));
  }

  // シャッフルして指定数を返す
  const shuffled = shuffleArray([...questions]);
  return shuffled.slice(0, count);
}

/**
 * デイリークイズ用の問題を取得（バランスの取れた構成）
 * @param count 取得する問題数（デフォルト10）
 * @param enabledCategories 有効なカテゴリ
 */
export async function getDailyQuestions(
  count: number = 10,
  enabledCategories?: QuizCategory[]
): Promise<QuizQuestion[]> {
  const categories = enabledCategories || ['basics', 'roasting', 'brewing', 'history'];
  const questionsPerCategory = Math.ceil(count / categories.length);

  const selectedQuestions: QuizQuestion[] = [];

  for (const category of categories) {
    const categoryQuestions = await getQuestionsByCategory(category);
    const shuffled = shuffleArray([...categoryQuestions]);
    selectedQuestions.push(...shuffled.slice(0, questionsPerCategory));
  }

  // シャッフルして指定数に調整
  const shuffled = shuffleArray(selectedQuestions);
  return shuffled.slice(0, count);
}

/**
 * 配列をシャッフル（Fisher-Yates）
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 問題の選択肢をシャッフル
 */
export function shuffleOptions(question: QuizQuestion): QuizQuestion {
  return {
    ...question,
    options: shuffleArray([...question.options]),
  };
}

/**
 * キャッシュをクリア（開発用）
 */
export function clearQuestionsCache(): void {
  questionsCache = null;
}

/**
 * 統計情報を取得
 */
export async function getQuestionsStats(): Promise<{
  total: number;
  byCategory: Record<QuizCategory, number>;
  byDifficulty: Record<QuizDifficulty, number>;
}> {
  const questions = await loadAllQuestions();

  const byCategory: Record<QuizCategory, number> = {
    basics: 0,
    roasting: 0,
    brewing: 0,
    history: 0,
  };

  const byDifficulty: Record<QuizDifficulty, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  for (const q of questions) {
    byCategory[q.category]++;
    byDifficulty[q.difficulty]++;
  }

  return {
    total: questions.length,
    byCategory,
    byDifficulty,
  };
}
