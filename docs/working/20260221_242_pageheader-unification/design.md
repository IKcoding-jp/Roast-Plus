# 設計書（v2 — FloatingNav）

## 実装方針

ヘッダーバーを廃止し、フローティングナビゲーションに置換する。
`fixed`配置により、ページレイアウトの差異（max-w, padding）に影響されない。

## コンポーネント設計

### FloatingNav（新規作成）

```tsx
'use client';

import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

interface FloatingNavProps {
  backHref?: string;
  right?: React.ReactNode;
  className?: string;
}

export function FloatingNav({ backHref, right, className = '' }: FloatingNavProps) {
  return (
    <>
      {/* 戻るボタン */}
      {backHref && (
        <Link
          href={backHref}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50
            w-11 h-11 flex items-center justify-center
            bg-surface/80 backdrop-blur-sm shadow-md rounded-full
            text-ink-sub hover:text-ink hover:bg-surface
            transition-colors"
          aria-label="戻る"
        >
          <IoArrowBack size={22} />
        </Link>
      )}

      {/* 右側アクション */}
      {right && (
        <div
          className={`fixed top-3 right-3 sm:top-4 sm:right-4 z-50
            flex items-center gap-2 sm:gap-3 ${className}`}
        >
          {right}
        </div>
      )}
    </>
  );
}
```

### 設計判断

| 判断 | 理由 |
|------|------|
| `fixed` 配置 | ページレイアウト（max-w, padding）に依存しない。v1の失敗原因を根本解決 |
| `z-50` | コンテンツの上に確実に表示。モーダル（z-[9999]）の下 |
| `bg-surface/80 backdrop-blur-sm` | 半透明ガラス効果。コンテンツがスクロールしても視認性確保 |
| `rounded-full` | 戻るボタンは円形。フローティング感を強調 |
| `w-11 h-11`（44px） | タッチターゲットサイズ確保（WCAG 2.5.5） |
| `Link` のみ（router.back()なし） | backHrefが省略なら戻るボタン自体を非表示。明示的な遷移先を強制 |
| Fragment `<>` でラップ | DOMに余計な要素を追加しない |
| title不要 | ブレインストーミングでユーザーが「タイトル不要」と判断 |
| `useRouter` 不使用 | `'use client'` は必要だが、Linkのみで遷移するためrouter不要 |

### v1との差分

| 項目 | v1 (PageHeader) | v2 (FloatingNav) |
|------|-----------------|------------------|
| 配置 | ページレイアウト内 | `fixed`（viewport基準） |
| 背景 | フルワイドバー（bg-surface border-b） | 個別ボタン（bg-surface/80 rounded-full） |
| タイトル | h1で表示 | **廃止** |
| アイコン | タイトル左に表示 | **廃止** |
| sticky | `sticky top-0` | `fixed top-3/top-4` |
| 幅 | ページの`max-w-*`に制約される | viewport幅（制約なし） |

## 変更対象ファイル

### 新規作成
- `components/ui/FloatingNav.tsx` - 共通コンポーネント本体
- `components/ui/__tests__/FloatingNav.test.tsx` - テスト

### 変更
- `components/ui/index.ts` - FloatingNavエクスポート追加
- `components/ui/registry.tsx` - Design Labデモ追加
- 以下16ページの `page.tsx` のヘッダー部分を置換:
  - `app/assignment/page.tsx`
  - `app/schedule/page.tsx`
  - `app/coffee-trivia/page.tsx`
  - `app/tasting/page.tsx`
  - `app/drip-guide/page.tsx`
  - `app/settings/page.tsx`
  - `app/notifications/page.tsx`
  - `app/roast-record/page.tsx`
  - `app/defect-beans/page.tsx`
  - `app/brewing/page.tsx`
  - `app/progress/page.tsx`
  - `app/changelog/page.tsx`
  - `app/contact/page.tsx`
  - `app/dev-stories/page.tsx`
  - `app/terms/page.tsx`
  - `app/privacy-policy/page.tsx`

### 廃止候補
- `app/progress/components/ProgressHeader.tsx` - FloatingNav + right で代替

## 各ページの移行パターン

### パターン A: 戻るボタンのみ（7ページ）
settings, notifications, contact, changelog, brewing, terms, privacy-policy

```tsx
// Before
<header className="mb-6 sm:mb-8 flex ...">
  <BackLink href="/" variant="icon-only" />
  <h1>設定</h1>
</header>

// After
<FloatingNav backHref="/" />
// コンテンツのpadding-topを調整
```

### パターン B: 戻る + 右アクション（5ページ）
assignment, drip-guide, coffee-trivia, schedule, dev-stories

```tsx
<FloatingNav
  backHref="/"
  right={<Button variant="primary" size="sm">新規</Button>}
/>
```

### パターン C: 条件分岐付き（4ページ）
defect-beans, roast-record, tasting, progress

```tsx
// tasting: ビューごとにbackHref/rightを切替
<FloatingNav
  backHref={isEditing ? "/tasting" : "/"}
  right={isEditing ? undefined : <Button>セッション作成</Button>}
/>
```

## 影響範囲

- UI/UX: 全通常ページのヘッダーバーが消え、フローティングナビに変更（大きなビジュアル変更）
- パフォーマンス: 影響なし（コンポーネント化のみ、fixed配置）
- アクセシビリティ: aria-label="戻る" 維持。h1は各ページのコンテンツ内に必要に応じて残す
- テーマ: CSS変数（bg-surface, text-ink, text-spot等）使用のため自動対応
- レイアウト: コンテンツ側にpt-14（56px）の追加が必要

## 禁止事項チェック

- [x] 独自CSSを生成しない → テーマCSS変数を使用
- [x] ハードコード色を使用しない → セマンティックユーティリティのみ
- [x] 共通コンポーネントを重複作成しない → FloatingNav 1つのみ
- [x] 特殊ページ（clock, roast-timer, login）は変更しない
