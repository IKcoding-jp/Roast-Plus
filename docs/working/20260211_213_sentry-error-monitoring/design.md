# 設計書

**Issue**: #213
**作成日**: 2026-02-11

---

## 実装方針

### アーキテクチャ概要

```
┌─────────────────────────────────────────┐
│         クライアント（PWA）              │
│  - Next.js 16（静的エクスポート）        │
│  - @sentry/nextjs                       │
│  - ErrorBoundary（app/error.tsx）       │
└──────────────┬──────────────────────────┘
               │
               ↓ Sentry DSN
┌─────────────────────────────────────────┐
│         Sentry.io                        │
│  - エラートラッキング                    │
│  - スタックトレース解析                  │
│  - アラート通知                          │
└─────────────────────────────────────────┘
               ↑
               │ Sentry DSN
┌─────────────────────────────────────────┐
│       Cloud Functions                    │
│  - @sentry/node                          │
│  - ocrScheduleFromImage                  │
│  - analyzeTastingSession                 │
└─────────────────────────────────────────┘
```

---

## 技術選定

### Sentry SDKバージョン

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| `@sentry/nextjs` | `^8.x` | Next.jsクライアント・ビルドタイム統合 |
| `@sentry/node` | `^8.x` | Cloud Functions用（Node.js環境） |

**選定理由**:
- Next.js公式サポート
- 静的エクスポート対応（手動設定）
- Cloud FunctionsでもNode.js SDKで同じ体験

---

## 変更対象ファイル

### 新規作成ファイル

#### クライアント側

| ファイルパス | 役割 |
|-------------|------|
| `sentry.client.config.ts` | Sentry初期化（クライアント専用） |
| `app/global-error.tsx` | ルートレベルErrorBoundary（最上位フォールバック） |
| `app/error.tsx` | ページレベルErrorBoundary（汎用フォールバック） |
| `lib/sentry.ts` | Sentryヘルパー関数（`captureException` ラッパー） |

#### Cloud Functions側

| ファイルパス | 役割 |
|-------------|------|
| `functions/src/sentry.ts` | Sentry初期化ヘルパー（Node.js用） |

---

### 変更対象ファイル

#### 依存関係追加

- `package.json`: `@sentry/nextjs` 追加
- `functions/package.json`: `@sentry/node` 追加

#### 環境変数追加

- `.env.local` （ローカル開発）
- `.env.production` （本番ビルド）
- Firebase Functions Secrets （Cloud Functions用）

```env
# .env.local / .env.production
NEXT_PUBLIC_SENTRY_DSN=https://xxxx@o1234567.ingest.sentry.io/1234567
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development # or production
NEXT_PUBLIC_APP_VERSION=0.11.0
```

```bash
# Cloud Functions Secrets
firebase functions:secrets:set SENTRY_DSN
firebase functions:secrets:set SENTRY_ENVIRONMENT
```

#### 既存ファイル（段階的置き換え）

**重要度高（優先）**:
- `lib/auth.ts` (2箇所)
- `lib/scheduleOCR.ts` (2箇所)
- `lib/tastingAnalysis.ts` (1箇所)
- `lib/storage.ts` (2箇所)
- `lib/firestore/userData/crud.ts` (2箇所)
- `lib/firestore/userData/write-queue.ts` (1箇所)
- `lib/firestore/defectBeans.ts` (3箇所)

**重要度中**:
- `lib/localStorage.ts` (1箇所)
- `lib/notifications.ts` (4箇所)
- `lib/sounds.ts` (13箇所)
- `lib/emailjs.ts` (1箇所)

**重要度低**:
- `lib/drip-guide/useRecipes.ts` (2箇所)
- `lib/timeSync.ts` (1箇所)
- `lib/roastTimerSettings.ts` (3箇所)
- `lib/coffee-quiz/questions.ts` (2箇所)

**Cloud Functions**:
- `functions/src/ocr-schedule.ts` (3箇所)
- `functions/src/tasting-analysis.ts` (1箇所)

---

## ファイル別実装詳細

### 1. `sentry.client.config.ts`（新規）

