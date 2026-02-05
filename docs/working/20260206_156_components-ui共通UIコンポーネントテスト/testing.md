# テスト計画

## テスト戦略

### 共通テストケース（全コンポーネント）

| テストケース | 内容 |
|-------------|------|
| 基本レンダリング | コンポーネントがエラーなくレンダリングされる |
| Props適用 | 各Propsが正しく反映される |
| クリスマスモード | isChristmasMode時のスタイル変更 |
| カスタムクラス | className propの追加 |
| ref転送 | forwardRefが正しく機能する |

---

## フォーム系コンポーネント

### Input.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| 基本レンダリング | `<Input />` | input要素が表示 |
| ラベル表示 | `label="名前"` | labelが表示 |
| placeholder | `placeholder="入力"` | placeholderが設定 |
| value/onChange | 入力操作 | onChangeが呼ばれる |
| エラー表示 | `error="必須"` | エラーメッセージが表示 |
| disabled | `disabled` | 入力不可 |
| クリスマスモード | `isChristmasMode` | スタイル変更 |

### NumberInput.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| 数値入力 | 数字入力 | 数値のみ受け付け |
| 増減ボタン | +/-クリック | 値が増減 |
| min/max制限 | 範囲外の値 | 制限内に収まる |
| step | step=5 | 5刻みで増減 |

### Select.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| オプション表示 | options配列 | 選択肢が表示 |
| 選択変更 | 選択操作 | onChangeが呼ばれる |
| placeholder | placeholder指定 | 初期表示 |
| disabled | disabled | 選択不可 |

### Checkbox.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| チェック状態 | checked=true | チェック表示 |
| トグル操作 | クリック | onChangeが呼ばれる |
| ラベル表示 | label指定 | ラベルが表示 |
| disabled | disabled | 操作不可 |

### Switch.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| ON/OFF状態 | checked=true/false | 状態が反映 |
| トグル操作 | クリック | onChangeが呼ばれる |
| ラベル表示 | label指定 | ラベルが表示 |

---

## コンテナ系コンポーネント

### Card.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| children表示 | children指定 | 内容が表示 |
| バリアント | variant="table" | スタイル変更 |
| クリスマスモード | isChristmasMode | 背景色変更 |

### Modal.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| 表示/非表示 | isOpen=true/false | 表示切替 |
| 閉じる操作 | 背景クリック/Escape | onCloseが呼ばれる |
| children表示 | children指定 | 内容が表示 |
| アクセシビリティ | - | role="dialog", aria-modal |

### Dialog.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| タイトル表示 | title指定 | タイトルが表示 |
| 説明表示 | description指定 | 説明が表示 |
| アクションボタン | actions指定 | ボタンが表示 |
| 閉じる操作 | キャンセル/確定 | 適切なコールバック |

---

## 表示系コンポーネント

### Badge.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| テキスト表示 | children指定 | テキストが表示 |
| バリアント | variant="success" | 色が変更 |
| クリスマスモード | isChristmasMode | スタイル変更 |

### IconButton.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| アイコン表示 | icon指定 | アイコンが表示 |
| クリック操作 | クリック | onClickが呼ばれる |
| disabled | disabled | クリック不可 |
| aria-label | label指定 | アクセシビリティ対応 |

### Tabs.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| タブ表示 | items配列 | タブが表示 |
| アクティブ表示 | activeTab指定 | 選択状態表示 |
| タブ切替 | クリック | onChangeが呼ばれる |

### Accordion.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| ヘッダー表示 | items配列 | ヘッダーが表示 |
| 展開/折りたたみ | クリック | 内容が表示/非表示 |
| 初期状態 | defaultExpanded | 初期展開 |

### ProgressBar.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| 進捗表示 | value=50, max=100 | 50%表示 |
| バリアント | variant="success" | 色が変更 |
| 0% / 100% | 境界値 | 正しく表示 |

### EmptyState.test.tsx

| テストケース | 入力 | 期待結果 |
|-------------|------|---------|
| タイトル表示 | title指定 | タイトルが表示 |
| 説明表示 | description指定 | 説明が表示 |
| アクション表示 | action指定 | ボタンが表示 |
| アイコン表示 | icon指定 | アイコンが表示 |

---

## カバレッジ目標

| 対象 | 目標 |
|------|------|
| components/ui/ | 80%以上 |
| 各テストファイル | Statements 80%以上 |

## テスト実行コマンド

```bash
# 全テスト実行
npm run test

# components/ui/ のみ
npm run test -- components/ui/

# カバレッジ付き
npm run test -- components/ui/ --coverage
```
