# 設計書

## 実装方針

### 変更対象ファイル
- `app/dev/design-lab/components/registry.ts` - セクション登録追加
- `app/dev/design-lab/page.tsx` - sectionComponents にコンポーネント登録
- `components/ui/Modal.tsx` - アニメーション設定変更（フェーズ2）

### 新規作成ファイル
- `app/dev/design-lab/components/sections/ModalAnimations.tsx` - アニメーション比較UI

## UI設計

### ModalAnimations セクション構成
- タイトル + 説明文
- 5つのカードが縦に並ぶ（各パターン1カード）
- 各カードにパターン名・パラメータ説明・「開く」ボタン
- ボタンクリックで該当パターンのアニメーションでモーダルが開く
- モーダル内にパターン名とパラメータ詳細を表示

### アニメーションパターン定義

```typescript
const animationPatterns = [
  {
    name: 'Current',
    description: '現行: scale 0.5→1 + spring',
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { type: 'spring', damping: 20 },
  },
  {
    name: 'Fade Only',
    description: 'opacity のみ。最も控えめ',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  {
    name: 'Fade + Subtle Scale',
    description: '微小スケール + フェード。上品',
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  {
    name: 'Slide Up',
    description: '下からスライド。モバイルアプリ風',
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 30, opacity: 0 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  {
    name: 'Slide Up + Spring',
    description: '下からスライド + spring。適度な演出',
    initial: { y: 40, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 40, opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
];
```

### 使用する共通コンポーネント
- `Button` - 各パターンの「開く」ボタン

## 影響範囲
- `Modal` を使用する全コンポーネント（Dialog含む）にアニメーション変更が波及
- 機能への影響なし（アニメーションのみの変更）

## ADR

### Decision-001: デザインラボで比較してから適用
- **理由**: アニメーションは実際に見て比較しないと判断が難しい
- **影響**: デザインラボにセクション追加のコストが発生するが、将来的に他のアニメーション調整にも再利用可能
