# タスクリスト

**Issue**: #227
**作成日**: 2026-02-13

## フェーズ1: テーマ基盤（CSS変数 + 定数）

- [ ] `lib/theme.ts` - テーマプリセット定数・型定義の作成
- [ ] `app/globals.css` - ダークローストのCSS変数セット追加
- [ ] `app/globals.css` - ライトローストのCSS変数セット追加
- [ ] `app/globals.css` - 抹茶ラテのCSS変数セット追加
- [ ] `app/globals.css` - キャラメルマキアートのCSS変数セット追加
- [ ] `components/ThemeProvider.tsx` - テーマリスト拡張（6テーマ）

## フェーズ2: テーマhook

- [ ] `hooks/useAppTheme.ts` - 汎用テーマhookの作成
- [ ] `hooks/useChristmasMode.ts` - 後方互換性の確認（変更不要の見込み）

## フェーズ3: テーマ設定UI

- [ ] `components/settings/ThemeSelector.tsx` - テーマ選択カードグリッドコンポーネントの作成
- [ ] `app/settings/page.tsx` - テーマ設定セクション追加
- [ ] `app/settings/page.tsx` - クリスマスモードSwitch削除

## フェーズ4: 検証・修正

- [ ] 全テーマでの共通UIコンポーネント表示確認
- [ ] テーマ永続化（localStorage）の動作確認
- [ ] クリスマステーマの装飾機能（snowfall等）の動作確認
- [ ] Lint・Build確認

## フェーズ5: ドキュメント

- [ ] Steering Documents更新ドラフト（FEATURES.md等）

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
