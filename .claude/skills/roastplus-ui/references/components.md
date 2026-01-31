# ローストプラス コンポーネントパターン集

ローストプラスアプリケーションで使用される、すべてのUIコンポーネントの実装パターンをまとめています。
通常モードとクリスマスモードの両方に対応したパターンを記載します。

---

## 目次

1. ボタンコンポーネント
2. 入力フィールド
3. カードコンポーネント
4. モーダル・ダイアログ
5. ヘッダー・ナビゲーション
6. バッジ・ラベル
7. トースト通知

---

## 1. ボタンコンポーネント

### 1.1 プライマリボタン

メインのアクション（送信、確認、進む等）に使用します。

**通常モード:**
```tsx
<button className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors min-h-[44px]">
  送信する
</button>
```

**クリスマスモード:**
```tsx
<button className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors min-h-[44px] ${
  isChristmasMode
    ? 'bg-[#6d1a1a] hover:bg-[#8b2323] border border-[#d4af37]/40'
    : 'bg-amber-600 hover:bg-amber-700'
}`}>
  送信する
</button>
```

### 1.2 グラデーションボタン（高級感演出）

目立たせたいアクション（メイン機能の起動等）に使用します。

**通常モード:**
```tsx
<button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all px-6 py-3 min-h-[44px]">
  スタート
</button>
```

**クリスマスモード:**
```tsx
<button className={`rounded-xl font-bold px-6 py-3 min-h-[44px] transition-all active:scale-[0.98] ${
  isChristmasMode
    ? 'bg-gradient-to-r from-[#d4af37] to-[#e8c65f] text-[#051a0e] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]'
    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-amber-700'
}`}>
  スタート
</button>
```

### 1.3 セカンダリボタン

補助的なアクション（キャンセル、リセット等）に使用します。

**通常モード:**
```tsx
<button className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors min-h-[44px]">
  キャンセル
</button>
```

**クリスマスモード:**
```tsx
<button className={`px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px] ${
  isChristmasMode
    ? 'bg-[#3a3a3a] text-[#f8f1e7] hover:bg-[#4a4a4a]'
    : 'bg-gray-600 text-white hover:bg-gray-700'
}`}>
  キャンセル
</button>
```

### 1.4 アウトラインボタン

補助的だがユーザーが選択できるアクション（オプション選択等）に使用します。

**通常モード:**
```tsx
<button className="px-6 py-3 border-2 border-amber-200 text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg font-semibold hover:from-amber-100 hover:to-amber-200 transition-all min-h-[44px]">
  詳細表示
</button>
```

**クリスマスモード:**
```tsx
<button className={`px-6 py-3 rounded-lg font-semibold transition-all min-h-[44px] ${
  isChristmasMode
    ? 'border-2 border-[#d4af37]/60 text-[#d4af37] bg-[#d4af37]/10 hover:bg-[#d4af37]/20'
    : 'border-2 border-amber-200 text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200'
}`}>
  詳細表示
</button>
```

### 1.5 アイコンボタン（丸型）

アイコン単体のボタン（戻る、メニュー開く等）に使用します。

**通常モード:**
```tsx
<button className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors">
  <HiArrowLeft className="h-6 w-6" />
</button>
```

**クリスマスモード:**
```tsx
<button className={`flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full transition-all ${
  isChristmasMode
    ? 'text-[#d4af37] bg-white/5 hover:bg-[#d4af37]/20 border border-[#d4af37]/20'
    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
}`}>
  <HiArrowLeft className="h-6 w-6" />
</button>
```

### 1.6 テキストボタン（リンクスタイル）

インラインテキストの中で、リンクやアクションを示します。

**通常モード:**
```tsx
<button className="text-amber-600 hover:text-amber-700 hover:underline font-semibold transition-colors">
  詳しく見る
</button>
```

**クリスマスモード:**
```tsx
<button className={`font-semibold transition-colors ${
  isChristmasMode
    ? 'text-[#d4af37] hover:text-[#e8c65f] hover:underline'
    : 'text-amber-600 hover:text-amber-700 hover:underline'
}`}>
  詳しく見る
