# 設計書: コーヒー豆図鑑ページの共通UI化とテーマ対応

## 変更対象ファイル

| ファイル | 変更内容 |
|---|---|
| `app/defect-beans/page.tsx` | BackLink導入、ボタン→Button、useChristmasMode導入 |
| `components/defect-beans/EmptyState.tsx` | ボタン→Button、isChristmasMode prop |
| `components/defect-beans/SortMenu.tsx` | ボタン→Button、isChristmasMode prop |
| `components/defect-beans/SearchFilterSection.tsx` | isChristmasMode prop追加（既にInput/Button使用済み） |
| `components/DefectBeanCard.tsx` | ボタン→Button/IconButton、isChristmasMode prop |
| `components/DefectBeanForm.tsx` | Modal導入、isChristmasMode prop |
| `components/defect-bean-form/DefectBeanFormFields.tsx` | ボタン→Button/IconButton、isChristmasMode prop |
| `components/DefectBeanCompare.tsx` | Modal導入、isChristmasMode prop |

## 設計判断

### 1. Modalの使用方針
- `DefectBeanForm`と`DefectBeanCompare`の外側ラッパーを `<Modal>` に置換
- Modalコンポーネントの `title` propでヘッダータイトルを設定
- Modalの `onClose` propで閉じる処理を統一

### 2. DefectBeanCardの「省く/省かない」ボタン
- `<Button variant="danger">` と `<Button variant="success">` を使用
- アクティブ状態のスタイルは `className` で追加調整

### 3. isChristmasModeの伝播パターン
```
page.tsx (useChristmasMode)
  ├── BackLink(isChristmasMode)
  ├── Button(isChristmasMode)  ← ヘッダーボタン群
  ├── SearchFilterSection(isChristmasMode)
  │   ├── Input(isChristmasMode)
  │   └── Button(isChristmasMode)
  ├── SortMenu(isChristmasMode)
  │   └── Button(isChristmasMode)
  ├── EmptyState(isChristmasMode)
  │   └── Button(isChristmasMode)
  ├── DefectBeanCard(isChristmasMode)
  │   ├── Button(isChristmasMode)  ← 省く/省かない
  │   └── IconButton(isChristmasMode)  ← モーダル閉じる
  ├── DefectBeanForm(isChristmasMode)
  │   ├── Modal(isChristmasMode)
  │   └── DefectBeanFormFields(isChristmasMode)
  │       ├── Button(isChristmasMode)
  │       └── IconButton(isChristmasMode)
  └── DefectBeanCompare(isChristmasMode)
      └── Modal(isChristmasMode)
```

### 4. 変更しないもの
- **DefectBeanCardのカードコンテナ**: 画像フレーム（額縁風デザイン）が独自で `<Card>` に合わない
- **SortMenuのドロップダウン内選択肢**: カスタム挙動（チェックマーク表示、即閉じ）があり `<Button>` 化の恩恵が薄い
- **DefectBeanFormFieldsの画像選択領域**: ファイル入力との連携が特殊

## 禁止事項チェック
- [x] 生のTailwindでボタン/カード/入力を新規作成しない
- [x] クリスマスモード対応を忘れない
- [x] 共通コンポーネントの重複を作らない
