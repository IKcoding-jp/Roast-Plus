/** レスポンシブテスト用のビューポートサイズ */
export const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
} as const;

/** パフォーマンステスト用の閾値 */
export const performanceThresholds = {
  /** ページロード完了時間の上限 (ms) - 開発環境では4倍を適用 */
  pageLoad: 2500,
  cls: 0.1,
} as const;
