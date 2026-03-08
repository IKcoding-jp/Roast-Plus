# tasklist.md — #328 スプラッシュ画面復元

## Phase 1: ファイル復元

- [x] `components/splash/patterns.tsx` を作成（git履歴 1a0660d から復元）
  - PatternFadeUp, PatternScaleBreathe, PatternLetterStagger, PatternSlideReveal, PatternGlowPulse
  - splashPatterns 配列をエクスポート
- [x] `components/SplashScreen.tsx` を作成（git履歴 1a0660d から復元）
  - sessionStorage で初回起動のみ表示ロジック
  - 5パターンからランダム選択
  - フェードアウトアニメーション（SPLASH_DISPLAY_TIME = 2800ms）
- [x] `components/SplashScreenWrapper.tsx` を作成（git履歴 から復元）
  - dynamic import で SSR 無効化

## Phase 2: 既存ファイル更新

- [x] `app/layout.tsx`
  - `SplashScreenWrapper` を import
  - `<body>` 内の `<ServiceWorkerRegistration />` の前後に `<SplashScreenWrapper />` を追加

- [x] `app/page.tsx`
  - `splashVisible` 状態管理を再追加（`useState(true)` で初期値 true）
  - `SPLASH_DISPLAY_TIME + 300` ms 後に `splashVisible = false` にするタイマーを useEffect で追加
  - Loading の表示条件を `(loading || checkingConsent) && !splashVisible` に変更
  - スプラッシュ表示中はローディングインジケータを隠す（スプラッシュが前面に表示されるため）

## Phase 3: 検証

- [x] `npm run lint` でエラー 0
- [x] `npm run build` が成功
- [x] `npm run test:run` が全テストパス（1167テスト 100%合格）
- [x] E2Eテスト通過（個別スイートで全通過）

**ステータス**: ✅ 完了
**完了日**: 2026-03-08

## 参考コミット

- 削除コミット: `271b3d9` (chore(#234))
- 最終版コード: `1a0660d` (feat: スプラッシュ画面をリデザインし5パターンのランダムアニメーションを実装)

## 注意事項

- `REPLAY_SPLASH_EVENT` は不要（開発者用ボタンを復元しないため）
- `compact` プロパティは patterns.tsx に残す（将来の拡張性のため）
- `jsx` の `<style jsx global>` は Next.js では動作しないため、Tailwind の `@keyframes` or `globals.css` に移動する必要あり
  → `breathe` アニメーションは `globals.css` に定義済みか確認すること
