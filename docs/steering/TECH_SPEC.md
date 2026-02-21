# Technical Specification

**最終更新**: 2026-02-21

---

## アーキテクチャ概要

RoastPlusは、**PWA（Progressive Web App）** として設計されたモバイルファーストのコーヒー焙煎・抽出業務支援アプリです。フロントエンドはNext.js 16（App Router）で構築し、バックエンドはFirebase（BaaS）を使用。AI機能はFirebase Cloud Functions v2経由でOpenAI GPT-4oを呼び出します。

```
┌─────────────────────────────────────────────────┐
│            クライアント（PWA）                    │
│   Next.js 16 + React 19 + TypeScript 5          │
│   Tailwind CSS v4 + Framer Motion + Lottie      │
│   カスタム Service Worker（public/sw.js）        │
└──────────────────┬──────────────────────────────┘
                   │ Firebase SDK（クライアント直接）
                   ↓
┌─────────────────────────────────────────────────┐
│             Firebase（BaaS）                     │
│   - Authentication（Google, Email/Password）     │
│   - Firestore（NoSQL, リアルタイム同期）         │
│   - Storage（画像アップロード）                  │
│   - Hosting（本番デプロイ先）                    │
└──────────────────┬──────────────────────────────┘
                   │ Cloud Functions v2（サーバーレス）
                   ↓
┌─────────────────────────────────────────────────┐
│             AI Services                          │
│   OpenAI GPT-4o（Cloud Functions経由のみ）      │
│   - ocrScheduleFromImage（Vision OCR）          │
│   - analyzeTastingSession（テキスト分析）        │
│                                                  │
│   ※ クライアントから直接呼び出さない             │
│   ※ OPENAI_API_KEY は Secret Manager で管理     │
└─────────────────────────────────────────────────┘
```

**重要な設計原則**:
- Next.js API Routesは使用しない（`output: 'export'` による静的エクスポート）
- AI処理はすべてCloud Functions経由（クライアントサイドにAPIキーを持たない）
- 状態管理はReact useState のみ（Zustand/Reduxは不使用）

---

## フロントエンド

### Next.js 16（App Router）
- **バージョン**: ^16.0.8
- **ルーティング**: App Router（`app/` ディレクトリ）
- **ビルド**: 静的エクスポート（`output: 'export'`）
- **設定**: `trailingSlash: true`, `images.unoptimized: true`
- **レンダリング**: Client Components中心（`'use client'`）。静的エクスポートのためSSR/RSCは限定的

### React 19
- **バージョン**: 19.2.0
- **状態管理**: `useState` のみ使用（外部ライブラリ不使用）
- **機能活用**: Suspense, useTransition

### TypeScript 5
- **バージョン**: ^5
- **設定**: `strict: true`, `target: ES2017`
- **パスエイリアス**: `@/*` = `./*`（プロジェクトルート）
- **型定義方針**: `interface` 優先、ユニオン型は `type`（ADR-006参照）

---

## スタイリング

### Tailwind CSS v4
- **バージョン**: ^4
- **方針**: ユーティリティファーストCSS
- **CSS Modules**: 不使用
- **繰り返しパターン**: 定数化（例: `DIFFICULTY_STYLES`）
- **クラス結合**: `clsx` + `tailwind-merge`（`cn()` ユーティリティ）

### テーマシステム（next-themes + CSS変数）

7テーマをCSS変数で管理。`data-theme` 属性で切り替え。

| テーマ名 | 明暗 | 説明 |
|---------|------|------|
| `default` | ライト | 標準（デフォルト） |
| `dark-roast` | ダーク | 深煎りイメージ |
| `light-roast` | ライト | 浅煎りイメージ |
| `matcha` | ダーク | 抹茶イメージ |
| `caramel` | ダーク | キャラメルイメージ |
| `christmas` | ダーク | クリスマス限定 |
| `dark` | ダーク | 汎用ダークモード（WCAG AA 14.5:1） |

- **ライブラリ**: `next-themes`（^0.4.6）
- **テーマ定義**: `@layer theme` + CSS変数（`globals.css`）
- **切替属性**: `data-theme` 属性（`<html>` 要素）
- **ストレージキー**: `roastplus_theme`（localStorage）
- **SSR対応**: フラッシュ防止、タブ間同期

