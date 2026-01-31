# クリスマスモード実装ガイド

## 概要

クリスマスシーズン限定の特別デザインモード。深緑と金色を基調とした高級感ある配色で、コーヒーの温かみと冬の特別感を演出します。

## 有効化条件

```typescript
// hooks/useChristmasMode.ts
export function useChristmasMode() {
  const [isChristmasMode, setIsChristmasMode] = useState(false);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const date = now.getDate();

    // 12/1 ~ 12/31
    const isChristmasSeason = month === 11;
    setIsChristmasMode(isChristmasSeason);
  }, []);

  return { isChristmasMode };
}
```

## 配色スキーム

### 背景色

| 用途 | 通常モード | クリスマスモード |
|------|------------|------------------|
| ページ背景 | `#F7F7F5` | `#051a0e` |
| カード背景 | `white` | `#0a2f1a` |
| グラデーション背景 | `from-[#F7F2EB] to-[#F3F0EA]` | `bg-[radial-gradient(circle_at_center,_#0a2f1a_0%,_#051a0e_100%)]` |

### テキスト色

| 用途 | 通常モード | クリスマスモード |
|------|------------|------------------|
| プライマリテキスト | `#1F2A44` | `#f8f1e7` |
| セカンダリテキスト | `#6B7280` | `#c5b8a0` |
| ラベルテキスト | `#374151` | `#e8dcc4` |

### アクセント色

| 用途 | 通常モード | クリスマスモード |
|------|------------|------------------|
| ゴールド | `#d4af37` | `#d4af37` (同じ) |
| ボーダー | `#E5E7EB` | `#d4af37/40` |
| ホバー背景 | `#F3F4F6` | `#0f4028` |

## 実装パターン

### パターン1: Tailwind条件付きクラス

```tsx
const { isChristmasMode } = useChristmasMode();

<div className={`
  ${isChristmasMode
    ? 'bg-[#051a0e] text-[#f8f1e7]'
    : 'bg-[#F7F7F5] text-[#1F2A44]'
  }
`}>
  {/* コンテンツ */}
</div>
```

### パターン2: スタイルオブジェクト

```tsx
const { isChristmasMode } = useChristmasMode();

<div style={{
  backgroundColor: isChristmasMode ? '#051a0e' : '#F7F7F5',
  color: isChristmasMode ? '#f8f1e7' : '#1F2A44'
}}>
  {/* コンテンツ */}
</div>
```

### パターン3: カスタムクラス切り替え

```tsx
// globals.css
.page-bg {
  background-color: #F7F7F5;
}

.christmas-mode .page-bg {
  background: radial-gradient(circle at center, #0a2f1a 0%, #051a0e 100%);
}

// Component
const { isChristmasMode } = useChristmasMode();

<div className={isChristmasMode ? 'christmas-mode' : ''}>
  <div className="page-bg">
    {/* コンテンツ */}
  </div>
</div>
```

## コンポーネント別実装例

### ボタン

```tsx
<button className={`
  px-6 py-3 rounded-lg font-semibold transition-colors min-h-[44px]
  ${isChristmasMode
    ? 'bg-[#d4af37] text-[#051a0e] hover:bg-[#e6c350]'
    : 'bg-amber-600 text-white hover:bg-amber-700'
  }
`}>
  アクション
</button>
```

### カード

```tsx
<div className={`
  rounded-2xl shadow-md p-5 transition-all
  ${isChristmasMode
    ? 'bg-[#0a2f1a] border border-[#d4af37]/40'
    : 'bg-white'
  }
`}>
  <h3 className={isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}>
    タイトル
  </h3>
</div>
```

### 入力フィールド

```tsx
<input
  type="text"
  className={`
    w-full rounded-lg px-4 py-3.5 text-lg transition-all
    ${isChristmasMode
      ? 'bg-[#051a0e] border-2 border-[#d4af37]/40 text-[#f8f1e7] focus:border-[#d4af37]'
      : 'bg-white border-2 border-gray-200 text-gray-900 focus:border-amber-500'
    }
  `}
  placeholder="入力してください"
/>
```

### モーダル

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div className={`
    rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4
    ${isChristmasMode
      ? 'bg-[#0a2f1a] border border-[#d4af37]/40'
      : 'bg-white'
    }
  `}>
    <h2 className={`text-2xl font-bold mb-4 ${isChristmasMode ? 'text-[#f8f1e7]' : 'text-gray-800'}`}>
      タイトル
    </h2>
    <p className={`mb-6 ${isChristmasMode ? 'text-[#c5b8a0]' : 'text-gray-600'}`}>
      メッセージ
    </p>
  </div>
</div>
```

## アニメーション

### スノーフレークアニメーション (オプション)

```tsx
// components/ChristmasSnowflakes.tsx
'use client';

export function ChristmasSnowflakes() {
  const { isChristmasMode } = useChristmasMode();

  if (!isChristmasMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-snowfall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }}
        >
          ❄️
        </div>
      ))}
    </div>
  );
}

// globals.css
@keyframes snowfall {
  0% {
    top: -10%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 110%;
    opacity: 0;
  }
}
```

## ベストプラクティス

### ✅ 推奨

- **グローバルフック使用**: `useChristmasMode()` を各コンポーネントで呼び出し
- **コントラスト確保**: 暗い背景でもテキストが読みやすいように `#f8f1e7` を使用
- **グラデーション活用**: `radial-gradient` で深みを演出
- **金色のアクセント**: ボーダーやアイコンに `#d4af37` を使用

### ❌ 避けるべき

- **中途半端な対応**: 一部のページだけクリスマスモード対応すると不統一
- **過度な装飾**: スノーフレークアニメーションは控えめに（パフォーマンス考慮）
- **視認性の低下**: 暗い背景に暗いテキストを配置しない

## チェックリスト

新規ページ作成時にクリスマスモード対応が必要な場合:

- [ ] `useChristmasMode()` フックをインポート
- [ ] 背景色を条件付きで切り替え (`#051a0e` / `#F7F7F5`)
- [ ] テキスト色を条件付きで切り替え (`#f8f1e7` / `#1F2A44`)
- [ ] ボタン、カード、入力フィールドの色を調整
- [ ] ボーダーに金色 (`#d4af37/40`) を使用
- [ ] 実機で視認性を確認

## リリース時の注意

- **12月1日前**: クリスマスモード機能を本番環境にデプロイ
- **12月1日**: 自動的に有効化される
- **1月1日**: 自動的に無効化される
- **1月中旬**: 次回のシーズンまでコードは残しておく (メンテナンス不要)
