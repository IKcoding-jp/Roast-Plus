# テストガイドライン

## テスト作成の原則

### 1. 新規開発は100% TDD
新しい機能・コンポーネントを作成する際は、**必ずテストを先に書く**こと。

#### TDDワークフロー
```bash
# 1. テストを書く（Red）
npm run test -- path/to/feature.test.ts

# 2. 最小限の実装でテストを通す（Green）
# 3. リファクタリング（Refactor）
# 4. コミット
```

#### 例: 新しいユーティリティ関数の追加
```typescript
// 1. lib/formatPrice.test.ts を作成
import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('数値を通貨形式に変換する', () => {
    expect(formatPrice(1000)).toBe('¥1,000');
  });

  it('小数点以下を切り捨てる', () => {
    expect(formatPrice(1234.56)).toBe('¥1,234');
  });

  it('0円を正しく表示する', () => {
    expect(formatPrice(0)).toBe('¥0');
  });
});

// 2. npm run test を実行 → 失敗確認
// 3. lib/formatPrice.ts を実装
// 4. npm run test を実行 → 成功確認
// 5. コミット
```

### 2. 既存コードは段階的にテスト追加
優先度に従って、徐々にカバレッジを上げます。

#### 優先度マトリクス
| 優先度 | 対象 | 例 |
|--------|------|-----|
| 🔴 高 | クリティカルなビジネスロジック | XP計算、日付計算、価格計算 |
| 🟡 中 | ユーザー体験に直結する部分 | カスタムフック、共通コンポーネント |
| 🟢 低 | 表示系・静的コンテンツ | レイアウトコンポーネント、スタイル |

### 3. テストの粒度

#### ✅ 良いテスト
```typescript
// 1つのテストケースに1つのアサーション
it('正の数を正しく処理する', () => {
  expect(calculate(5)).toBe(25);
});

it('負の数を正しく処理する', () => {
  expect(calculate(-5)).toBe(0);
});

// 説明的なテスト名
it('未ログイン時はログインページにリダイレクトする', () => {
  // ...
});
```

#### ❌ 悪いテスト
```typescript
// 複数の責務を1つのテストに詰め込む
it('関数が動作する', () => {
  expect(calculate(5)).toBe(25);
  expect(calculate(-5)).toBe(0);
  expect(calculate(0)).toBe(0);
  expect(calculate(100)).toBe(10000);
});

// 曖昧なテスト名
it('正しく動く', () => {
  // 何が正しいのか不明
});
```

## テストの種類と適用範囲

### 1. ユニットテスト（lib/, hooks/）
**目的:** 個々の関数・フックの動作を保証

```typescript
// lib/dateUtils.test.ts
import { describe, it, expect } from 'vitest';
import { getDaysDifference } from './dateUtils';

describe('getDaysDifference', () => {
  it('同じ日は0を返す', () => {
    expect(getDaysDifference('2024-01-15', '2024-01-15')).toBe(0);
  });

  it('1日の差を計算する', () => {
    expect(getDaysDifference('2024-01-15', '2024-01-16')).toBe(1);
  });
});
```

### 2. コンポーネントテスト（components/）
**目的:** UIコンポーネントの表示とインタラクションを保証

```typescript
// components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('children を表示する', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByText('クリック')).toBeInTheDocument();
  });

  it('クリック時に onClick が呼ばれる', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>テスト</Button>);

    fireEvent.click(screen.getByText('テスト'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 時はクリックできない', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>無効</Button>);

    fireEvent.click(screen.getByText('無効'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 3. フックテスト（hooks/）
**目的:** カスタムフックのステート管理とロジックを保証

```typescript
// hooks/useChristmasMode.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChristmasMode } from './useChristmasMode';

// localStorageのモック
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(),
    setItem: vi.fn(),
  });
});

describe('useChristmasMode', () => {
  it('初期状態で通常モード', () => {
    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(false);
  });

  it('12月はクリスマスモードがデフォルト', () => {
    // Dateのモック
    vi.setSystemTime(new Date('2024-12-15'));
    const { result } = renderHook(() => useChristmasMode());
    expect(result.current.isChristmasMode).toBe(true);
  });
});
```

## モック戦略

### Firebase のモック
```typescript
// lib/__mocks__/firebase.ts
export const db = {};
export const auth = {
  currentUser: { uid: 'test-user-id' },
};

// テストファイル内
vi.mock('@/lib/firebase');
```

### Framer Motion のモック（アニメーション無効化）
```typescript
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));
```

### Next.js Router のモック
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
}));
```

## カバレッジ目標

| フェーズ | 対象 | 目標カバレッジ |
|----------|------|----------------|
| フェーズ1 | lib/ | 80%以上 |
| フェーズ2 | hooks/ | 70%以上 |
| フェーズ2 | components/ui/ | 60%以上 |
| フェーズ3 | components/ (その他) | 50%以上 |

### カバレッジ確認
```bash
npm run test:coverage
```

## CI/CD統合

### GitHub Actions での自動テスト
プルリクエスト時に自動テストを実行します。

```yaml
# .github/workflows/test.yml
name: Test
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4  # カバレッジレポート
        if: always()
```

## チェックリスト

### 新機能追加時
- [ ] テストファイルを先に作成した
- [ ] Red → Green → Refactor のサイクルを回した
- [ ] エッジケースをテストした（空文字、null、undefined、境界値）
- [ ] エラーケースをテストした
- [ ] カバレッジが80%以上（ロジック）または60%以上（UI）

### バグ修正時
- [ ] バグを再現するテストを追加した
- [ ] テストが失敗することを確認した
- [ ] バグを修正してテストが通ることを確認した
- [ ] リグレッション防止のためテストを残した

### リファクタリング時
- [ ] 既存のテストがすべて通ることを確認した
- [ ] 新しいテストを追加する必要があるか検討した
- [ ] カバレッジが下がっていないことを確認した

## 実行コマンド

```bash
# ウォッチモードでテスト（TDD向け）
npm run test

# 1回だけ実行（CI向け）
npm run test:run

# カバレッジレポート生成
npm run test:coverage

# 特定のファイルだけテスト
npm run test lib/dateUtils.test.ts

# 特定のテストケースだけ実行
npm run test -- -t "getDaysDifference"
```

## トラブルシューティング

### テストがタイムアウトする
```typescript
// 非同期処理のタイムアウトを延長
it('時間のかかる処理', async () => {
  // ...
}, 10000); // 10秒に延長
```

### モックが効かない
```typescript
// モックの順序を確認
vi.mock('@/lib/firebase'); // import文の前に書く必要がある場合あり

// モックをリセット
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Reactコンポーネントが見つからない
```typescript
// Testing Libraryのクエリを確認
screen.debug(); // DOMをコンソールに出力して確認

// getBy* の代わりに queryBy* や findBy* を使う
const element = await screen.findByText('非同期で表示される要素');
```

## 参考リンク

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [Testing Library 公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [テスト駆動開発（TDD）入門](https://www.agilealliance.org/glossary/tdd/)