</button>
```

---

## 2. 入力フィールド

### 2.1 テキスト入力フィールド

通常のテキスト入力に使用します。

**通常モード:**
```tsx
<input
  type="text"
  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 text-lg text-gray-900 bg-white focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 shadow-sm hover:border-gray-300"
  placeholder="ここに入力"
/>
```

**クリスマスモード:**
```tsx
<input
  type="text"
  className={`w-full rounded-lg border-2 px-4 py-3.5 text-lg transition-all duration-200 ${
    isChristmasMode
      ? 'bg-white/10 border-[#d4af37]/40 text-[#f8f1e7] focus:border-[#d4af37] focus:ring-[#d4af37]/20'
      : 'border-gray-200 text-gray-900 bg-white focus:border-amber-500 focus:ring-amber-100'
  }`}
  placeholder="ここに入力"
/>
```

### 2.2 数値入力フィールド

数値専用の入力（時間、点数等）に使用します。

```tsx
<input
  type="number"
  min="0"
  max="100"
  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
  placeholder="数値を入力"
/>
```

### 2.3 セレクトボックス

複数の選択肢から1つを選択させます。

**通常モード:**
```tsx
<select className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-lg text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]">
  <option value="">選択してください</option>
  <option value="option1">選択肢1</option>
  <option value="option2">選択肢2</option>
</select>
```

**クリスマスモード:**
```tsx
<select className={`w-full rounded-md border px-4 py-2.5 text-lg min-h-[44px] transition-all ${
  isChristmasMode
    ? 'bg-white/10 border-[#d4af37]/40 text-[#f8f1e7] focus:border-[#d4af37] focus:ring-[#d4af37]/20'
    : 'border-gray-300 text-gray-900 bg-white focus:border-amber-500 focus:ring-amber-500'
}`}>
  <option value="">選択してください</option>
</select>
```

### 2.4 テキストエリア（複数行入力）

複数行の入力（メモ、コメント等）に使用します。

```tsx
<textarea
  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
  rows={4}
  placeholder="複数行入力できます"
/>
```

### 2.5 チェックボックス

複数の選択肢から複数選択可能にします。

**通常モード:**
```tsx
<label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
  <input
    type="checkbox"
    className="w-5 h-5 text-amber-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
  />
  <span className="text-gray-700 font-medium">同意します</span>
</label>
```

**クリスマスモード:**
```tsx
<label className={`flex items-center gap-3 cursor-pointer min-h-[44px] ${
  isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-700'
}`}>
  <input
    type="checkbox"
    className={`w-5 h-5 rounded focus:ring-2 ${
      isChristmasMode
        ? 'bg-white/10 border-2 border-[#d4af37]/60 text-[#d4af37] focus:ring-[#d4af37]/20'
        : 'text-amber-600 border-2 border-gray-300 focus:ring-amber-500'
    }`}
  />
  <span className="font-medium">同意します</span>
</label>
```

### 2.6 ラジオボタン

複数の選択肢から1つだけ選択可能にします。

```tsx
<label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
  <input
    type="radio"
    name="option"
    value="1"
    className="w-5 h-5 text-amber-600 border-2 border-gray-300 focus:ring-2 focus:ring-amber-500"
  />
  <span className="text-gray-700 font-medium">選択肢1</span>
</label>
```

---

## 3. カードコンポーネント

### 3.1 基本カード

リスト、グリッド内で使用する基本的なカードです。

**通常モード:**
```tsx
<div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer">
  <h3 className="text-lg font-bold text-gray-800 mb-2">カードタイトル</h3>
  <p className="text-gray-600 text-sm">説明文</p>
