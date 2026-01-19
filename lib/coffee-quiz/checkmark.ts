// チェックマークロジック
// 正解時: redCheck > 0 なら redCheck - 1、それ以外は blueCheck + 1 (max 3)
// 間違い時: blueCheck > 0 なら blueCheck - 1、それ以外は redCheck + 1 (max 3)

import type { QuestionCheckmark } from './types';

const MAX_CHECKS = 3;
const MIN_CHECKS = 0;

/**
 * 正解時のチェックマーク更新
 * - redCheck > 0 の場合: redCheck - 1
 * - redCheck = 0 の場合: blueCheck + 1（最大3）
 */
export function updateCheckmarkOnCorrect(
  checkmark: QuestionCheckmark
): QuestionCheckmark {
  const redCheck = checkmark.redCheck ?? 0;

  if (redCheck > 0) {
    // 赤チェックがある場合は赤を減らす
    return {
      ...checkmark,
      redCheck: redCheck - 1,
      updatedAt: new Date().toISOString(),
    };
  }

  // 赤チェックがない場合は青を増やす
  return {
    ...checkmark,
    blueCheck: Math.min(checkmark.blueCheck + 1, MAX_CHECKS),
    redCheck: MIN_CHECKS,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 間違い時のチェックマーク更新
 * - blueCheck > 0 の場合: blueCheck - 1
 * - blueCheck = 0 の場合: redCheck + 1（最大3）
 */
export function updateCheckmarkOnIncorrect(
  checkmark: QuestionCheckmark
): QuestionCheckmark {
  const redCheck = checkmark.redCheck ?? 0;

  if (checkmark.blueCheck > 0) {
    // 青チェックがある場合は青を減らす
    return {
      ...checkmark,
      blueCheck: checkmark.blueCheck - 1,
      redCheck,
      updatedAt: new Date().toISOString(),
    };
  }

  // 青チェックがない場合は赤を増やす
  return {
    ...checkmark,
    blueCheck: MIN_CHECKS,
    redCheck: Math.min(redCheck + 1, MAX_CHECKS),
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
