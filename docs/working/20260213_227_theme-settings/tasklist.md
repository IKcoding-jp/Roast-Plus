# タスクリスト

**Issue**: #227
**作成日**: 2026-02-13
**ステータス**: ✅ 完了
**完了日**: 2026-02-13

## フェーズ1: テーマ基盤（CSS変数 + 定数）

- [x] `lib/theme.ts` - テーマプリセット定数・型定義の作成
- [x] `app/globals.css` - ダークローストのCSS変数セット追加
- [x] `app/globals.css` - ライトローストのCSS変数セット追加
- [x] `app/globals.css` - 抹茶ラテのCSS変数セット追加
- [x] `app/globals.css` - キャラメルマキアートのCSS変数セット追加
- [x] `components/ThemeProvider.tsx` - テーマリスト拡張（6テーマ）

## フェーズ2: テーマhook

- [x] `hooks/useAppTheme.ts` - 汎用テーマhookの作成
- [x] `hooks/useChristmasMode.ts` - 後方互換性の確認（変更不要）

## フェーズ3: テーマ設定UI

- [x] `components/settings/ThemeSelector.tsx` - テーマ選択カードグリッドコンポーネントの作成
- [x] `app/settings/theme/page.tsx` - テーマ設定専用ページの作成
- [x] `app/settings/page.tsx` - テーマ設定リンクカード追加
- [x] `app/settings/page.tsx` - クリスマスモードSwitch削除

## フェーズ4: 検証・修正

- [x] 全テーマでの共通UIコンポーネント表示確認
- [x] テーマ永続化（localStorage）の動作確認
- [x] クリスマステーマの装飾機能（snowfall等）の動作確認
- [x] ホームヘッダーのテーマ対応（CSS変数化）
- [x] クリスマスロゴのPlayfair Displayフォント変更
- [x] Lint・Build・Test確認（1038テスト全パス）

## フェーズ5: ドキュメント

- [x] Steering Documents更新（FEATURES.md）

## 依存関係

- フェーズ1 → フェーズ2（CSS変数が先）
- フェーズ2 → フェーズ3（hookがUI実装に必要）
- フェーズ3 → フェーズ4（UI完成後に検証）
- フェーズ4 → フェーズ5（検証後にドキュメント）

## 見積もり

- フェーズ1: 15分（CSS変数定義 + 定数）
- フェーズ2: 5分（hook作成）
- フェーズ3: 15分（UI実装）
- フェーズ4: 10分（検証・修正）
- フェーズ5: 5分（ドキュメント）
- **合計: 約50分**
