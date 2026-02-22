# タスクリスト（v2 — FloatingNav）

**ステータス**: 🔄 進行中

## フェーズ1: FloatingNavコンポーネント作成
- [ ] `components/ui/FloatingNav.tsx` を作成
- [ ] `components/ui/index.ts` にエクスポート追加
- [ ] `components/ui/registry.tsx` にデモコンポーネントとエントリ追加
- [ ] FloatingNavのユニットテスト作成（`components/ui/__tests__/FloatingNav.test.tsx`）

## フェーズ2: 戻るボタンのみのページ移行（7ページ）
- [ ] `app/settings/page.tsx` → FloatingNav適用 + ヘッダー削除
- [ ] `app/notifications/page.tsx` → FloatingNav適用 + ヘッダー削除
- [ ] `app/contact/page.tsx` → FloatingNav適用 + ヘッダー削除
- [ ] `app/changelog/page.tsx` → FloatingNav適用 + ヘッダー削除
- [ ] `app/brewing/page.tsx` → FloatingNav適用 + ヘッダー削除
- [ ] `app/terms/page.tsx` → FloatingNav適用 + ヘッダー削除
- [ ] `app/privacy-policy/page.tsx` → FloatingNav適用 + ヘッダー削除

## フェーズ3: 右アクション付きページ移行（5ページ）
- [ ] `app/assignment/page.tsx` → FloatingNav適用（right: 設定ボタン）
- [ ] `app/drip-guide/page.tsx` → FloatingNav適用（right: 新規ボタン）
- [ ] `app/dev-stories/page.tsx` → FloatingNav適用（right: キャラ画像群）
- [ ] `app/coffee-trivia/page.tsx` → FloatingNav適用（right: ヘルプボタン）
- [ ] `app/schedule/page.tsx` → FloatingNav適用（right: 日付カード）

## フェーズ4: 複雑なページ移行（4ページ）
- [ ] `app/defect-beans/page.tsx` → FloatingNav適用（right: ソート・比較・追加ボタン）
- [ ] `app/roast-record/page.tsx` → FloatingNav適用（ビュー別backHref/right切替）
- [ ] `app/tasting/page.tsx` → FloatingNav適用（ビュー切替対応）
- [ ] `app/progress/page.tsx` → FloatingNav適用（ProgressHeader置換）

## フェーズ5: 検証・クリーンアップ
- [ ] 全対象ページのビジュアル確認（Playwright スクリーンショット）
- [ ] テーマ切替の確認（7テーマ）
- [ ] `npm run lint && npm run build && npm run test:run` 通過
- [ ] 不要になったコード・インポートの削除
- [ ] ProgressHeader廃止可否の判断・対応

## 依存関係
- フェーズ1 → フェーズ2, 3, 4（FloatingNav完成後に移行開始）
- フェーズ2, 3, 4 → フェーズ5（全移行完了後に検証）
- フェーズ2, 3, 4 は並行実行可能（ただしフェーズ2から順に着手推奨）