```typescript
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development';
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.11.0';

// クライアント側のSentry初期化（静的エクスポート対応）
if (SENTRY_DSN && typeof window !== 'undefined') {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: `roastplus@${APP_VERSION}`,

    // トレーシング（パフォーマンス監視）
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0, // 本番10%、開発無効

    // エラーサンプリング
    sampleRate: 1.0, // 100%のエラーを送信

    // プライバシー設定
    beforeSend(event, hint) {
      // 開発環境ではSentryに送信しない（コンソールのみ）
      if (SENTRY_ENVIRONMENT === 'development') {
        console.error('[Sentry Dev]', hint.originalException || hint.syntheticException);
        return null;
      }
      return event;
    },

    // 個人情報スクラブ
    beforeBreadcrumb(breadcrumb) {
      // URLからクエリパラメータを削除（個人情報含む可能性）
      if (breadcrumb.category === 'navigation' && breadcrumb.data?.to) {
        breadcrumb.data.to = breadcrumb.data.to.split('?')[0];
      }
      return breadcrumb;
    },

    // 統合設定
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Session Replay（オプション、将来的に有効化）
    replaysSessionSampleRate: 0, // 無効
    replaysOnErrorSampleRate: 0, // エラー時のみ録画（将来的に0.1にする）
  });
}
```

**初期化タイミング**: `app/layout.tsx` でインポート（最上位で実行）

---

### 2. `app/global-error.tsx`（新規）

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // エラーをSentryに送信
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'global',
      },
    });
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            エラーが発生しました
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            予期しないエラーが発生しました。申し訳ございません。
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#211714',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
```

**重要**: Next.js App Routerでは `global-error.tsx` は `html`, `body` タグを含む必要がある。

---

### 3. `app/error.tsx`（新規）

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーをSentryに送信
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'page',
      },
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="bg-overlay rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-ink mb-4">
          エラーが発生しました
        </h1>
        <p className="text-ink-sub mb-6">
          予期しないエラーが発生しました。再試行してください。
        </p>
        <Button variant="primary" onClick={reset}>
          再試行
        </Button>
      </div>
    </div>
  );
}
```

**UI**: 既存の共通UIコンポーネント（`Button`, CSS変数）を使用。

---

### 4. `lib/sentry.ts`（新規）

```typescript
/**
 * Sentryヘルパー関数
 */
import * as Sentry from '@sentry/nextjs';

/**
 * エラーをSentryにキャプチャ（開発時はコンソールのみ）
 */
export function captureError(
  error: unknown,
  context?: {
    tags?: Record<string, string | number | boolean>;
    extra?: Record<string, unknown>;
    level?: 'fatal' | 'error' | 'warning' | 'info';
  }
) {
  // 開発環境ではコンソールログのみ
  if (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development') {
    console.error('[Sentry Dev]', error, context);
    return;
  }

  // Sentryに送信
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    level: context?.level || 'error',
  });
}

/**
 * カスタムメッセージをSentryにキャプチャ
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' = 'info'
) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development') {
    console.log(`[Sentry Dev] ${level}:`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}
```

**使用例**:
```typescript
import { captureError } from '@/lib/sentry';

try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    tags: { context: 'auth', operation: 'signIn' },
    extra: { userId: user.uid },
  });
  console.error('認証エラー:', error); // 開発用ログは残す
}
```

---

### 5. `functions/src/sentry.ts`（新規）

```typescript
/**
 * Cloud Functions用Sentry初期化
 */
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';

let isInitialized = false;

/**
 * Sentryを初期化（関数実行時に1回だけ）
 */
export function initSentry() {
  if (isInitialized || !SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0,
    profilesSampleRate: 0, // プロファイリング無効（コスト削減）
    integrations: [
      nodeProfilingIntegration(),
    ],
  });

  isInitialized = true;
}

/**
 * エラーをキャプチャ
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (SENTRY_ENVIRONMENT === 'development') {
    console.error('[Sentry Dev]', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}
```

