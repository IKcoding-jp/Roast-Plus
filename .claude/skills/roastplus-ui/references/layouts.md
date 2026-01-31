# ローストプラス レイアウトパターン集

ローストプラスアプリケーションの各ページで使用されるレイアウトパターンを解説します。
モバイルファースト設計に基づいて、段階的にレスポンシブ対応しています。

---

## 目次

1. ページレイアウトタイプ
2. ヘッダー・ナビゲーション
3. グリッドレイアウト
4. スペーシング・パディングルール
5. 最大幅コンテナ
6. レスポンシブブレークポイント
7. よく使うレイアウトパターン

---

## 1. ページレイアウトタイプ

### 1.1 スクロール可能レイアウト（推奨・最も使う）

ほとんどのページで使用する基本レイアウトです。

**特徴:**
- `min-h-screen` で最低画面高さを確保
- 内容が少ない場合はページ全体を埋める
- 内容が多い場合は自動的にスクロール可能

**実装:**
```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HiArrowLeft } from 'react-icons/hi';
import { Loading } from '@/components/Loading';
import { useAppLifecycle } from '@/hooks/useAppLifecycle';
import LoginPage from '@/app/login/page';

export default function YourPage() {
  const { user, loading: authLoading } = useAuth();
  useAppLifecycle();

  if (authLoading) return <Loading />;
  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F5' }}>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-4xl">
        {/* ヘッダー */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px]" aria-label="戻る">
              <HiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">ページタイトル</h1>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {/* ここにコンテンツを配置 */}
        </main>
      </div>
    </div>
  );
}
```

**使用ページ:**
- 設定ページ
- 試飲詳細ページ
- 欠点豆ページ
- 作業進捗ページ
- 新規作成フォーム

### 1.2 フル画面レイアウト（タイマー・リアルタイム系）

タイマーやリアルタイム表示が必要なページに使用します。

**特徴:**
- `h-screen` で画面全体を占有
- 内部スクロール制御（ヘッダーは固定、メインコンテンツのみスクロール）
- ビューポート全体を使用

**実装:**
```tsx
<div className="h-screen flex flex-col bg-white overflow-hidden">
  {/* ヘッダー */}
  <header className="flex-shrink-0 border-b border-gray-200 px-4 py-3">
    <div className="flex items-center justify-between">
      <Link href="/" aria-label="戻る">
        <HiArrowLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-xl font-bold">ページタイトル</h1>
      <div className="w-6" /> {/* スペーサー */}
    </div>
  </header>

  {/* メインコンテンツ */}
  <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
    <div className="flex-1 flex items-center justify-center px-4">
      {/* タイマーやリアルタイム表示 */}
    </div>
  </main>

  {/* フッター（オプション） */}
  <footer className="flex-shrink-0 border-t border-gray-200 px-4 py-3">
    {/* ボタン等 */}
  </footer>
</div>
```

**使用ページ:**
- ローストタイマー
- スケジュール（リアルタイム表示）
- ドリップガイド（ステップ進行）

### 1.3 モーダル/ダイアログレイアウト

情報確認や選択が必要な場合に使用します。

**実装:**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">タイトル</h2>
    <p className="text-gray-600 mb-6">説明文</p>
    <div className="flex gap-4 justify-end">
      <button className="px-6 py-3 bg-gray-600 text-white rounded-lg min-h-[44px]">
        キャンセル
      </button>
      <button className="px-6 py-3 bg-amber-600 text-white rounded-lg min-h-[44px]">
        確認
      </button>
    </div>
  </div>
</div>
```

---

## 2. ヘッダー・ナビゲーション

### 2.1 シンプルヘッダー（戻るボタン + タイトル）

通常のページで最も使用するヘッダーパターンです。

```tsx
<header className="mb-6 sm:mb-8">
  <div className="flex items-center gap-4">
    <Link
      href="/"
      className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
      aria-label="戻る"
    >
      <HiArrowLeft className="h-6 w-6" />
    </Link>
    <h1 className="text-2xl font-bold text-gray-800">ページタイトル</h1>
  </div>
</header>
```

**レスポンシブ対応:**
- モバイル: `text-xl sm:text-2xl` でタイトルサイズを調整
- ボタン: `min-h-[44px] min-w-[44px]` で最小タッチサイズ確保

### 2.2 3カラムヘッダー（戻る + タイトル + アクション）

複雑なアクションが必要なページに使用します。

```tsx
<header className="mb-4">
  <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-4">
    {/* 左: 戻るボタン */}
    <div className="flex justify-start">
      <Link
        href="/"
        className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px]"
        aria-label="戻る"
      >
        <HiArrowLeft className="h-6 w-6" />
      </Link>
    </div>

    {/* 中央: タイトル（デスクトップのみ） */}
    <div className="hidden sm:flex justify-center">
      <h1 className="text-xl font-bold text-gray-800">ページタイトル</h1>
    </div>

    {/* 右: アクションボタン */}
    <div className="flex justify-end">
      <button className="px-4 py-2 bg-amber-600 text-white rounded min-h-[44px]">
        保存
      </button>
    </div>
  </div>
