# テスト計画

**Issue**: #213
**作成日**: 2026-02-11

---

## テスト戦略

### テストの方針

Issue #213は**エラー監視システムの導入**であり、以下の特性を持つ:

1. **外部サービス統合**: Sentry.io（SaaS）への依存
2. **エラーハンドリング**: 既存のエラー処理を拡張
3. **UI追加**: ErrorBoundary（`app/error.tsx`, `app/global-error.tsx`）

**テスト優先順位**:
- **手動テスト優先**: Sentryダッシュボードでのエラー確認が必要
- **ユニットテスト**: Sentryヘルパー関数（`lib/sentry.ts`）のみ
- **統合テスト**: ErrorBoundaryの動作確認（React Testing Library）
- **E2Eテスト**: スキップ（Sentryモック困難）

---

## テスト種別

### 1. ユニットテスト（Vitest）

#### 対象: `lib/sentry.ts`

**テストケース**:

| テストID | テストケース | 期待結果 |
|---------|-------------|---------|
| UT-1.1 | `captureError` を開発環境で呼び出す | `console.error` が呼ばれる、Sentryに送信されない |
| UT-1.2 | `captureError` を本番環境で呼び出す | `Sentry.captureException` が呼ばれる |
| UT-1.3 | `captureError` にタグを渡す | タグが `Sentry.captureException` に渡される |
| UT-1.4 | `captureMessage` を開発環境で呼び出す | `console.log` が呼ばれる |
| UT-1.5 | `captureMessage` を本番環境で呼び出す | `Sentry.captureMessage` が呼ばれる |

**実装例**:

```typescript
// lib/sentry.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { captureError, captureMessage } from './sentry';
import * as Sentry from '@sentry/nextjs';

// Sentryをモック
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe('lib/sentry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('captureError', () => {
    it('should log to console in development', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'development';

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      captureError(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[Sentry Dev]', error, undefined);
      expect(Sentry.captureException).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = originalEnv;
    });

    it('should send to Sentry in production', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'production';

      const error = new Error('Test error');
      captureError(error, { tags: { context: 'test' } });

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: { context: 'test' },
        extra: undefined,
        level: 'error',
      });

      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = originalEnv;
    });
  });

  describe('captureMessage', () => {
    it('should log to console in development', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'development';

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      captureMessage('Test message', 'info');

      expect(consoleLogSpy).toHaveBeenCalledWith('[Sentry Dev] info:', 'Test message');
      expect(Sentry.captureMessage).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = originalEnv;
    });

    it('should send to Sentry in production', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = 'production';

      captureMessage('Test message', 'warning');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'warning');

      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT = originalEnv;
    });
  });
});
```

**カバレッジ目標**: 90%以上（`lib/sentry.ts`）

---

### 2. 統合テスト（React Testing Library）

#### 対象: `app/error.tsx`

**テストケース**:

| テストID | テストケース | 期待結果 |
|---------|-------------|---------|
| IT-1.1 | ErrorBoundaryにエラーが渡される | エラーメッセージが表示される |
| IT-1.2 | 「再試行」ボタンをクリック | `reset` 関数が呼ばれる |
| IT-1.3 | エラーがSentryに送信される | `Sentry.captureException` が呼ばれる |

**実装例**:

```typescript
// app/error.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Error from './error';
import * as Sentry from '@sentry/nextjs';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe('app/error.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error message', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<Error error={error} reset={reset} />);

    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('予期しないエラーが発生しました。再試行してください。')).toBeInTheDocument();
  });

  it('should call reset when retry button is clicked', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<Error error={error} reset={reset} />);

    fireEvent.click(screen.getByText('再試行'));

    expect(reset).toHaveBeenCalled();
  });

  it('should capture error to Sentry', () => {
    const error = new Error('Test error');
    const reset = vi.fn();

    render(<Error error={error} reset={reset} />);

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: {
        errorBoundary: 'page',
      },
    });
  });
});
```

**カバレッジ目標**: 80%以上

---

#### 対象: `app/global-error.tsx`

**テストケース**:

| テストID | テストケース | 期待結果 |
|---------|-------------|---------|
| IT-2.1 | GlobalErrorにエラーが渡される | エラーメッセージが表示される |
| IT-2.2 | 「再試行」ボタンをクリック | `reset` 関数が呼ばれる |
| IT-2.3 | エラーがSentryに送信される | `Sentry.captureException` が呼ばれる |

**実装は `app/error.test.tsx` とほぼ同じパターン**

---

### 3. 手動テスト

#### 3.1 クライアント側（開発環境）

**テストケース**:

| テストID | 手順 | 期待結果 |
|---------|------|---------|
| MT-1.1 | 任意のページでエラーをスロー（`throw new Error('Test')`） | `app/error.tsx` が表示される |
| MT-1.2 | コンソールログを確認 | `[Sentry Dev]` のログが表示される |
| MT-1.3 | 「再試行」ボタンをクリック | ページがリロードされる |

**実装例** (`app/test-error/page.tsx` を一時的に作成):
```typescript
'use client';

export default function TestError() {
  return (
    <button onClick={() => { throw new Error('Test error'); }}>
      エラーをスロー
    </button>
  );
}
```