</div>
```

**クリスマスモード:**
```tsx
<div className={`rounded-2xl border p-4 transition-all cursor-pointer ${
  isChristmasMode
    ? 'bg-white/5 border-[#d4af37]/40 hover:bg-white/10 hover:border-[#d4af37]/70 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
    : 'bg-white border-gray-100 shadow-md hover:shadow-lg hover:border-gray-300'
}`}>
  <h3 className={`text-lg font-bold mb-2 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
    カードタイトル
  </h3>
  <p className={isChristmasMode ? 'text-[#f8f1e7]/60' : 'text-gray-600 text-sm'}>
    説明文
  </p>
</div>
```

### 3.2 ホームページスタイルカード（ボタンカード）

ホームページのアクション選択に使用するカードです。

**通常モード:**
```tsx
<button
  className="group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 shadow-2xl transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-white/95 text-[#1F2A44] shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-primary focus-visible:ring-offset-[#F5F2EB]"
  onClick={handleAction}
>
  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/15">
    <FaIcon className="h-8 w-8 relative z-10" />
  </span>
  <div className="space-y-1 text-center relative z-10">
    <p className="font-bold text-base md:text-lg text-slate-900">カードタイトル</p>
    <p className="text-xs md:text-sm text-slate-500">説明</p>
  </div>
</button>
```

**クリスマスモード:**
```tsx
<button
  className={`group relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl p-5 transition-all hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
    isChristmasMode
      ? 'bg-white/5 border border-[#d4af37]/40 hover:bg-white/10 hover:border-[#d4af37]/70 shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-visible:ring-[#d4af37] focus-visible:ring-offset-[#051a0e]'
      : 'bg-white/95 shadow-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] focus-visible:ring-primary focus-visible:ring-offset-[#F5F2EB]'
  }`}
>
  <span className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${
    isChristmasMode
      ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]'
      : 'bg-primary/10 text-primary group-hover:bg-primary/15'
  }`}>
    <FaIcon className="h-8 w-8 relative z-10" />
  </span>
  <div className={`space-y-1 text-center relative z-10 ${
    isChristmasMode ? 'text-[#f8f1e7]' : 'text-[#1F2A44]'
  }`}>
    <p className={`font-bold text-base md:text-lg ${isChristmasMode ? 'group-hover:text-[#d4af37]' : 'text-slate-900'}`}>
      カードタイトル
    </p>
    <p className={`text-xs md:text-sm ${isChristmasMode ? 'text-[#f8f1e7]/60 group-hover:text-[#f8f1e7]/90' : 'text-slate-500'}`}>
      説明
    </p>
  </div>
</button>
```

### 3.3 二重ボーダーカード

視覚的な強調が必要なカード（特集、重要情報等）に使用します。

```tsx
<div className="rounded-2xl border-4 border-amber-950 p-1">
  <div className="rounded-lg border-2 border-amber-500 bg-gradient-to-r from-stone-50 via-amber-50/30 to-stone-100 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
    {/* カード内容 */}
  </div>
</div>
```

---

## 4. モーダル・ダイアログ

### 4.1 基本モーダル

確認や選択が必要な情報を表示します。

**通常モード:**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">タイトル</h2>
    <p className="text-base text-gray-600 mb-6">説明文</p>
    <div className="flex gap-4 justify-end">
      <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors min-h-[44px]">
        キャンセル
      </button>
      <button className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors min-h-[44px]">
        確認
      </button>
    </div>
  </div>
</div>
```

**クリスマスモード:**
```tsx
<div className={`fixed inset-0 z-50 flex items-center justify-center ${
  isChristmasMode ? 'bg-black/70' : 'bg-black/50'
}`}>
  <div className={`rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 ${
    isChristmasMode
      ? 'bg-[#0a2f1a] border border-[#d4af37]/40'
      : 'bg-white'
  }`}>
    <h2 className={`text-2xl font-bold mb-4 ${isChristmasMode ? 'text-[#d4af37]' : 'text-gray-800'}`}>
      タイトル
    </h2>
    <p className={`text-base mb-6 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-600'}`}>
      説明文
    </p>
    <div className="flex gap-4 justify-end">
      <button className={`px-6 py-3 rounded-lg transition-colors min-h-[44px] ${
        isChristmasMode
          ? 'bg-[#3a3a3a] text-[#f8f1e7] hover:bg-[#4a4a4a]'
          : 'bg-gray-600 text-white hover:bg-gray-700'
      }`}>
        キャンセル
      </button>
      <button className={`px-6 py-3 rounded-lg transition-colors min-h-[44px] ${
        isChristmasMode
          ? 'bg-[#6d1a1a] text-[#f8f1e7] hover:bg-[#8b2323] border border-[#d4af37]/40'
          : 'bg-amber-600 text-white hover:bg-amber-700'
      }`}>
        確認
      </button>
    </div>
  </div>
