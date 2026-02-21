# tasklist.md — Issue #249

## フェーズ1: 調査・設計

- [ ] `docs/steering/FEATURES.md` のコーヒークイズ機能定義を確認
- [ ] `docs/steering/GUIDELINES.md` のUI実装ルールを確認
- [ ] `.claude/skills/roastplus-ui/` のデザイントークンを確認
- [ ] 現状の `HelpGuideModal.tsx` を読み込む
- [ ] `/frontend-design` スキルを呼び出してデザインを生成

## フェーズ2: 実装

- [ ] `HelpGuideModal.tsx` をステップ型UIに全面リライト
  - 4ステップのデータ定義（アイコン・タイトル・説明・ミニビジュアル）
  - ステップ状態管理（useState）
  - ナビゲーション（前へ/次へ/閉じる）
  - Framer Motionアニメーション（スライド・フェード）
  - ドットインジケーター
  - `Modal` コンポーネント使用

## フェーズ3: 検証

- [ ] `npm run lint` → エラー・warningゼロ
- [ ] `npm run build` → ビルド成功
- [ ] `npm run test:run` → 既存テスト全件パス
- [ ] ブラウザで動作確認（?ボタン → モーダル開く → ステップ遷移 → 閉じる）

## 変更対象ファイル
| ファイル | 変更種別 |
|---------|---------|
| `components/coffee-quiz/HelpGuideModal.tsx` | 全面リライト |
