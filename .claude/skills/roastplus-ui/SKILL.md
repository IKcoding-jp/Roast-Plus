---
name: roastplus-ui
description: ローストプラスアプリのUIデザインシステム。Tailwind CSS v4ベースの配色、コンポーネントパターン、レイアウト、アニメーションを提供。新規ページ作成、コンポーネント実装、デザイン一貫性チェックに使用。通常モードとクリスマスモードの両方に対応。
---

# ローストプラス UIデザインシステム

## デザイン哲学

- **高級感**: コーヒーの焙煎という専門的で高級な活動を表現
- **親しみやすさ**: 温かみのあるオレンジと黒を基調とした色選び
- **使いやすさ**: 最小タッチサイズ44px、レスポンシブデザイン、アクセシビリティ対応

## クイックスタート

### 新規ページ作成（3ステップ）

**1. ページタイプを決める**
- フル画面レイアウト（タイマー、スケジュール系）
- スクロール可能レイアウト（リスト、記録系）
- フォームレイアウト（設定、入力系）

**2. テンプレートを使用**

```tsx
'use client';
import { useAuth } from '@/lib/auth';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';

export default function YourPage() {
  const { user, loading } = useAuth();
  useAppLifecycle();

  if (loading) return <Loading />;
  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        <header className="mb-6 sm:mb-8">
          {/* ヘッダー */}
        </header>
        <main className="bg-white rounded-lg shadow-md p-6">
          {/* コンテンツ */}
        </main>
      </div>
    </div>
  );
}
```

**3. コンポーネントを追加**

詳細なコンポーネントパターンは `references/components.md` を参照。

## ブランドカラー

| 名称 | 16進数 | 用途 | Tailwindクラス |
|------|--------|------|----------------|
| Primary Orange | `#EF8A00` | メインアクション | `amber-600` |
| Dark Brown | `#211714` | ヘッダー、濃い背景 | `dark` |
| Background | `#F7F7F5` | ページ背景 | - |

詳細は `references/color-schemes.md` を参照。

## コアコンポーネント例

### プライマリボタン
```tsx
<button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]">
  アクション
</button>
```

### 入力フィールド
```tsx
<input
  type="text"
  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 text-lg bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
  placeholder="入力"
/>
```

### カード
```tsx
<div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg hover:-translate-y-1 transition-all">
  <h3 className="text-lg font-bold text-gray-800 mb-2">タイトル</h3>
  <p className="text-gray-600">説明</p>
</div>
```

## リファレンスドキュメント

詳細な実装パターン、バリエーション、ベストプラクティスは以下を参照:

- **[components.md](references/components.md)** - 全コンポーネントパターン（ボタン、カード、モーダル、入力等）
- **[color-schemes.md](references/color-schemes.md)** - 配色スキーム、テーマ切り替え
- **[layouts.md](references/layouts.md)** - レイアウトパターン、スペーシング、レスポンシブ設計
- **[animations.md](references/animations.md)** - アニメーション、トランジション、Framer Motion
- **[christmas-mode.md](references/christmas-mode.md)** - クリスマスモード実装ガイド

## ベストプラクティス

### アクセシビリティ
- すべてのタッチターゲット: `min-h-[44px]`
- フォーカスリング: `focus-visible:ring-2`
- ARIA属性を適切に使用

### レスポンシブデザイン
- モバイルファースト設計
- ブレークポイント: `sm:` (640px), `md:` (768px), `lg:` (1024px)

### クリスマスモード対応
- `useChristmasMode()` フックを使用
- 詳細は `references/christmas-mode.md` を参照

## 使用時のワークフロー

1. **新規ページ作成**: テンプレートを使用 → `components.md` からパターン選択
2. **コンポーネント実装**: `components.md` で該当パターン検索 → コピー&調整
3. **デザイン一貫性チェック**: 配色、タッチサイズ、レスポンシブ確認
4. **クリスマスモード対応**: 必要な場合は `christmas-mode.md` を参照
