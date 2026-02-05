# 設計書

## テストパターン（Button.test.tsx 準拠）

既存の Button.test.tsx のパターンを踏襲：

```typescript
describe('ComponentName', () => {
  describe('基本機能', () => {
    it('正しくレンダリングされる', () => {});
    it('childrenを表示する', () => {});
  });

  describe('バリアント', () => {
    it('各バリアントのスタイルが適用される', () => {});
  });

  describe('クリスマスモード', () => {
    it('クリスマススタイルが適用される', () => {});
  });

  describe('アクセシビリティ', () => {
    it('適切なaria属性が設定される', () => {});
  });

  describe('ref転送', () => {
    it('refが正しく転送される', () => {});
  });
});
```

## テスト技術

### 使用ライブラリ
- Vitest（テストフレームワーク）
- @testing-library/react（レンダリング・クエリ）
- @testing-library/user-event（ユーザーインタラクション）

### モック戦略
- **モック不要**: UIコンポーネントは外部依存が少ない
- **必要な場合のみ**: Modal/Dialogのポータル、アニメーション

### スタイル検証
```typescript
// クラス名の存在確認
expect(element.className).toContain('bg-amber-600');

// クリスマスモード
expect(element.className).toContain('bg-[#6d1a1a]');
```

## コンポーネント別の注意点

### フォーム系
- **Input/Textarea**: value, onChange, placeholder, error
- **NumberInput**: min, max, step, value validation
- **Select**: options, selectedValue, onChange
- **Checkbox/Switch**: checked, onChange, label

### コンテナ系
- **Card**: variant, isChristmasMode, children
- **Modal**: isOpen, onClose, ポータル（createPortal）
- **Dialog**: title, description, actions

### 表示系
- **Badge**: variant, children
- **IconButton**: icon, onClick, disabled
- **Tabs**: items, activeTab, onChange
- **Accordion**: items, expanded state
- **ProgressBar**: value, max, variant
- **EmptyState**: title, description, action

## 禁止事項チェック

- ❌ スナップショットテストは使用しない（メンテナンスコスト高）
- ❌ 実装の詳細（内部state）に依存しない
- ❌ 非同期処理のタイムアウトは最小限に