</div>
```

### 4.2 Escapeキーで閉じる実装

モーダルがEscapeキーで閉じられるようにします。

```tsx
useEffect(() => {
  if (isOpen) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }
}, [isOpen, onClose]);
```

---

## 5. ヘッダー・ナビゲーション

### 5.1 シンプルヘッダー（戻るボタン + タイトル）

通常のページヘッダーに使用します。

**通常モード:**
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

### 5.2 3カラムヘッダー（戻る + タイトル + アクション）

複雑なアクションが必要なページに使用します。

```tsx
<header className="mb-4">
  <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-4">
    {/* 左: 戻るボタン */}
    <div className="flex justify-start">
      <Link href="/" className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded min-h-[44px] min-w-[44px]">
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
        アクション
      </button>
    </div>
  </div>
</header>
```

---

## 6. バッジ・ラベル

### 6.1 New!ラベル（パルスアニメーション）

新機能やアップデートを示します。

**通常モード:**
```tsx
<div className="absolute -top-1 -right-1 z-20 animate-pulse-scale">
  <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] whitespace-nowrap font-bold text-white shadow-lg bg-gradient-to-r from-red-500 to-red-600 ring-2 ring-white/20">
    <BsStars className="text-[10px]" />
    New!
  </span>
</div>
```

### 6.2 ステータスバッジ

ステータスを色分けして表示します。

```tsx
// 完了
<span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
  完了
</span>

// 進行中
<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
  進行中
</span>

// 未開始
<span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
  未開始
</span>
```

---

## 7. トースト通知

簡単な通知メッセージを画面に表示します。

**通常モード:**
```tsx
<div className="fixed bottom-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg max-w-sm">
  <p className="font-semibold">成功</p>
  <p className="text-sm">操作が完了しました</p>
</div>
```

**クリスマスモード:**
```tsx
<div className={`fixed bottom-4 right-4 z-50 p-4 rounded shadow-lg max-w-sm ${
  isChristmasMode
    ? 'bg-[#1a472a] border-l-4 border-[#d4af37] text-[#f8f1e7]'
    : 'bg-green-100 border-l-4 border-green-500 text-green-700'
}`}>
  <p className="font-semibold">成功</p>
  <p className="text-sm">操作が完了しました</p>
</div>
```

---

## アクセシビリティ対応チェックリスト

各コンポーネント実装時に確認してください：

- [ ] **最小タッチサイズ**: `min-h-[44px] min-w-[44px]`（すべてのインタラクティブ要素）
- [ ] **フォーカスリング**: `focus-visible:ring-2` で見えるフォーカス
- [ ] **ARIA属性**: `aria-label`, `aria-hidden`, `role` を適切に使用
- [ ] **カラーコントラスト**: 背景色とテキスト色のコントラスト比が4.5:1以上
- [ ] **キーボード操作**: Escapeキー、Enterキーで適切に動作
- [ ] **スクリーンリーダー対応**: 画像に `alt` テキスト、ボタンに説明テキスト

---

## クリスマスモード対応時の注意点

配色切り替え時は必ず以下を確認：

```tsx
// 推奨パターン
const { isChristmasMode } = useChristmasMode();

className={`${isChristmasMode ? 'クリスマス色' : '通常色'}`}
```

- 背景色: `#0a2f1a` → ゴールド `#d4af37` + 赤 `#e23636` アクセント
- テキスト: 白 → アイボリー `#f8f1e7`
- 境界線: グレー → ゴールド `#d4af37` with 透明度
- ホバー効果: 微妙な動き → より目立つ輝く効果