#### セマンティックCSS変数トークン

| カテゴリ | トークン | 用途 |
|---------|---------|------|
| 背景 | `--page`, `--surface`, `--overlay`, `--ground`, `--field` | ページ / カード / モーダル / セクション / 入力欄 |
| テキスト | `--ink`, `--ink-sub`, `--ink-muted` | 本文 / 補足 / ヒント |
| ボーダー | `--edge`, `--edge-strong` | 通常 / 強調 |
| アクセント | `--spot`, `--spot-hover`, `--spot-subtle`, `--spot-surface` | ハイライト / ホバー / 淡い背景 / 表面 |

#### Tailwindユーティリティ

CSS変数は `@theme inline` でTailwindユーティリティとして自動登録される:
- `bg-page`, `bg-surface`, `bg-overlay`, `bg-ground`, `bg-field`
- `text-ink`, `text-ink-sub`, `text-ink-muted`
- `border-edge`, `border-edge-strong`
- `bg-spot`, `bg-spot-hover`, `bg-spot-subtle`, `bg-spot-surface`

#### CSS変数の使い分け（重要）

| 変数 | default | christmas | 用途 |
|------|-----------|----------------|------|
| `bg-surface` | `#FFFFFF` | `rgba(255,255,255,0.05)` | カード・セクション（半透明OK） |
| `bg-overlay` | `#FFFFFF` | `#0a2f1a` | モーダル・ダイアログ（不透明必須） |
| `bg-ground` | `#F3F4F6` | `rgba(255,255,255,0.08)` | ページ背景・テーブルヘッダー |

### Framer Motion
- **バージョン**: ^12.23.24
- **用途**: ページトランジション、コンポーネントアニメーション、ジェスチャー
- **テーマ連動**: christmasテーマの雪の結晶アニメーション（SVG + Framer Motion）

### Lottie
- **ライブラリ**: `lottie-react`（^2.4.1）
- **用途**: 複雑なアニメーション（JSON形式）
- **配置**: `public/animations/`

---

## バックエンド・データベース

### Firebase

**バージョン**: firebase ^12.5.0

#### Authentication
- **認証方法**: Google, Email/Password
- **ユーザー管理**: Firebase Auth
- **セッション**: Firebase Auth トークン（クライアント管理）

#### Firestore（NoSQL）

- **データモデル**: ドキュメント指向
- **リアルタイム同期**: `onSnapshot` リスナー
- **オフライン対応**: ローカルキャッシュ（IndexedDB）
- **トランザクション**: `runTransaction` で整合性保証

**データモデル構造**:

```
Firestore
├── users/{userId}                          # ユーザードキュメント
│   ├── (document fields)
│   │   ├── todaySchedules                  # 本日のスケジュール
│   │   ├── roastSchedules                  # 焙煎スケジュール
│   │   ├── tastingSessions                 # テイスティングセッション
│   │   ├── tastingRecords                  # テイスティング記録
│   │   ├── workProgresses                  # 作業進捗
│   │   ├── roastTimerRecords               # 焙煎タイマー記録
│   │   └── dripRecipes                     # ドリップレシピ
│   ├── (subcollections - 担当表機能)
│   │   ├── teams/{teamId}                  # チーム
│   │   ├── members/{memberId}              # メンバー
│   │   ├── taskLabels/{labelId}            # タスクラベル
│   │   ├── assignmentDays/{dayId}          # 担当日
│   │   ├── shuffleEvents/{eventId}         # シャッフルイベント
│   │   ├── shuffleHistory/{historyId}      # シャッフル履歴
│   │   ├── assignmentSettings/{settingId}  # 担当設定
│   │   ├── managers/{managerId}            # 管理者
│   │   └── pairExclusions/{exclusionId}    # ペア除外設定
│
├── quiz_progress/{userId}                  # クイズ進捗データ
│
├── defectBeans/{beanId}                    # 欠点豆データ
│
└── _meta/                                  # メタデータ
```

#### Storage
- **用途**: 画像アップロード（スケジュール画像のOCR用）
- **パス構造**: `users/{userId}/{collection}/{fileId}`

