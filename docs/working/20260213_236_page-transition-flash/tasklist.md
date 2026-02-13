# タスクリスト

## フェーズ1: CSS変数の修正
- [x] `app/globals.css` の body 背景を `var(--page)` に変更
- [x] `bg-background` クラスの使用箇所を確認し影響を評価 → 使用箇所ゼロ、影響なし

## フェーズ2: レイアウト・コンポーネント修正
- [x] `app/layout.tsx` の body に `bg-page` クラスを追加
- [x] `components/Loading.tsx` のハードコード背景色をテーマ対応に変更

## フェーズ3: 検証
- [ ] `npm run build` でビルドエラーがないこと
- [ ] `npm run lint` でLintエラーがゼロであること
- [ ] 全テーマでページ遷移の白フラッシュが解消されていること
  - default
  - christmas
  - dark-roast
  - light-roast
  - matcha
  - caramel

## 依存関係
- フェーズ1 → フェーズ2（CSS変数の修正後にコンポーネント修正）
- フェーズ2 → フェーズ3（実装完了後に検証）