**使用例** (`functions/src/ocr-schedule.ts`):
```typescript
import { initSentry, captureError } from './sentry';

export const ocrScheduleFromImage = onCall(
  {
    // ...
    secrets: ['OPENAI_API_KEY', 'SENTRY_DSN', 'SENTRY_ENVIRONMENT'],
  },
  async (request) => {
    initSentry(); // 関数開始時に初期化

    try {
      // 既存の処理
    } catch (error) {
      captureError(error, { userId: request.auth?.uid, function: 'ocrScheduleFromImage' });
      logDetailedError('[OCR_ERROR]', error); // 既存のログも残す
      throw error;
    }
  }
);
```

---

## 既存ファイルの変更パターン

### パターン1: `lib/auth.ts`

```typescript
// Before
import { auth } from './firebase';

export function useAuth() {
  // ...
  .catch((error) => {
    console.error('Firebase Authentication初期化エラー:', error);
    if (isMounted) {
      setLoading(false);
    }
  });
}

// After
import { auth } from './firebase';
import { captureError } from './sentry';

export function useAuth() {
  // ...
  .catch((error) => {
    captureError(error, { tags: { context: 'auth', operation: 'init' } });
    console.error('Firebase Authentication初期化エラー:', error); // 開発用ログは残す
    if (isMounted) {
      setLoading(false);
    }
  });
}
```

### パターン2: `lib/scheduleOCR.ts`

```typescript
// Before
import { functions } from './firebase';

export async function extractScheduleFromImage(...) {
  try {
    // ...
  } catch (error: unknown) {
    console.error('OCR処理エラー:', error);
    console.error('エラー詳細:', { ... });
    throw new Error('...');
  }
}

// After
import { functions } from './firebase';
import { captureError } from './sentry';

export async function extractScheduleFromImage(...) {
  try {
    // ...
  } catch (error: unknown) {
    captureError(error, {
      tags: { context: 'ocr', function: 'extractScheduleFromImage' },
      extra: { imageSize: imageFile.size },
    });
    console.error('OCR処理エラー:', error);
    console.error('エラー詳細:', { ... });
    throw new Error('...');
  }
}
```

---

## 影響範囲

### 直接的な影響

| ファイル | 影響内容 |
|---------|---------|
| `app/layout.tsx` | `sentry.client.config.ts` をインポート |
| `lib/` 配下15ファイル | `captureError` 呼び出しを追加 |
| `functions/src/` 配下2ファイル | Sentry初期化・エラーキャプチャ追加 |

### 間接的な影響

- **ビルドサイズ**: `@sentry/nextjs` で約50KB増加（gzip後）
- **パフォーマンス**: 初期化は非同期、ページロード時間への影響は最小限
- **コスト**: Sentry無料プラン（5,000イベント/月）で運用開始

---

## 禁止事項チェック

### ✅ プロジェクトルールを遵守

- [x] 共通UIコンポーネント使用（`app/error.tsx`）
- [x] CSS変数使用（`bg-page`, `bg-overlay`, `text-ink`）
- [x] `console.error` は残す（開発用ログとして併用）
- [x] 静的エクスポート対応（手動設定）

### ✅ Next.js静的エクスポート制約

- [x] `@sentry/nextjs` の自動設定は使わない（`next.config.ts` にSentry設定を追加しない）
- [x] 手動で `sentry.client.config.ts` を作成
- [x] `app/layout.tsx` で明示的にインポート

### ✅ Firebase Functions制約

- [x] Secrets管理（`SENTRY_DSN`, `SENTRY_ENVIRONMENT`）
- [x] 初期化は関数開始時に1回のみ

---

## 設計判断の記録

### 1. なぜ `@sentry/nextjs` を使うのか？

**理由**: Next.js公式サポート、静的エクスポート対応、Source Maps対応

**代替案**: `@sentry/react` は検討したが、Next.js固有の機能（App Router、Server Components）に対応していない

### 2. なぜ `console.error` を残すのか？

**理由**: 開発時のデバッグに必要。Sentryは本番環境のみで動作させる。

### 3. なぜ段階的に置き換えるのか？

**理由**: 一度にすべての `console.error` を置き換えるとリスクが高い。重要度の高いファイルから順次対応。

---

## 参照

- **Sentry Next.js Manual Setup**: https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- **Sentry Node.js SDK**: https://docs.sentry.io/platforms/node/
- **Next.js Error Handling**: https://nextjs.org/docs/app/building-your-application/routing/error-handling
