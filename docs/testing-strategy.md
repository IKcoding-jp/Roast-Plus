# RoastPlus テスト戦略

## 推奨フレームワーク

**Vitest** を推奨（Next.js/React との相性が良い）

## セットアップ手順

### 1. パッケージインストール

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

### 2. vitest.config.ts 作成

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '.next/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### 3. vitest.setup.ts 作成

```typescript
import '@testing-library/jest-dom';
```

### 4. package.json にスクリプト追加

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## テストファイル配置

```
roastplus/
├── lib/
│   └── coffee-quiz/
│       ├── gamification.ts
│       └── gamification.test.ts    # 同一フォルダに配置
├── components/
│   └── coffee-quiz/
│       ├── QuizCard.tsx
│       └── QuizCard.test.tsx       # コンポーネントテスト
└── __tests__/                       # 統合テスト用（オプション）
```

## テストパターン

### ユニットテスト（ロジック）

```typescript
import { describe, it, expect } from 'vitest';
import { calculateXP, getNextLevel } from './gamification';

describe('calculateXP', () => {
  it('正解時にXPを加算する', () => {
    const result = calculateXP({ isCorrect: true, streak: 3 });
    expect(result).toBeGreaterThan(0);
  });

  it('不正解時はXPを加算しない', () => {
    const result = calculateXP({ isCorrect: false, streak: 0 });
    expect(result).toBe(0);
  });
});
```

### コンポーネントテスト

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuizOption } from './QuizOption';

describe('QuizOption', () => {
  it('オプションテキストを表示する', () => {
    render(<QuizOption text="テスト選択肢" index={0} onSelect={() => {}} />);
    expect(screen.getByText('テスト選択肢')).toBeInTheDocument();
  });

  it('クリック時にonSelectが呼ばれる', () => {
    const mockOnSelect = vi.fn();
    render(<QuizOption text="テスト" index={1} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText('テスト'));
    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });
});
```

### フックテスト

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizData } from './useQuizData';

describe('useQuizData', () => {
  it('初期状態でローディング中', () => {
    const { result } = renderHook(() => useQuizData('basics'));
    expect(result.current.isLoading).toBe(true);
  });
});
```

## モック戦略

### Firebase モック

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-user-id' },
  },
}));
```

### Framer Motion モック（アニメーション無効化）

```typescript
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));
```

## カバレッジ目標

| 対象 | 目標 |
|-----|------|
| lib/ (ロジック) | 80%以上 |
| hooks/ | 70%以上 |
| components/ | 60%以上 |

## TDDワークフロー

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを書く
3. **Refactor**: コードを改善（テストは維持）

```bash
# ウォッチモードでTDD
npm run test
```

## CI/CD統合（将来）

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
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
```
