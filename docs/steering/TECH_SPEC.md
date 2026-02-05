# Technical Specification

**最終更新**: 2026-02-05

---

## アーキテクチャ概要

RoastPlusは、**PWA（Progressive Web App）** として設計されたモバイルファーストの業務支援アプリです。

```
┌─────────────────────────────────────────┐
│         クライアント（PWA）              │
│  Next.js 16 + React 19 + TypeScript 5   │
│  Tailwind CSS v4 + Framer Motion        │
└──────────────┬──────────────────────────┘
               │
               ↓ Firebase SDK
┌─────────────────────────────────────────┐
│          Firebase（BaaS）                │
│  - Authentication（Google, Email/Pass）  │
│  - Firestore（NoSQL, リアルタイム）      │
│  - Storage（画像・ファイル）             │
│  - Hosting（デプロイ先）                 │
└─────────────────────────────────────────┘
               │
               ↓ Functions（サーバーレス）
┌─────────────────────────────────────────┐
│          AI Services                     │
│  - OpenAI GPT-4o Vision（OCR）          │
│  - OpenAI GPT-4o（テイスティング分析）  │
└─────────────────────────────────────────┘
```

---

## フロントエンド

### Next.js 16（App Router）
- **バージョン**: Next.js 16.1.1
- **ルーティング**: App Router（`app/` ディレクトリ）
- **レンダリング**: React Server Components（RSC）+ Client Components（`'use client'`）
- **静的生成**: 動的ルート（Issue Based Rendering）

### React 19
- **バージョン**: React 19.0.0
- **新機能活用**: Server Components, Suspense, useTransition

### TypeScript 5
- **バージョン**: TypeScript 5.6.3
- **設定**: `strict: true`, `noImplicitAny: true`
- **パスエイリアス**: `@/` = プロジェクトルート

### 関連ADR
- [ADR-001] Next.js + Firebase PWA構成（`docs/memory.md` 参照）

---

## スタイリング

### Tailwind CSS v4
- **バージョン**: Tailwind CSS v4
- **方針**: ユーティリティファーストCSS、CSS Modules不使用
- **ブランドカラー**: `#211714`（深茶色）
- **繰り返しパターン**: 定数化（例: `DIFFICULTY_STYLES`）

### Framer Motion
- **バージョン**: Framer Motion 11.x
- **用途**: アニメーション、トランジション、ジェスチャー
- **クリスマスモード**: 雪の結晶アニメーション（SVG + Framer Motion）

### Lottie
- **用途**: 複雑なアニメーション（JSON形式）
- **配置**: `public/lottie/`

### 関連ADR
- [ADR-002] Tailwind CSS v4 採用（`docs/memory.md` 参照）
- [ADR-008] ロゴを画像からテキストベースに変更（`docs/memory.md` 参照）

---

## バックエンド・データベース

### Firebase

#### Authentication
- **認証方法**: Google, Email/Password
- **ユーザー管理**: Firebase Auth
- **セキュリティ**: Firestore Security Rules

#### Firestore（NoSQL）
- **データモデル**: ドキュメント指向（コレクション→ドキュメント→サブコレクション）
- **リアルタイム同期**: `onSnapshot` リスナー
- **オフライン対応**: ローカルキャッシュ（IndexedDB）
- **トランザクション**: `runTransaction` で整合性保証

**主要コレクション**:
| コレクション | 内容 |
|------------|------|
| `users` | ユーザープロファイル |
| `assignments` | 担当表 |
| `tastingSessions` | テイスティング記録 |
| `quizProgress` | クイズ進捗 |
| `dripRecipes` | ドリップレシピ |

#### Storage
- **用途**: 画像アップロード（テイスティング写真、スケジュール画像）
- **パス構造**: `users/{userId}/{collection}/{fileId}`

#### Hosting
- **デプロイ先**: Firebase Hosting（または Vercel）
- **URL**: `roastplus.web.app`（Firebase）

### 関連ADR
- [ADR-001] Next.js + Firebase PWA構成（`docs/memory.md` 参照）

---

## PWA（Progressive Web App）

### Service Worker
- **実装**: Next.js組み込み（`next-pwa`）
- **キャッシュ戦略**: Network First（API）、Cache First（静的ファイル）

### オフライン対応
- Firestoreローカルキャッシュ
- 静的ファイルのService Workerキャッシュ

### ホーム画面追加
- `manifest.json`: アプリ名、アイコン、テーマカラー
- iOS対応: `apple-touch-icon`

---

## AI機能

### OpenAI GPT-4o Vision
- **用途**: OCR（スケジュール画像解析、焙煎温度ラベル読み取り）
- **エンドポイント**: `/api/ocr`
- **モデル**: `gpt-4o`（Vision対応）

### OpenAI GPT-4o
- **用途**: テイスティング分析（フレーバーホイール評価のテキスト生成）
- **エンドポイント**: `/api/analyze-tasting`
- **モデル**: `gpt-4o`

