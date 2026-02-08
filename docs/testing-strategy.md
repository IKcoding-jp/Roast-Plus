# テスト戦略・ガイドライン

## テストフレームワーク

**Vitest** を使用（Next.js/React との相性が良い）

## テスト作成の原則

### 1. 新規開発は100% TDD
新しい機能・コンポーネントを作成する際は、**必ずテストを先に書く**こと。

#### TDDワークフロー
1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを書く
3. **Refactor**: コードを改善（テストは維持）

### 2. 既存コードは段階的にテスト追加

| 優先度 | 対象 | 例 |
|--------|------|-----|
| 高 | クリティカルなビジネスロジック | XP計算、日付計算、価格計算 |
| 中 | ユーザー体験に直結する部分 | カスタムフック、共通コンポーネント |
| 低 | 表示系・静的コンテンツ | レイアウトコンポーネント、スタイル |

### 3. テストの粒度

- 1つのテストケースに1つのアサーション
- 説明的なテスト名（「正しく動く」ではなく「未ログイン時はログインページにリダイレクトする」）
- エッジケース・エラーケースを必ずテスト

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

## テストの種類

### ユニットテスト（lib/, hooks/）

```typescript
import { describe, it, expect } from 'vitest';
import { calculateXP } from './gamification';

describe('calculateXP', () => {
  it('正解時にXPを加算する', () => {
    const result = calculateXP({ isCorrect: true, streak: 3 });
    expect(result).toBeGreaterThan(0);
  });
});
```

### コンポーネントテスト（components/）

```typescript
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
});
```

### フックテスト（hooks/）

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQuizData } from './useQuizData';

describe('useQuizData', () => {
  it('初期状態でローディング中', () => {
    const { result } = renderHook(() => useQuizData('basics'));
    expect(result.current.isLoading).toBe(true);
  });
});
```

## モック戦略

### Firebase
```typescript
vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user-id' } },
}));
```

### Framer Motion（アニメーション無効化）
```typescript
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));
```

### Next.js Router
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/test-path',
}));
```

## カバレッジ目標

| 対象 | 目標カバレッジ |
|------|----------------|
| lib/ | 80%以上 |
| hooks/ | 70%以上 |
| components/ui/ | 60%以上 |
| components/ (その他) | 50%以上 |

## チェックリスト

### 新機能追加時
- [ ] テストファイルを先に作成した
- [ ] Red → Green → Refactor のサイクルを回した
- [ ] エッジケース・エラーケースをテストした

### バグ修正時
- [ ] バグを再現するテストを追加した
- [ ] テストが失敗 → 修正 → テスト成功を確認した

### リファクタリング時
- [ ] 既存のテストがすべて通ることを確認した
- [ ] カバレッジが下がっていないことを確認した

## 実行コマンド

```bash
npm run test             # ウォッチモード（TDD向け）
npm run test:run         # 1回実行（CI向け）
npm run test:coverage    # カバレッジレポート
npm run test -- path/to/file.test.ts  # 特定ファイル
```

## トラブルシューティング

### テストがタイムアウトする
```typescript
it('時間のかかる処理', async () => { /* ... */ }, 10000);
```

### モックが効かない
```typescript
vi.mock('@/lib/firebase'); // import文の前に記述
beforeEach(() => { vi.clearAllMocks(); });
```

### Reactコンポーネントが見つからない
```typescript
screen.debug(); // DOMをコンソールに出力
const element = await screen.findByText('非同期表示される要素');
```
