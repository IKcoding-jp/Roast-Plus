# タスクリスト

**Issue**: #234
**作成日**: 2026-02-13

## フェーズ1: ファイル削除
- [ ] `components/SplashScreen.tsx` を削除
- [ ] `components/SplashScreenWrapper.tsx` を削除
- [ ] `components/splash/` ディレクトリごと削除（patterns.tsx）
- [ ] `app/dev/splash-preview/` ディレクトリごと削除

## フェーズ2: 参照削除
- [ ] `app/layout.tsx` - SplashScreenWrapper の import（8行目）とレンダリング（103行目）を削除
- [ ] `components/home/HomeHeader.tsx` - REPLAY_SPLASH_EVENT import、onShowLoadingDebugModal prop、開発者モードボタン2つを削除
- [ ] `app/page.tsx` - 以下を削除:
  - `Loading` import（デバッグモーダル用）
  - `SPLASH_DISPLAY_TIME` 定数
  - `splashVisible` state
  - `showLoadingDebugModal` state
  - スプラッシュ表示時間管理 useEffect
  - `handleShowLoadingDebugModal` 関数
  - Lottieデバッグモーダル JSX
  - `HomeHeader` の `onShowLoadingDebugModal` prop
  - `splashVisible` 条件分岐の調整

## フェーズ3: 検証
- [ ] `npm run build` が成功すること
- [ ] `npm run lint` がエラーゼロであること
- [ ] 未使用importがないこと

## 依存関係
- フェーズ1 → フェーズ2（順次実行推奨だが並行も可）
- フェーズ2 → フェーズ3（必ず順次実行）
