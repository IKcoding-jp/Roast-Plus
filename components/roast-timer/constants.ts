/**
 * 焙煎タイマーで使用する定数
 */

/** 焙煎度合いの選択肢 */
export const ROAST_LEVELS: Array<'浅煎り' | '中煎り' | '中深煎り' | '深煎り'> = [
  '浅煎り',
  '中煎り',
  '中深煎り',
  '深煎り',
];

/** 重さの選択肢（グラム） */
export const WEIGHTS: Array<200 | 300 | 500> = [200, 300, 500];

/** 重さに応じたデフォルト焙煎時間（分） */
export const DEFAULT_DURATION_BY_WEIGHT: Record<200 | 300 | 500, number> = {
  200: 8,
  300: 9,
  500: 10,
};

/** 焙煎度合いの型 */
export type RoastLevel = '浅煎り' | '中煎り' | '中深煎り' | '深煎り';

/** 重さの型 */
export type Weight = 200 | 300 | 500;
