# タスクリスト

**ステータス**: ✅ 完了
**完了日**: 2026-02-08

## フェーズ1: 軽量実装への置き換え
- [x] SVG雪の結晶コンポーネント（SimpleSnowflake, MediumSnowflake, ComplexSnowflake）をCSS-onlyの円形要素に置き換え
- [x] 雪片数を60個から25個に削減
- [x] `filter: blur() + drop-shadow() × 2` を完全除去
- [x] CSSアニメーションを簡素化（snowfall + sway の2アニメーション）

## フェーズ2: CSS最適化
- [x] `will-change: transform, translate` の設定
- [x] `contain: layout style` の追加
- [x] 不要なSVGコンポーネント（SimpleSnowflake等）の削除

## フェーズ3: 動作確認
- [x] lint / build / test 全通過（757テスト）
- [x] Snowfall専用テスト7つ追加・通過
- [ ] 各種デバイス（モバイル含む）での動作確認（手動）

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3（順次実行）