</header>
```

**レスポンシブ対応:**
- モバイル: `hidden sm:flex` でタイトルを非表示
- デスクトップ: グリッド3分割で左右のボタンとタイトルを配置

### 2.3 ホームページヘッダー

ロゴとログアウトボタンを配置する固定ヘッダー。

```tsx
<header className="relative z-50 shadow-2xl bg-[#261a14]/98">
  <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-5">
    {/* ロゴ */}
    <div className="flex items-center gap-1">
      <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">
        Roast<span className="text-[#EF8A00] ml-0.5">Plus</span>
      </span>
    </div>

    {/* ボタン */}
    <button className="text-sm font-semibold px-4 py-1.5 rounded-full text-white hover:text-gray-200 transition-all">
      ログアウト
    </button>
  </div>
</header>
```

---

## 3. グリッドレイアウト

### 3.1 2カラムグリッド（モバイル用）

モバイル時のデフォルトグリッド。

```tsx
<div className="grid grid-cols-2 gap-3">
  {/* アイテム */}
</div>
```

**特徴:**
- 縦：2列
- ギャップ：12px（`gap-3`）
- レスポンシブ対応で自動調整

### 3.2 4カラムグリッド（デスクトップ用）

デスクトップ時のグリッド（ホームページ等）。

```tsx
<div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
  {/* アイテム */}
</div>
```

**ブレークポイント:**
- `md:` (768px以上): `grid-cols-4` + `gap-4`
- それ以下: `grid-cols-2` + `gap-3`

### 3.3 動的カード高さ（ホームページ）

画面の高さに応じてカード高さを動的に調整。

```tsx
// JavaScriptで計算
const calculateCardHeight = () => {
  const viewportHeight = window.innerHeight;
  const headerHeight = 72;
  const padding = 32;
  const gridGap = 60;
  const availableHeight = viewportHeight - headerHeight - padding;
  const cardHeight = (availableHeight - gridGap) / 5; // 5行
  return Math.max(cardHeight, 100);
};

// JSXで適用
<div style={cardHeight ? { gridAutoRows: `${cardHeight}px` } : { gridAutoRows: '1fr' }}>
  {/* グリッドアイテム */}
</div>
```

---

## 4. スペーシング・パディングルール

### 4.1 コンテナ外側余白

ページコンテナの横方向・縦方向の余白。

| デバイス | 横（px） | Tailwind | 縦（py） | Tailwind |
|---------|---------|----------|---------|----------|
| モバイル | 16px | `px-4` | 16px | `py-4` |
| タブレット | 24px | `sm:px-6` | 24px | `sm:py-6` |
| デスクトップ | 32px | `lg:px-8` | 32px | `lg:py-8` |

**実装:**
```tsx
<div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
```

### 4.2 要素間ギャップ（グリッド・フレックス）

グリッド内のアイテム間、フレックスボックスの要素間の距離。

| 用途 | 値 | Tailwind | 使用例 |
|------|-----|----------|-------|
| 小 | 8px | `gap-2` | アイコン + テキスト |
| 中 | 12px | `gap-3` | グリッドアイテム（モバイル） |
| 大 | 16px | `gap-4` | グリッドアイテム（デスクトップ） |

**実装:**
```tsx
<div className="flex gap-2">ボタン</div>
<div className="grid grid-cols-2 gap-3 md:gap-4">グリッド</div>
```

### 4.3 セクション間マージン

ページ内の大きなセクション間の距離。

| サイズ | px | Tailwind | 使用例 |
|--------|-----|----------|-------|
| 小 | 16px | `mb-4` | 段落間 |
| 中 | 24px | `mb-6` | セクション間 |
| 大 | 32px | `mb-8` | ヘッダーとメイン間 |
| 特大 | 48px | `mb-12` | 大きなセクション分割 |

**実装:**
```tsx
<header className="mb-6 sm:mb-8">
<main className="mb-8 sm:mb-12">
```

### 4.4 コンポーネント内パディング

ボタン、カード、入力フィールド内のパディング。

| パターン | 横px | 縦px | Tailwind | 用途 |
|---------|------|------|----------|------|
| 小 | 12 | 8 | `px-3 py-2` | スモールボタン |
| 中 | 24 | 12 | `px-6 py-3` | ボタン、入力 |
| 大 | 32 | 24 | `px-8 py-6` | カード内 |

**実装:**
```tsx
<button className="px-6 py-3">標準ボタン</button>
<div className="px-4 sm:px-6 py-4 sm:py-6">カード</div>
```

---

## 5. 最大幅コンテナ

ページの最大幅を制御します。

| 名称 | px | Tailwind | 用途 |
|------|-----|----------|------|
| 広幅 | 1152px | `max-w-6xl` | ホームページ、ダッシュボード |
| 中幅 | 896px | `max-w-4xl` | 標準ページ、リスト |
| 狭幅 | 672px | `max-w-2xl` | フォーム、設定、詳細ページ |

**実装:**
```tsx
{/* ホームページ */}
<div className="max-w-6xl mx-auto px-4">

