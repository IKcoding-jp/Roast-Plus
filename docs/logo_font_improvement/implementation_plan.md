# ロゴフォントの改善計画

ホーム画面のロゴを、コーヒーやカフェのような上品で洗練されたデザインにアップデートします。

## 提案される変更

### 1. フォントの選定
- 英語部分 (`Roast Plus`) には、高級感のあるセリフ体である `Playfair Display` を使用します。
- 日本語部分 (`ローストプラス`) には、既存の `Noto Serif JP` を活用しつつ、ウェイトやレタースペーシングを調整して上品さを演出します。

### 2. コンポーネントの修正

#### [MODIFY] [app/layout.tsx](file:///d:/Dev/roastplus/app/layout.tsx)
- 必要なフォントが適切にインポートされているか確認します（既に `Playfair_Display` と `Noto_Serif_JP` はインポート済み）。

#### [MODIFY] [app/page.tsx](file:///d:/Dev/roastplus/app/page.tsx)
- ロゴを画像 (`/logo.png`) からテキストベースに変更します。
- クリスマスモード以外の通常時でも、上品なタイポグラフィとカラー（深いブラウンやシャンパンゴールドなど）を適用します。

#### [MODIFY] [components/SplashScreen.tsx](file:///d:/Dev/roastplus/components/SplashScreen.tsx)
- スプラッシュ画面のロゴも、ホーム画面と統一感のあるフォントとスタイリングに変更します。

#### [MODIFY] [app/login/page.tsx](file:///d:/Dev/roastplus/app/login/page.tsx)
- ログイン画面のロゴも同様にアップデートし、アプリ全体のブランディングを統一します。

## 検証計画

### 手動確認
- ブラウザでホーム画面、ログイン画面、スプラッシュ画面を表示し、フォントが正しく適用されているか確認します。
- クリスマスモードの切り替えが正しく機能し、ロゴのデザインが共存できているか確認します。
- レスポンシブ表示（モバイルとデスクトップ）でロゴのサイズやバランスが適切か確認します。