### 関連ADR
- [ADR-004] OCR処理のOpenAI統一（Google Vision API → OpenAI）（`docs/memory.md` 参照）
- [ADR-005] AI分析を自動実行パターンに変更（`docs/memory.md` 参照）

---

## テスト

### Vitest
- **バージョン**: Vitest 3.x
- **環境**: jsdom（ブラウザ環境シミュレーション）
- **カバレッジ**: text, html 形式
- **設定**: `vitest.config.ts`（パスエイリアス `@`）

### @testing-library/react
- **バージョン**: @testing-library/react 16.x
- **用途**: コンポーネントテスト
- **パターン**: `render`, `screen`, `fireEvent`, `waitFor`

### カバレッジ目標
- **全体**: 75%以上
- **lib/**: 90%以上
- **hooks/**: 85%以上

### 現在のカバレッジ（2026-02-05）
- **全体**: 76.19%
- **lib/**: 89.44%
- **hooks/**: 87.9%
- **総テスト数**: 342テスト（100%合格）

### 関連ADR
- [ADR-003] Vitest 採用（Jest → Vitest）（`docs/memory.md` 参照）

---

## CI/CD

### Husky
- **用途**: Git pre-commit hook
- **実行内容**: `lint-staged`（ESLint, Prettier）

### lint-staged
- **用途**: コミット前の自動Lint/Format
- **対象**: `*.ts`, `*.tsx`, `*.js`, `*.jsx`

### GitHub Actions（計画中）
- **自動テスト**: PR作成時にVitestテストを自動実行
- **自動デプロイ**: mainマージ時に自動デプロイ

### デプロイ先
- **Firebase Hosting**: `npm run build && firebase deploy --only hosting`
- **Vercel**: `git push origin main`（自動デプロイ）

---

## 開発ツール

### パッケージマネージャー
- **npm**: 10.x（標準）
- **uv**: Pythonスクリプト用（`scripts/`）

### Linter/Formatter
- **ESLint**: 9.x（Next.js推奨設定）
- **Prettier**: 3.x（コードフォーマット）

### バージョン管理
- **Git**: ブランチ戦略（mainブランチ直接コミット禁止）
- **セマンティックバージョニング**: `MAJOR.MINOR.PATCH`

---

## パフォーマンス最適化

### コード分割
- Next.js動的インポート（`next/dynamic`）
- React.lazy（コンポーネント遅延ロード）

### 画像最適化
- `next/image`（自動最適化、WebP変換）

### バンドルサイズ削減
- Tree Shaking（未使用コード除去）
- Knip（デッドコード検出）

---

## セキュリティ

### 依存関係監査
- **npm audit**: 脆弱性検出
- **Gitleaks**: シークレット検出（pre-commit hook）

### Firestore Security Rules
- ユーザー認証必須
- ドキュメント所有者のみ編集可能
- 読み取りは認証済みユーザーに限定

### 環境変数
- `.env.local`: Firebase設定、OpenAI APIキー
- `.gitignore`に追加（漏洩防止）

---

## 技術的な制約

### Firestoreの制約
- **書き込み回数制限**: 1ドキュメントあたり1秒間に1回
- **クエリ制限**: 複合クエリはインデックス必要
- **トランザクション制限**: 500ドキュメントまで

### PWAの制約
- **iOSの制約**: Service Workerの一部機能が制限（Push通知等）
- **ストレージ制限**: IndexedDBは50MB程度（デバイス依存）

---

## 今後の技術選定

### 検討中
- **Playwright**: E2Eテスト自動化（Chrome DevTools MCP → Playwright移行）
- **GitHub Actions**: CI/CD自動化
- **Sentry**: エラートラッキング

---

## ADR参照

技術選定の詳細な理由は `docs/memory.md` を参照：

| ADR | タイトル | 内容 |
|-----|---------|------|
| ADR-001 | Next.js + Firebase PWA構成 | PWA対応、リアルタイム同期、オフラインサポート、サーバーレス運用が可能 |
| ADR-002 | Tailwind CSS v4 採用 | 高速なプロトタイピング、コンポーネントとスタイルの密結合による可読性 |
| ADR-003 | Vitest 採用 | Vite互換の高速実行、ESM ネイティブサポート、Next.js との親和性 |
| ADR-004 | OCR処理のOpenAI統一 | Google Vision APIキーエラー問題の解消、OpenAI一本化によるコード簡潔化 |
| ADR-005 | AI分析を自動実行パターンに変更 | UX改善 — 分析結果がない場合に自動的に分析を開始 |
| ADR-006 | 型定義はinterface優先 | `interface` は extends による拡張性が高く、エラーメッセージが読みやすい |

---

## 次のステップ

新しい技術選定が必要な場合は、以下のプロセスを実施：

1. **調査**: 複数の選択肢を比較
2. **ADR作成**: `docs/memory.md` に ADR-XXX として追記
3. **実装**: PoC（Proof of Concept）で検証
4. **承認**: ユーザー（または開発チーム）の承認
5. **本実装**: プロダクションに適用
