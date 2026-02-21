# レイアウトパターン集

ページレイアウト、レスポンシブ設計、スペーシングルール。

---

## 目次

1. ページレイアウトタイプ
2. ヘッダーパターン
3. グリッドレイアウト
4. スペーシングルール
5. 最大幅コンテナ
6. レスポンシブブレークポイント

---

## 1. ページレイアウトタイプ

### 1.1 スクロール可能レイアウト（デフォルト）

リスト、設定、詳細表示など。最も多用。

```tsx
<div className="min-h-screen bg-page">
  <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
    <header className="mb-6 sm:mb-8">
      <div className="flex items-center gap-4">
        <BackLink href="/" variant="icon-only" />
        <h1 className="text-xl sm:text-2xl font-bold text-ink">ページタイトル</h1>
      </div>
    </header>
    <main className="space-y-6">
      <Card variant="default">
        {/* コンテンツ */}
      </Card>
    </main>
  </div>
</div>
```

**使用ページ:** 設定、試飲詳細、欠点豆、作業進捗、新規作成フォーム

### 1.2 フル画面レイアウト（タイマー・リアルタイム系）

画面全体を占有。ヘッダー固定、メインのみスクロール。

```tsx
<div className="h-dvh flex flex-col bg-surface overflow-hidden">
  <header className="flex-shrink-0 border-b border-edge px-4 py-3">
    <div className="flex items-center justify-between">
      <BackLink href="/" variant="icon-only" />
      <h1 className="text-xl font-bold text-ink">タイトル</h1>
      <div className="w-6" />
    </div>
  </header>
  <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
    <div className="flex-1 flex items-center justify-center px-4">
      {/* タイマー等 */}
    </div>
  </main>
  <footer className="flex-shrink-0 border-t border-edge px-4 py-3">
    {/* ボタン等 */}
  </footer>
</div>
```

**重要**: `flex-1 min-h-0` の組み合わせがフレックスコンテナ内のスクロール制御の鍵。`min-h-0` がないとフレックスアイテムが `min-height: auto` となり、コンテンツがオーバーフローする。

**h-dvh vs h-screen**: PWAでは `h-dvh`（Dynamic Viewport Height）を推奨。モバイルブラウザのアドレスバー表示/非表示に追従する。`h-screen` はアドレスバー分はみ出す場合がある。

**使用ページ:** ローストタイマー、スケジュール、ドリップガイド

### 1.3 フォームレイアウト

狭幅（max-w-2xl）のフォーム専用。

```tsx
<div className="min-h-screen bg-page">
  <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
    <header className="mb-8">
      <BackLink href="/">一覧に戻る</BackLink>
      <h1 className="text-2xl font-bold text-ink mt-4">フォームタイトル</h1>
    </header>
    <Card variant="default" className="p-6">
      <form className="space-y-6">
        <Input label="名前" />
        <Select label="カテゴリ" options={options} />
        <Textarea label="メモ" rows={4} />
        <div className="flex gap-4 justify-end">
          <Button variant="secondary">キャンセル</Button>
          <Button variant="primary" type="submit">送信</Button>
        </div>
      </form>
    </Card>
  </div>
</div>
```

---

## 2. ヘッダーパターン

### 2.1 シンプルヘッダー（戻る + タイトル）

```tsx
<header className="mb-6 sm:mb-8">
  <div className="flex items-center gap-4">
    <BackLink href="/" variant="icon-only" />
    <h1 className="text-xl sm:text-2xl font-bold text-ink">タイトル</h1>
  </div>
</header>
```

### 2.2 3カラムヘッダー（戻る + タイトル + アクション）

```tsx
<header className="mb-4">
  <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-4">
    <div className="flex justify-start">
      <BackLink href="/" variant="icon-only" />
    </div>
    <div className="hidden sm:flex justify-center">
      <h1 className="text-xl font-bold text-ink">タイトル</h1>
    </div>
    <div className="flex justify-end">
      <Button variant="primary" size="sm">アクション</Button>
    </div>
  </div>
</header>
```

### 2.3 スティッキーヘッダー

スクロール時もヘッダーが固定される。担当表等で使用。

```tsx
<header className="sticky top-0 z-30 flex-shrink-0 bg-surface border-b border-edge px-4 py-3">
  <div className="flex items-center justify-between">
    <BackLink href="/" variant="icon-only" />
    <h1 className="text-xl font-bold text-ink">タイトル</h1>
    <Button variant="primary" size="sm">アクション</Button>
  </div>
</header>
```

### 2.4 ホームページヘッダー

テーマ対応済み（`bg-header-bg`, `text-header-text` 等のセマンティックトークン使用）。

```tsx
<header className="relative z-50 shadow-2xl bg-header-bg">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-5">
    <span className="text-2xl md:text-3xl font-bold tracking-tight text-header-text">
      Roast<span className="text-header-accent ml-0.5">Plus</span>
    </span>
    <Button variant="ghost" className="text-header-text hover:bg-header-btn-hover">ログアウト</Button>
  </div>
</header>
```

---

## 3. グリッドレイアウト

### ホームページ（2→4列）

```tsx
<div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
  {items.map(item => (
    <Card key={item.id} variant="action">{/* ... */}</Card>
  ))}
</div>
```

### リスト表示（1列スタック）

```tsx
<div className="space-y-4">
  {items.map(item => (
    <Card key={item.id} variant="hoverable">{/* ... */}</Card>
  ))}
</div>
```

---

## 4. スペーシングルール

### コンテナ外側余白

| デバイス | 横 | 縦 | Tailwind |
|---------|-----|-----|----------|
| モバイル | 16px | 16px | `px-4 py-4` |
| タブレット | 24px | 24px | `sm:px-6 sm:py-6` |
| デスクトップ | 32px | 32px | `lg:px-8 lg:py-8` |

### グリッド/フレックスギャップ

| サイズ | 値 | Tailwind | 用途 |
|-------|-----|----------|------|
| 小 | 8px | `gap-2` | アイコン+テキスト |
| 中 | 12px | `gap-3` | グリッド（モバイル） |
| 大 | 16px | `gap-4` | グリッド（デスクトップ） |

### セクション間マージン

| サイズ | Tailwind | 用途 |
|-------|----------|------|
| 小 | `mb-4` | 段落間 |
| 中 | `mb-6` | セクション間 |
| 大 | `mb-8` | ヘッダーとメイン間 |

---

## 5. 最大幅コンテナ

| Tailwind | px | 用途 |
|----------|-----|------|
| `max-w-6xl` | 1152px | ホームページ |
| `max-w-4xl` | 896px | 標準ページ |
| `max-w-2xl` | 672px | フォーム・設定 |

---

## 6. レスポンシブブレークポイント

```
(デフォルト) : 0px    モバイル
sm:         : 640px   タブレット
md:         : 768px   小型デスクトップ
lg:         : 1024px  大型デスクトップ
```

モバイルファースト: デフォルトがモバイル → `sm:` `md:` `lg:` で上書き。

```tsx
// パディング段階的増加
className="px-4 sm:px-6 lg:px-8"

// テキストサイズ
className="text-sm sm:text-base md:text-lg"

// グリッド列数
className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

// 表示/非表示
className="hidden sm:block"    // モバイル非表示
className="sm:hidden"          // モバイルのみ表示
```
