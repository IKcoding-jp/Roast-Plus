# design.md — #328 スプラッシュ画面復元

## アーキテクチャ

```
app/layout.tsx
  └── <SplashScreenWrapper />   ← レイアウト最上位に配置（全ページ共通）
        └── dynamic import (ssr: false)
              └── <SplashScreen />
                    └── splashPatterns[randomIndex].Component
```

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `components/splash/patterns.tsx` | 5パターンのアニメーションコンポーネント定義 |
| `components/SplashScreen.tsx` | 表示制御・タイマー管理・フェードアウト |
| `components/SplashScreenWrapper.tsx` | SSR無効化ラッパー (dynamic import) |

## SplashScreen の表示ロジック

```
アプリ起動
  → sessionStorage.getItem('roastplus_splash_shown') === 'true'?
    → YES: スプラッシュ非表示
    → NO:  sessionStorage.setItem('roastplus_splash_shown', 'true')
            → ランダムパターン選択
            → isVisible = true
            → 2800ms後 フェードアウト開始
            → 3300ms後 isVisible = false
```

## page.tsx の splashVisible との関係

```typescript
// SplashScreen は layout.tsx で全ページ共通でレンダリング
// page.tsx の splashVisible は Loading 表示タイミング制御のみ
if ((loading || checkingConsent) && !splashVisible) {
  return <Loading />;
}
```

スプラッシュが全面に表示されている間は `<Loading />` を隠す。
スプラッシュが消えた後（SPLASH_DISPLAY_TIME + 300ms）、まだ認証中なら `<Loading />` を表示する。

## breathe アニメーション

PatternScaleBreathe が使用する `animate-[breathe_2s_ease-in-out_infinite]`。
`<style jsx global>` は Next.js 15+ では動作しないため、`globals.css` に定義する。

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
```

→ `app/globals.css` に既に定義済みか確認すること。未定義なら追加する。

## 色定義

| 要素 | 色コード |
|------|---------|
| スプラッシュ背景 | `#261a14` |
| ロゴ "Roast" | `#FFFFFF` |
| ロゴ "Plus" | `#EF8A00` |
| ライン | `linear-gradient(90deg, transparent, #D67A00 30%, #EF8A00, #D67A00 70%, transparent)` |
| サブテキスト | `rgba(255,255,255,0.4)` |

manifest.json の `background_color: #261a14` と一致しており、OSネイティブスプラッシュからのシームレス遷移が実現される。
