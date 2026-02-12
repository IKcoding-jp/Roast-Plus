# テスト計画

**Issue**: #227
**作成日**: 2026-02-13

## テスト戦略

### ユニットテスト

#### `lib/theme.ts`
- `lib/theme.test.ts`
  - テーマプリセット定数が6つ存在する
  - 各テーマに必須フィールド（id, name, description, type, previewColors）が存在する
  - テーマIDがユニークである

#### `hooks/useAppTheme.ts`
- `hooks/useAppTheme.test.ts`
  - 初期テーマがdefaultである
  - setThemeでテーマを切り替えられる
  - isDarkThemeがダーク系テーマで正しく判定される
  - isChristmasThemeがクリスマステーマで正しく判定される

#### `hooks/useChristmasMode.ts`（既存テスト確認）
- 既存テストが引き続きパスすることを確認
- テーマシステム拡張後も後方互換性が保たれている

### コンポーネントテスト

#### `components/settings/ThemeSelector.tsx`
- `components/settings/ThemeSelector.test.tsx`
  - 6つのテーマカードが表示される
  - 現在選択中のテーマにチェックマークが表示される
  - テーマカードクリックで `setTheme` が呼ばれる
  - テーマ名と説明文が正しく表示される

### 統合テスト

- 設定画面でテーマ設定セクションが表示される
- テーマ切替がlocalStorageに永続化される
- ブラウザリロード後にテーマが復元される

## カバレッジ目標

- `lib/theme.ts`: 100%
- `hooks/useAppTheme.ts`: 90%以上
- `components/settings/ThemeSelector.tsx`: 80%以上

## 手動確認項目

- [ ] 各テーマで全ページの見た目確認（ホーム、焙煎タイマー、ドリップガイド等）
- [ ] モバイル・デスクトップ両方でカードグリッドの表示確認
- [ ] テーマ切替のレスポンス（即時反映）確認
- [ ] クリスマステーマでの装飾機能（snowfall、アイコン置き換え）確認