#### Hosting
- **本番**: Firebase Hosting（`roastplus.web.app`）
- **代替**: Vercel（git push自動デプロイ）
- **環境**: default（本番）, development（開発）

### Cloud Functions v2

**ディレクトリ**: `functions/`
**ランタイム**: Node.js（TypeScript）
**SDKバージョン**: `firebase-functions/v2/https`

| 関数名 | 用途 | AIモデル |
|--------|------|---------|
| `ocrScheduleFromImage` | ホワイトボード画像のOCR（スケジュール読み取り） | GPT-4o Vision |
| `analyzeTastingSession` | テイスティングセッションのAI分析 | GPT-4o |

**重要**: AI処理はすべてCloud Functions経由。クライアントからOpenAI APIを直接呼び出さない。

---

## PWA（Progressive Web App）

### Service Worker
- **実装**: カスタム手書きService Worker（`public/sw.js`）
- **next-pwa**: 不使用（ADR-007参照）
- **キャッシュ名**: `roast-plus-v3`
- **キャッシュ戦略**: Network First

### オフライン対応
- Firestoreローカルキャッシュ（IndexedDB）
- Service Workerによる静的ファイルキャッシュ

### マニフェスト
- **ファイル**: `public/site.webmanifest`
- **アイコン**: 各サイズのPNG（36x36 ~ 192x192）
- **iOS対応**: `apple-touch-icon.png`

---

## AI機能

### 実装方式

AI機能はFirebase Cloud Functions v2経由でOpenAI APIを呼び出す。

- **モデル**: OpenAI GPT-4o（Geminiは不使用）
- **APIキー管理**: Firebase Secret Manager（`OPENAI_API_KEY`）
- **クライアント側**: Cloud Functionsの `httpsCallable` で呼び出し
- **パッケージ**: `openai` ^6.16.0（Cloud Functions内のみ）

### OCR（スケジュール画像解析）

- **関数**: `ocrScheduleFromImage`
- **入力**: ホワイトボード写真（Base64）
- **処理**: GPT-4o Visionで画像解析 → 構造化データ抽出
- **出力**: スケジュールデータ（時間、担当者、作業内容）

### テイスティング分析

- **関数**: `analyzeTastingSession`
- **入力**: テイスティングセッションの評価データ
- **処理**: GPT-4oでフレーバー分析 → テキスト生成
- **出力**: 分析結果テキスト（フレーバーノート、改善提案）
- **トリガー**: セッション保存時に自動実行（ADR-005参照）

---

## テスト

### ユニットテスト・コンポーネントテスト（Vitest）

- **バージョン**: Vitest ^4.0.18
- **環境**: jsdom（ブラウザ環境シミュレーション）
- **カバレッジ**: `@vitest/coverage-v8` ^4.0.18（text, html形式）
- **設定**: `vitest.config.ts`（パスエイリアス `@/`）
- **UIテスト**: `@testing-library/react` ^16.3.2, `@testing-library/jest-dom` ^6.9.1
- **Reactプラグイン**: `@vitejs/plugin-react` ^5.1.2

### テストファイル構成

| カテゴリ | ファイル数 | 内容 |
|---------|----------|------|
| `lib/` テスト | 28 | ビジネスロジックのユニットテスト |
| `hooks/` テスト | 6 | カスタムフックのテスト |
| `components/` テスト | 20 | UIコンポーネントテスト |

### カバレッジ目標・実績

| 対象 | 目標 | 実績（2026-02-21時点） |
|------|------|----------------------|
| 全体 | 75%以上 | 76.19% |
| lib/ | 90%以上 | 89.44% |
| hooks/ | 85%以上 | 87.9% |

- **総テスト数**: 1054+テスト（100%合格）

### E2Eテスト（Playwright）

- **バージョン**: Playwright ^1.58.2
- **ブラウザ**: Chromium
- **設定**: `playwright.config.ts`

| カテゴリ | ディレクトリ | 内容 |
|---------|------------|------|
| ページ統合 | `e2e/pages/` | home, quiz, roast-timer, schedule, tasting |
| ユーザーフロー | `e2e/flows/` | data-management-flow, quiz-flow, roast-timer-flow |
| レスポンシブ | `e2e/responsive/` | 各ビューポートでの表示確認 |
| アクセシビリティ | `e2e/accessibility/` | axe-coreによる自動検査 |
| パフォーマンス | `e2e/performance/` | ページロード速度等 |
| フィクスチャ | `e2e/fixtures/` | mockFirebase, テストデータ |