---

#### 3.2 クライアント側（本番環境）

**テストケース**:

| テストID | 手順 | 期待結果 |
|---------|------|---------|
| MT-2.1 | `npm run build` → 本番ビルド実行 | ビルド成功 |
| MT-2.2 | `npm start` → 本番サーバー起動 | サーバー起動成功 |
| MT-2.3 | テストエラーをスロー | `app/error.tsx` が表示される |
| MT-2.4 | Sentryダッシュボードを確認 | エラーが記録されている |
| MT-2.5 | エラー詳細を確認 | `tags: { errorBoundary: 'page' }` が含まれる |

---

#### 3.3 Cloud Functions（開発・本番）

**テストケース**:

| テストID | 手順 | 期待結果 |
|---------|------|---------|
| MT-3.1 | Firebase Functionsをデプロイ | デプロイ成功 |
| MT-3.2 | OCR機能を実行（エラーケース: 不正な画像） | エラーレスポンスが返る |
| MT-3.3 | Sentryダッシュボードを確認 | エラーが記録されている |
| MT-3.4 | エラー詳細を確認 | `function: 'ocrScheduleFromImage'`, `userId` が含まれる |
| MT-3.5 | テイスティング分析を実行（エラーケース） | 同上 |

**エラーケースの作り方**:
- OCR: 画像サイズ超過、APIキーエラー（一時的に無効なキーを設定）
- テイスティング分析: 必須パラメータを省略

---

### 4. E2Eテスト（Playwright）

**結論: スキップ**

**理由**:
1. Sentryへの送信をモックするのが困難
2. 外部サービス（Sentry.io）への依存が強い
3. 手動テストで十分カバーできる

**代替案**: 手動テストで本番環境のSentry統合を確認

---

## カバレッジ目標

| 対象 | 目標 | 測定方法 |
|-----|------|---------|
| `lib/sentry.ts` | 90%以上 | `npm run test:coverage` |
| `app/error.tsx` | 80%以上 | React Testing Library |
| `app/global-error.tsx` | 80%以上 | React Testing Library |
| Cloud Functions | 手動確認 | Sentryダッシュボード |

---

## テストコマンド

```bash
# ユニットテスト実行
npm run test -- lib/sentry.test.ts

# カバレッジ確認
npm run test:coverage -- lib/sentry.test.ts

# すべてのテスト実行
npm run test
```

---

## 回帰テスト（既存機能への影響確認）

### 確認対象

| 機能 | 確認内容 | 期待結果 |
|-----|---------|---------|
| 認証 | ログイン・ログアウト | 正常動作 |
| Firestore | データ読み書き | 正常動作 |
| Storage | 画像アップロード | 正常動作 |
| OCR | スケジュール解析 | 正常動作 |
| テイスティング分析 | AI分析 | 正常動作 |

**テスト方法**: 各機能を手動で実行し、エラーが発生しないことを確認

---

## テスト実行タイミング

| タイミング | テスト種別 | 実行者 |
|-----------|-----------|--------|
| フェーズ2完了後 | ユニットテスト（`lib/sentry.ts`） | AI |
| フェーズ2完了後 | 統合テスト（`app/error.tsx`） | AI |
| フェーズ2完了後 | 手動テスト（クライアント・開発） | ユーザー |
| フェーズ3完了後 | 手動テスト（Cloud Functions） | ユーザー |
| フェーズ5 | 回帰テスト（既存機能） | ユーザー |
| PR作成前 | すべてのテスト | AI + ユーザー |
| 本番デプロイ後 | 手動テスト（本番環境） | ユーザー |

---

## テストデータ

### エラーケース（意図的なエラー）

```typescript
// クライアント側
throw new Error('Test error for Sentry');

// Cloud Functions（OCR）
// 画像サイズを20MB以上にする
const largeImage = new File([new ArrayBuffer(21 * 1024 * 1024)], 'large.jpg');

// Cloud Functions（テイスティング分析）
// 必須パラメータを省略
const invalidData = { beanName: 'Test' }; // roastLevel, averageScores が欠落
```

---

## 成功基準

### テスト成功の定義

- [ ] ユニットテスト: すべてのテストが合格
- [ ] 統合テスト: すべてのテストが合格
- [ ] 手動テスト（クライアント・開発）: エラーがコンソールに表示される
- [ ] 手動テスト（クライアント・本番）: Sentryダッシュボードでエラー確認
- [ ] 手動テスト（Cloud Functions）: Sentryダッシュボードでエラー確認
- [ ] 回帰テスト: 既存機能がすべて正常動作

---

## 備考

### Sentryモックの注意点

`vi.mock('@sentry/nextjs')` でモックする際、以下に注意:

1. **ホイスティング問題**: モックファクトリ内で外部変数を参照しない
2. **環境変数**: `process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT` をテスト内で変更する場合、元の値を保存して復元

### Cloud Functionsのテスト

Cloud FunctionsのSentry統合は、ローカルエミュレータでは動作しない可能性がある（Secrets未設定）。
本番環境デプロイ後に手動テストを実施すること。
