# 設計書

## 実装方針

### アーキテクチャ
ヘッダーバリアントは**Strategy パターン**で実装する。共通インターフェース `HomeHeaderProps` を定義し、各バリアントが同一propsを受け取ることで、切替UIから動的にコンポーネントを差し替え可能にする。

```
app/page.tsx
  └── <HomeHeader> or <HeaderVariantX> （デバッグモードで動的切替）
  └── <HeaderDebugSwitcher>           （開発者モードのみ表示）

components/home/
  ├── HomeHeader.tsx                  ← 現行デザイン抽出
  ├── HeaderDebugSwitcher.tsx         ← 切替UI
  └── header-variants/
      ├── index.ts                    ← バリアントレジストリ
      ├── HeaderVariantA.tsx
      ├── HeaderVariantB.tsx
      └── HeaderVariantC.tsx
```

### 変更対象ファイル
| ファイル | 変更内容 |
|---------|---------|
| `app/page.tsx` | ヘッダー部分を抽出、デバッグ切替ロジック追加 |

### 新規作成ファイル
| ファイル | 役割 |
|---------|------|
| `components/home/HomeHeader.tsx` | 現行ヘッダーの抽出コンポーネント |
| `components/home/HeaderDebugSwitcher.tsx` | フローティング切替パネル |
| `components/home/header-variants/index.ts` | バリアントレジストリ（名前→コンポーネントのマップ） |
| `components/home/header-variants/HeaderVariantA.tsx` | デザイン案A |
| `components/home/header-variants/HeaderVariantB.tsx` | デザイン案B |
| `components/home/header-variants/HeaderVariantC.tsx` | デザイン案C |

### Props設計

```typescript
interface HomeHeaderProps {
  isChristmasMode: boolean;
  isDeveloperMode: boolean;
  router: ReturnType<typeof useRouter>;
  onReplaySplash: () => void;
  onShowLoadingDebugModal: () => void;
}
```

### デバッグ切替UIの仕様
- **位置**: 画面下部中央（`fixed bottom-4 left-1/2 -translate-x-1/2`）
- **表示条件**: `isDeveloperMode === true`
- **内容**: バリアント名ボタン（タブ形式）+ 現在の選択をハイライト
- **状態管理**: `useState` でバリアントインデックスを保持
- **スタイル**: `bg-overlay` 背景、`z-[60]`（ヘッダーz-50の上）

### バリアントレジストリ

```typescript
// components/home/header-variants/index.ts
export const headerVariants = [
  { name: '現行', component: HomeHeader },
  { name: 'バリアントA', component: HeaderVariantA },
  { name: 'バリアントB', component: HeaderVariantB },
  { name: 'バリアントC', component: HeaderVariantC },
];
```

## 影響範囲
- `app/page.tsx` — ヘッダー部分の変更（機能的な変更なし、構造のみ）
- 新規ファイル群 — 既存コードへの影響なし
- デバッグ機能は開発者モードでのみ有効 — 一般ユーザーに影響なし

## 禁止事項チェック
- ❌ 生のTailwindでボタン・カードを作らない → `@/components/ui` の共通コンポーネントを使用
- ❌ `isChristmasMode` propでテーマ分岐しない → CSS変数で自動対応
- ❌ 既存のヘッダー動作を変更しない → 抽出のみ、ロジックは保持
- ❌ モーダル背景に `bg-surface` を使用しない → `bg-overlay` を使用
