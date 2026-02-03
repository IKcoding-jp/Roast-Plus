/**
 * ローストスケジュール用の色分けユーティリティ関数
 */

/**
 * 焙煎度ごとの色分け（コーヒー豆の色に合わせる）
 */
export function getRoastLevelColor(roastLevel?: string): string {
  if (!roastLevel) return 'bg-gray-100 text-gray-800';

  if (roastLevel === '浅煎り') {
    // ライト・ロースト / シナモン・ロースト: 黄味がかった小麦色 / シナモン色
    return 'text-yellow-900';
  }
  if (roastLevel === '中煎り') {
    // ミディアム・ロースト: 栗色
    return 'text-white';
  }
  if (roastLevel === '中深煎り') {
    // ハイ・ロースト: 濃い茶色
    return 'text-white';
  }
  if (roastLevel === '深煎り') {
    // シティ・ロースト以降: 非常に濃い茶色から黒色
    return 'text-white';
  }
  return 'bg-gray-100 text-gray-800';
}

/**
 * Gモードごとの色分け
 */
export function getModeColor(mode?: string): string {
  if (!mode) return 'bg-gray-100 text-gray-800';

  if (mode === 'G1') {
    return 'bg-blue-100 text-blue-800';
  }
  if (mode === 'G2') {
    return 'bg-yellow-100 text-yellow-900';
  }
  if (mode === 'G3') {
    return 'bg-purple-100 text-purple-800';
  }
  return 'bg-gray-100 text-gray-800';
}

/**
 * 重さごとの色分け
 */
export function getWeightColor(weight?: string): string {
  if (!weight) return 'bg-gray-100 text-gray-800';

  if (weight === '200g') {
    // 水色または落ち着いた緑（バランス・標準・穏やかさ）
    return 'bg-sky-100 text-sky-800';
  }
  if (weight === '300g') {
    // 明るい緑または明るい黄色（軽さ・新鮮さ）
    return 'bg-lime-100 text-lime-900';
  }
  if (weight === '500g') {
    // 暖色系（オレンジ、茶色）または赤
    return 'bg-orange-200 text-orange-900';
  }
  return 'bg-gray-100 text-gray-800';
}