{/* 標準ページ */}
<div className="max-w-4xl mx-auto px-4">

{/* フォームページ */}
<div className="max-w-2xl mx-auto px-4">
```

### 5.1 中央配置

`mx-auto` で左右の余白を自動配置。

```tsx
<div className="max-w-4xl mx-auto">
  {/* 中央配置されたコンテンツ */}
</div>
```

---

## 6. レスポンシブブレークポイント

### 6.1 Tailwindブレークポイント

```
なし   : 0px      （モバイル・デフォルト）
sm:  : 640px     （タブレット）
md:  : 768px     （小型デスクトップ）
lg:  : 1024px    （大型デスクトップ）
xl:  : 1280px    （超大型）
```

### 6.2 モバイルファースト設計

基本はモバイル向けスタイルを定義し、larger画面で上書き。

**正しい例:**
```tsx
{/* モバイル: 1列、デスクトップ: 2列 */}
className="flex flex-col sm:flex-row"

{/* モバイル: 小さいテキスト、デスクトップ: 大きい */}
className="text-sm md:text-base lg:text-lg"

{/* モバイル: 表示、デスクトップ: 非表示 */}
className="block md:hidden"
```

**間違った例:**
```tsx
❌ className="text-lg md:text-base sm:text-sm"
  （ブレークポイント順序が逆）
```

### 6.3 よく使うブレークポイント組み合わせ

```tsx
// パディング段階的増加
className="px-4 sm:px-6 lg:px-8"

// テキストサイズ段階的変更
className="text-sm sm:text-base md:text-lg"

// 表示/非表示の切り替え
className="hidden sm:block"
className="sm:hidden"

// グリッド列数の変更
className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

// フレックス方向の変更
className="flex-col sm:flex-row"
```

---

## 7. よく使うレイアウトパターン

### 7.1 フルスクリーンタイマーレイアウト

```tsx
<div className="h-screen flex flex-col bg-white overflow-hidden">
  {/* ヘッダー */}
  <header className="flex-shrink-0 border-b px-4 py-3">
    {/* ヘッダーコンテンツ */}
  </header>

  {/* メイン（スクロール可能） */}
  <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
    <div className="flex-1 flex items-center justify-center px-4">
      {/* タイマー表示 */}
    </div>
  </main>

  {/* フッター */}
  <footer className="flex-shrink-0 border-t px-4 py-3">
    {/* ボタン等 */}
  </footer>
</div>
```

### 7.2 リストレイアウト（スクロール可能）

```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    {/* ヘッダー */}
    <header className="mb-6">
      <h1 className="text-2xl font-bold">リストタイトル</h1>
    </header>

    {/* リスト */}
    <main className="space-y-4">
      {/* リストアイテム */}
    </main>
  </div>
</div>
```

### 7.3 グリッド表示レイアウト（ホームページ）

```tsx
<div className="min-h-screen bg-gradient-to-b from-[#F7F2EB] to-[#F3F0EA]">
  {/* ヘッダー */}
  <header className="bg-[#261a14] shadow-2xl">
    {/* ロゴ、ボタン */}
  </header>

  {/* メイン */}
  <main className="max-w-6xl mx-auto px-4 pt-4 pb-10 sm:px-6 sm:pt-6">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
         style={cardHeight ? { gridAutoRows: `${cardHeight}px` } : {}}>
      {/* グリッドアイテム */}
    </div>
  </main>
</div>
```

### 7.4 フォームレイアウト

```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
    {/* ヘッダー */}
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">フォームタイトル</h1>
    </header>

    {/* フォーム */}
    <form className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* フォーム要素 */}
      <div className="flex gap-4 justify-end">
        <button type="reset">キャンセル</button>
        <button type="submit">送信</button>
      </div>
    </form>
  </div>
</div>
```

---

## レイアウトチェックリスト

新規ページ作成時に確認してください：

- [ ] **ページタイプ選択**: スクロール可能 / フル画面 / モーダル
- [ ] **ヘッダー実装**: シンプル / 3カラム
- [ ] **コンテナ幅設定**: max-w設定は適切か
- [ ] **パディング**: `px-4 sm:px-6 lg:px-8` パターンを使用
- [ ] **ギャップ設定**: グリッド/フレックスのギャップは統一
- [ ] **レスポンシブ対応**: モバイル・タブレット・デスクトップで確認
- [ ] **最小タッチサイズ**: ボタンは `min-h-[44px]` 以上
- [ ] **背景色**: スタイル設定（`#F7F7F5`）で統一
- [ ] **アニメーション**: 必要な場合は `animations.md` を参照
- [ ] **クリスマスモード**: 対応が必要な場合は両モード実装

