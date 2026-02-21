# テスト計画

## テスト戦略

### 手動テスト（メイン）

セキュリティルールとヘッダー設定の変更は、実際の動作確認が中心。

#### Firestoreセキュリティルール

**テスト1: `defectBeans` スキーマバリデーション**

- [ ] **正常データ書き込み**: Firebase Consoleまたはアプリから正常なデータを書き込む
  ```json
  {
    "name": "テスト欠点豆",
    "description": "説明文",
    "imagePath": "/path/to/image.jpg"
  }
  ```
  → 成功すること

- [ ] **必須フィールド欠如**: `name` を含まないデータを書き込む
  ```json
  {
    "description": "説明文のみ"
  }
  ```
  → 拒否されること（Permission denied）

- [ ] **型違反**: `name` に数値を設定
  ```json
  {
    "name": 123,
    "description": "説明文"
  }
  ```
  → 拒否されること

- [ ] **サイズ制限違反**: `name` に101文字の文字列を設定
  ```json
  {
    "name": "あ".repeat(101),
    "description": "説明文"
  }
  ```
  → 拒否されること

**テスト2: `_meta` read only化**

- [ ] **読み取り**: `_meta/serverTime` を読み取る → 成功すること
- [ ] **書き込み**: `_meta/test` に書き込もうとする → 拒否されること（Permission denied）

#### Firebase Hosting CSPヘッダー

**テスト3: CSPヘッダー確認**

- [ ] デプロイ後、Chrome DevToolsの Network タブで任意のHTMLを開く
- [ ] Response Headers に `Content-Security-Policy` が含まれていること
- [ ] CSP値が設計書通りであること

**テスト4: CSP違反検出**

- [ ] アプリを操作し、Console に CSP違反の警告が出ないこと
  - 欠点豆機能
  - OCR機能
  - テイスティング機能
  - スケジュール機能
- [ ] もし警告が出た場合、許可するドメインをCSPに追加

#### Cloud Functions zodバリデーション

**テスト5: OCR Function バリデーション**

- [ ] **正常な入力**: Base64画像データでFunctionを呼び出す → 成功すること
- [ ] **空文字列**: `imageBase64: ""` で呼び出す → zodエラー `画像データが必要です`
- [ ] **サイズ超過**: `imageBase64` に MAX_BASE64_LENGTH を超える文字列 → zodエラー `画像サイズが大きすぎます`

**テスト6: Tasting Function バリデーション**

- [ ] **正常な入力**: 全フィールド正常値でFunctionを呼び出す → 成功すること
- [ ] **`beanName` 欠如**: `beanName` を含まずに呼び出す → zodエラー `銘柄名が必要です`
- [ ] **`beanName` 長すぎ**: 101文字の文字列 → zodエラー `銘柄名が長すぎます`
- [ ] **`averageScores` 範囲外**: `bitterness: 6` → zodエラー（0〜5の範囲違反）
- [ ] **`comments` 要素が長すぎ**: 501文字のコメント → zodエラー `感想が長すぎます`

---

### 自動テスト

#### Lint

- [ ] `npm run lint` がエラー・warning ゼロで通ること

#### Build

- [ ] `npm run build` が成功すること（Next.js + Functions両方）

#### 既存テスト

- [ ] `npm run test` が全テストpass（リグレッションなし）

---

## テストケース詳細

### Firestoreルール（手動）

| テストケース | 入力 | 期待結果 |
|------------|------|---------|
| 正常な欠点豆作成 | `{ name: "豆A", description: "説明" }` | 成功 |
| `name` 欠如 | `{ description: "説明" }` | Permission denied |
| `name` 型違反 | `{ name: 123, description: "説明" }` | Permission denied |
| `name` 長すぎ | `{ name: "あ".repeat(101), description: "説明" }` | Permission denied |
| `description` 長すぎ | `{ name: "豆A", description: "あ".repeat(501) }` | Permission denied |
| `_meta` 読み取り | `_meta/serverTime` を取得 | 成功 |
| `_meta` 書き込み | `_meta/test` に書き込み | Permission denied |

### Cloud Functions zodバリデーション（手動）

| テストケース | 入力 | 期待結果 |
|------------|------|---------|
| OCR正常 | `imageBase64: "valid_base64_string"` | 成功 |
| OCR空文字列 | `imageBase64: ""` | `invalid-argument: 画像データが必要です` |
| OCR長すぎ | `imageBase64: "x".repeat(MAX_BASE64_LENGTH + 1)` | `invalid-argument: 画像サイズが大きすぎます` |
| Tasting正常 | 全フィールド正常値 | 成功 |
| Tasting `beanName` 欠如 | `beanName` なし | `invalid-argument: 銘柄名が必要です` |
| Tasting `beanName` 長すぎ | `beanName: "あ".repeat(101)` | `invalid-argument: 銘柄名が長すぎます` |
| Tasting スコア範囲外 | `averageScores.bitterness: 6` | `invalid-argument: ...` |

---

## カバレッジ目標

- **Firestoreルール**: 主要な攻撃パターンをカバー（必須フィールド欠如、型違反、サイズ超過）
- **CSPヘッダー**: 全ページで違反がないこと（Console警告ゼロ）
- **Cloud Functions**: 不正入力が適切にエラーハンドリングされること
- **既存テスト**: 100% pass（リグレッションなし）

---

## テスト環境

- **開発環境**: Firebase Emulator（Firestore, Functions）
- **本番環境**: Firebase Hosting, Firestore, Cloud Functions
- **ブラウザ**: Chrome（DevTools でCSP確認）

---

## 注意事項

### Firebaseルールのテスト

- Firebase Emulatorを使ったセキュリティルールのユニットテストは、本Issueではオプション（時間があれば）
- 手動テストで主要なケースをカバーすればOK

### CSPヘッダーのテスト

- デプロイ後にのみ確認可能（ローカルではNext.js devサーバーのヘッダーが優先される）
- Firebase Hosting Preview URL でテスト可能

### Cloud Functionsのテスト

- Firebase Emulatorでローカルテスト可能
- 本番デプロイ前にEmulatorで動作確認推奨