---

## CI/CD

### 現在の構成

#### Husky + lint-staged
- **Husky**: ^9.1.7（Git pre-commit hook）
- **lint-staged**: コミット前にESLintを自動実行
- **対象**: `*.ts`, `*.tsx`, `*.js`, `*.jsx`

**注意**: Gitleaks（シークレット検出）は未導入。

#### ESLint
- **バージョン**: ESLint ^9
- **設定**: `eslint-config-next`（core-web-vitals + typescript）
- **ポリシー**: Lintエラー・warningは常にゼロを維持

#### Knip
- **バージョン**: ^5.82.1
- **用途**: デッドコード・未使用依存関係の検出

### デプロイ

| デプロイ先 | コマンド | 備考 |
|-----------|---------|------|
| Firebase Hosting | `npm run build && firebase deploy --only hosting` | 手動デプロイ |
| Vercel | `git push`（自動デプロイ） | Git連携 |

### 計画中

- **GitHub Actions**: PR作成時のテスト自動実行、mainマージ時の自動デプロイ

---

## セキュリティ

### 依存関係監査
- `npm audit`: 脆弱性検出

### Firestore Security Rules
- ユーザー認証必須
- ドキュメント所有者のみ編集可能
- 読み取りは認証済みユーザーに限定

### 環境変数

| 変数 | 用途 | 管理場所 |
|------|------|---------|
| `NEXT_PUBLIC_FIREBASE_*`（6個） | Firebase設定 | `.env.local` |
| `NEXT_PUBLIC_EMAILJS_*`（3個） | EmailJS設定 | `.env.local` |
| `NEXT_PUBLIC_APP_VERSION` | アプリバージョン | `package.json` から自動取得 |
| `OPENAI_API_KEY` | OpenAI APIキー | Firebase Secret Manager（Cloud Functions専用） |

**重要**: `OPENAI_API_KEY` はクライアントに公開しない。Cloud Functions内でのみ使用。

---

## パフォーマンス最適化

### コード分割
- Next.js動的インポート（`next/dynamic`）
- React.lazy（コンポーネント遅延ロード）

### 画像
- `images.unoptimized: true`（静的エクスポートのため`next/image`最適化は無効）
- 手動での画像最適化が必要

### バンドルサイズ削減
- Tree Shaking（未使用コード除去）
- Knip（デッドコード検出ツール）

### Service Worker
- Network Firstキャッシュ戦略でオフライン時の表示速度を確保

---

## 技術的な制約

### 静的エクスポートの制約
- `output: 'export'` のため、Next.js API Routesは使用不可
- サーバーサイドの処理はすべてFirebase Cloud Functionsで実装
- `next/image` の自動最適化は無効（`images.unoptimized: true`）

### Firestoreの制約
- **書き込み制限**: 1ドキュメントあたり1秒間に1回
- **クエリ制限**: 複合クエリはインデックス必要
- **トランザクション制限**: 500ドキュメントまで
- **ドキュメントサイズ**: 1MB上限

### PWAの制約
- **iOSの制約**: Service Workerの一部機能が制限（Push通知等）
- **ストレージ制限**: IndexedDBは50MB程度（デバイス依存）

### AI機能の制約
- Cloud Functions経由のため、レスポンスにレイテンシがある
- OpenAI APIの利用料金が発生

---

## ADR（Architecture Decision Records）

技術選定の意思決定記録。各ADRは「背景 → 選択肢 → 決定 → 理由」の形式で記録。

### ADR-001: Next.js + Firebase PWA構成

- **決定**: Next.js（App Router）+ Firebase（BaaS）でPWAを構築
- **理由**:
  - PWA対応でモバイルアプリ不要
  - Firestoreのリアルタイム同期で複数端末対応
  - オフラインサポート（IndexedDB + Service Worker）
  - サーバーレス運用でインフラ管理コストゼロ
  - 小規模チーム（8名）に最適なスケール

### ADR-002: Tailwind CSS v4 採用

