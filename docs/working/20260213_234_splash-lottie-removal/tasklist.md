# タスクリスト

**Issue**: #234
**作成日**: 2026-02-13
**ステータス**: ✅ 完了
**完了日**: 2026-02-13

## フェーズ1: ファイル削除
- [x] `components/SplashScreen.tsx` を削除
- [x] `components/SplashScreenWrapper.tsx` を削除
- [x] `components/splash/` ディレクトリごと削除（patterns.tsx）
- [x] `app/dev/splash-preview/` ディレクトリごと削除
- [x] `app/dev/design-lab/components/PatternComparison.tsx` を削除（追加発見）
- [x] `app/dev/design-lab/components/sections/AnimationShowcase.tsx` を削除（追加発見）
- [x] `app/dev/design-lab/components/FullscreenPreview.tsx` を削除（未使用化）

## フェーズ2: 参照削除
- [x] `app/layout.tsx` - SplashScreenWrapper の importとレンダリングを削除
- [x] `components/home/HomeHeader.tsx` - REPLAY_SPLASH_EVENT import、onShowLoadingDebugModal prop、開発者モードボタン2つを削除
- [x] `app/page.tsx` - スプラッシュ状態管理・Lottieデバッグモーダル一式を削除
- [x] `app/dev/design-lab/page.tsx` - AnimationShowcase・PatternComparison参照を削除
- [x] `app/dev/design-lab/components/registry.ts` - ナビゲーションエントリ2つを削除

## フェーズ3: 検証
- [x] `npm run build` が成功すること
- [x] `npm run lint` がエラーゼロであること
- [x] `npm run test` - 全1038テスト合格
- [x] 未使用importがないこと

## 依存関係
- フェーズ1 → フェーズ2（順次実行推奨だが並行も可）
- フェーズ2 → フェーズ3（必ず順次実行）
