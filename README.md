# RoastPlus (ローストプラス)

株式会社スタートラインが運営する「BYSN」でのコーヒー豆加工業務をITの力で効率化・サポートするためのWebアプリケーションです。
現場のニーズに合わせ、作業の割り当てから焙煎、ハンドピック、ドリップまでの一連のフローをデジタル化し、スムーズな作業を支援します。

## 🎯 プロジェクトの目的
コーヒー豆の加工作業には多くの工程と、利用者ごとの役割分担（担当表）の管理が必要です。
本アプリは、以下の課題を解決するために開発されました。
- **作業分担の公平化**: 独自のシャッフルロジックによる日々の担当割り当て。
- **作業効率の向上**: 焙煎やハンドピック時間の正確な計測と記録。
- **品質管理**: 不良豆（欠点豆）の知識共有と、ドリップ手順の標準化。
- **アクセシビリティ**: スマホやタブレットに最適化された、誰でも使いやすいUI/UX。

## ✨ 主な機能

### 1. 担当表自動作成 (Assignment Table)
- 日々の作業担当をランダムかつ公平に割り振り。
- 過去の履歴を考慮し、連続した担当やペアを回避するロジックを実装。
- メンバーの出欠確認や除外設定も可能。

### 2. 作業タイマー & ツール
- **ローストタイマー**: 焙煎時間を正確に計測。
- **ハンドピックタイマー**: 欠点豆の選別時間を管理し、集中力を維持。
- **ドリップガイド**: 自動/手動モードで、最適な湯量とタイミングをナビゲート。

### 3. 情報共有・管理
- **スケジュール確認**: 一日の流れを把握。
- **コーヒー豆図鑑**: 写真付きで欠点豆の特徴を学習可能。
- **作業進捗**: 各工程の進み具合を可視化。

### 4. その他機能
- **PWA対応**: ホーム画面に追加してネイティブアプリのように利用可能。
- **試飲感想記録**: 出来上がったコーヒーの味を記録・蓄積。

## 🛠 技術スタック

モダンかつ高パフォーマンスな技術選定を行っています。

- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (PostCSS)
- **Backend / Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **UI Libraries**: Framer Motion (アニメーション), React Icons
- **PWA**: Service Worker, Web App Manifest
- **Font**: Next.js Font Optimization (Geist, Noto Serif JP, etc.)

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js (v20以上推奨)
- npm

### インストール手順

1. リポジトリをクローン
   ```bash
   git clone https://github.com/your-username/roast-plus.git
   cd roast-plus
   ```

2. 依存関係のインストール
   ```bash
   npm install
   ```

3. 環境変数の設定
   `.env.local` ファイルを作成し、Firebaseの設定情報を記述します。
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   ...
   ```

4. 開発サーバーの起動
   ```bash
   npm run dev
   ```
   ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

## 📱 対応デバイス
- スマートフォン (iOS / Android)
- タブレット (iPad等)
- PCブラウザ

## 👏 こだわりポイント
- **UI/UX**: 毎日使うツールだからこそ、直感的で心地よい操作感（マイクロインタラクション、スムーズなアニメーション）を追求しました。
- **最新技術への挑戦**: React 19 や Tailwind CSS v4 などの最新技術を積極的に採用し、将来性とパフォーマンスを確保しています。
