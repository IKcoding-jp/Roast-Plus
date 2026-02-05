# RoastPlus コーディング規約

> **このファイルは `docs/steering/GUIDELINES.md` に統合されました。**
> 最新の規約は Steering Documents を参照してください。

---

## 移行先

このファイルの内容は、以下のSteering Documentsに統合されています：

### コーディング規約
→ **`docs/steering/GUIDELINES.md`** のコーディング規約セクション

- 命名規則
- インポート順序
- 型定義方針
- コンポーネント構成
- コメント
- Tailwind CSS

### ディレクトリ構成
→ **`docs/steering/REPOSITORY.md`**

- `/app`, `/components`, `/lib`, `/hooks`, `/types` の役割
- ファイル命名規則
- 依存方向

### UI実装ルール
→ **`docs/steering/GUIDELINES.md`** のUI実装ルールセクション

- 共通UIコンポーネント使用必須
- クリスマスモード対応
- レスポンシブデザイン

---

## 参照

- **実装ガイドライン**: `docs/steering/GUIDELINES.md`
- **リポジトリ構造**: `docs/steering/REPOSITORY.md`
- **Steering Documents一覧**: `docs/steering/`

---

## 過去の内容（参照用）

以下は、過去のコーディング規約の内容です。最新の規約は上記のSteering Documentsを参照してください。

### 命名規則

| 種類 | 規則 | 例 |
|-----|------|-----|
| コンポーネント | PascalCase | `QuizCard`, `DripTimer` |
| 関数 | camelCase | `calculateXP`, `updateStreak` |
| 変数 | camelCase | `isLoading`, `userData` |
| 定数 | UPPER_SNAKE_CASE | `CATEGORY_LABELS`, `XP_CONFIG` |
| 型/インターフェース | PascalCase | `QuizQuestion`, `DripRecipe` |
| ファイル（コンポーネント） | PascalCase | `QuizCard.tsx` |
| ファイル（ユーティリティ） | camelCase | `gamification.ts` |

### インポート順序

```typescript
// 1. 外部ライブラリ
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 2. ローカルコンポーネント・モジュール（相対パス）
import { QuizOption } from './QuizOption';
import { calculateXP } from '@/lib/coffee-quiz/gamification';

// 3. 型（import type で明示）
import type { QuizQuestion } from '@/lib/coffee-quiz/types';

// 4. 定数
import { CATEGORY_LABELS, DIFFICULTY_STYLES } from '@/lib/coffee-quiz/types';
```

### 型定義方針

#### interface を使う場合
- オブジェクトの構造定義
- クラスが実装するコントラクト
- 拡張（extends）が必要な場合

#### type を使う場合
- ユニオン型
- マッピング型（Record, Pick, Omit等）
- 関数型

### コンポーネント構成

```typescript
'use client';  // クライアントコンポーネントの場合のみ

import { useState } from 'react';
import type { Props } from './types';

// Props型定義（同ファイルまたは別ファイル）
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// コンポーネント本体
export function ComponentName({ title, onAction }: ComponentProps) {
  // 1. 状態管理
  const [state, setState] = useState(false);

  // 2. 副作用（useEffect等）

  // 3. イベントハンドラ
  const handleClick = () => {
    onAction?.();
  };

  // 4. レンダリング
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
}
```

### ディレクトリ構成

```
roastplus/
├── app/                    # ページ（App Router）
│   ├── coffee-trivia/     # 機能単位でグループ化
│   └── drip-guide/
├── components/             # 再利用可能なUIコンポーネント
│   ├── coffee-quiz/       # 機能別にサブフォルダ
│   └── ui/                # 汎用UIコンポーネント
├── lib/                    # ユーティリティ・ロジック
│   ├── coffee-quiz/       # 機能別ロジック
│   └── firebase.ts        # 外部サービス設定
├── hooks/                  # カスタムReactフック
├── types/                  # グローバル型定義
└── styles/                 # グローバルスタイル
```

### コメント

```typescript
// 単行コメント（日本語可）

/**
 * 関数の説明（JSDoc形式）
 * @param value - パラメータの説明
 * @returns 戻り値の説明
 */
function calculateScore(value: number): number {
  // 処理
}

// TODO: 未実装タスク
// FIXME: 修正が必要な箇所
```

### Tailwind CSS

- ユーティリティクラスを直接使用
- 繰り返しパターンは変数化（`DIFFICULTY_STYLES`等）
- ブランドカラー: `#211714`（深茶色）

```typescript
const DIFFICULTY_STYLES = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
} as const;
```