- **決定**: Tailwind CSS v4をスタイリング基盤として採用
- **理由**:
  - 高速なプロトタイピング（ユーティリティファースト）
  - コンポーネントとスタイルの密結合による可読性
  - v4の`@theme inline`によるCSS変数のネイティブ統合
  - CSS Modulesより保守性が高い

### ADR-003: Vitest 採用（Jest → Vitest）

- **決定**: JestからVitestに移行
- **理由**:
  - Vite互換の高速テスト実行
  - ESMネイティブサポート
  - Next.jsとの親和性が高い
  - Jest互換APIで移行コストが低い
  - `@vitejs/plugin-react` との統合

### ADR-004: OCR処理のOpenAI統一（Google Vision API → OpenAI）

- **決定**: OCR処理をGoogle Vision APIからOpenAI GPT-4o Visionに統一
- **理由**:
  - Google Vision APIキーの認証エラー問題を解消
  - OpenAI一本化によるコードの簡潔化（APIクライアントが1つに）
  - GPT-4o Visionの精度がホワイトボードOCRに十分
  - APIキー管理の一元化

### ADR-005: AI分析を自動実行パターンに変更

- **決定**: テイスティングAI分析を保存時に自動実行するパターンに変更
- **理由**:
  - UX改善: 分析結果がない場合にユーザーがボタンを探す手間を削減
  - セッション保存と同時に分析を開始し、結果を非同期で表示
  - 手動実行ボタンは残しつつ、基本は自動実行

### ADR-006: 型定義はinterface優先

- **決定**: TypeScript型定義は`interface`を優先的に使用
- **理由**:
  - `extends`による拡張性が高い
  - エラーメッセージが読みやすい（型名が表示される）
  - ユニオン型など`interface`で表現できないケースのみ`type`を使用

### ADR-007: カスタムService Worker採用（next-pwaを使わない）

- **決定**: `next-pwa`パッケージを使わず、カスタム手書きのService Worker（`public/sw.js`）を採用
- **理由**:
  - 静的エクスポート（`output: 'export'`）との互換性
  - キャッシュ戦略の完全な制御（Network First）
  - `next-pwa`の依存関係・メンテナンスリスクを回避
  - シンプルな要件（キャッシュ名: `roast-plus-v3`）に対して軽量

### ADR-008: ロゴを画像からテキストベースに変更

- **決定**: アプリロゴを画像ファイルからテキストベース（CSS）に変更
- **理由**:
  - テーマ切替時にロゴ色を動的に変更可能
  - 画像ファイルの管理が不要
  - レスポンシブ対応が容易

### ADR-009: （予約）

### ADR-010: 機能別モジュール分割パターン

- **決定**: lib/, hooks/, components/ を機能単位でサブディレクトリに分割
- **理由**:
  - 機能の凝集度を高め、変更影響範囲を限定
  - 例: `lib/coffee-quiz/`, `hooks/drip-guide/`, `components/roast-timer/`
  - 依存方向: `types/` → `lib/` → `hooks/` → `components/` → `app/`（循環依存禁止）

### ADR-011: next-themes + Tailwind v4 CSS変数によるテーマシステム

- **決定**: `next-themes` + Tailwind CSS v4のCSS変数でマルチテーマシステムを構築
- **背景**: クリスマスモードの追加を契機に、2テーマから6テーマに拡張。その後、目の疲れ防止の要望を受け汎用ダークモード（`dark`）を追加して7テーマへ
- **理由**:
  - `data-theme`属性 + CSS変数で、コンポーネント側のテーマ判定が不要
  - Tailwind v4の`@theme inline`でCSS変数をユーティリティとして直接使用可能
  - `next-themes`でSSRフラッシュ防止、タブ間同期、localStorage永続化を実現
  - セマンティックトークン（`--page`, `--ink`, `--edge`等）で意味的な色指定

---

## 新しいADRの追加プロセス

新しい技術選定が必要な場合:

1. **調査**: 複数の選択肢を比較検討
2. **ADR作成**: 本ファイルに `ADR-XXX` として追記
3. **検証**: PoC（Proof of Concept）で実現性を確認
4. **承認**: ユーザーの承認を得る
5. **実装**: プロダクションに適用
