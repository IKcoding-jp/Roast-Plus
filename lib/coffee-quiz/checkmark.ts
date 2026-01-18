// チェックマークロジック
// 正解時: blue +1 (max 3), red -1 (min 0)
// 間違い時: blue > 0 なら blue -1, blue == 0 なら red +1 (max 3)

import type { QuestionCheckmark } from './types';

const MAX_CHECKS = 3;
const MIN_CHECKS = 0;

/**
 * 正解時のチェックマーク更新
 * - blue +1 (max 3)
 * - red -1 (min 0)
 */
export function updateCheckmarkOnCorrect(
  checkmark: QuestionCheckmark
): QuestionCheckmark {
  return {
    ...checkmark,
    blueCheck: Math.min(checkmark.blueCheck + 1, MAX_CHECKS),
    redCheck: Math.max(checkmark.redCheck - 1, MIN_CHECKS),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 間違い時のチェックマーク更新
 * - blue > 0 なら blue -1
 * - blue == 0 なら red +1 (max 3)
 */
export function updateCheckmarkOnIncorrect(
  checkmark: QuestionCheckmark
): QuestionCheckmark {
  if (checkmark.blueCheck > 0) {
    return {
      ...checkmark,
      blueCheck: checkmark.blueCheck - 1,
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    ...checkmark,
    redCheck: Math.min(checkmark.redCheck + 1, MAX_CHECKS),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * チェックマークを更新（正解/間違いに応じて）
 */
export function updateCheckmark(
  checkmark: QuestionCheckmark,
  isCorrect: boolean
): QuestionCheckmark {
  return isCorrect
    ? updateCheckmarkOnCorrect(checkmark)
    : updateCheckmarkOnIncorrect(checkmark);
}

/**
 * 新しいチェックマークを作成
 */
export function createCheckmark(questionId: string): QuestionCheckmark {
  return {
    questionId,
    blueCheck: 0,
    redCheck: 0,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * チェックマークリストから特定の問題のチェックマークを取得
 * 存在しない場合はnullを返す
 */
export function getCheckmark(
  checkmarks: QuestionCheckmark[],
  questionId: string
): QuestionCheckmark | null {
  return checkmarks.find((c) => c.questionId === questionId) ?? null;
}

/**
 * チェックマークリストを更新
 * 問題IDが存在する場合は更新、存在しない場合は追加
 */
export function updateCheckmarks(
  checkmarks: QuestionCheckmark[],
  questionId: string,
  isCorrect: boolean
): QuestionCheckmark[] {
  const existingIndex = checkmarks.findIndex((c) => c.questionId === questionId);

  if (existingIndex >= 0) {
    // 既存のチェックマークを更新
    const updatedCheckmark = updateCheckmark(checkmarks[existingIndex], isCorrect);
    const newCheckmarks = [...checkmarks];
    newCheckmarks[existingIndex] = updatedCheckmark;
    return newCheckmarks;
  }

  // 新しいチェックマークを作成して追加
  const newCheckmark = createCheckmark(questionId);
  const updatedCheckmark = updateCheckmark(newCheckmark, isCorrect);
  return [...checkmarks, updatedCheckmark];
}

/**
 * リベンジ対象の問題を取得
 * redCheck >= 1 の問題をredCheckの多い順に返す
 */
export function getRevengeQuestionIds(
  checkmarks: QuestionCheckmark[]
): string[] {
  return checkmarks
    .filter((c) => c.redCheck >= 1)
    .sort((a, b) => b.redCheck - a.redCheck)
    .map((c) => c.questionId);
}

/**
 * リベンジ対象の問題数を取得
 */
export function getRevengeCount(checkmarks: QuestionCheckmark[]): number {
  return checkmarks.filter((c) => c.redCheck >= 1).length;
}
