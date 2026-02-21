# 設計書

## 実装方針

### 変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `firestore.rules` | `defectBeans` スキーマバリデーション追加、`_meta` read only化 |
| `firebase.json` | CSPヘッダー追加 |
| `functions/package.json` | zod追加 |
| `functions/src/ocr-schedule.ts` | zodバリデーション追加 |
| `functions/src/tasting-analysis.ts` | zodバリデーション追加 |

### 新規作成ファイル

なし

---

## Firestoreセキュリティルール詳細

### `defectBeans` コレクションのバリデーション

**現状**:
```javascript
match /defectBeans/{defectBeanId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

**改善後**:
```javascript
match /defectBeans/{defectBeanId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null
    && request.resource.data.keys().hasAll(['name', 'description'])
    && request.resource.data.name is string
    && request.resource.data.name.size() > 0
    && request.resource.data.name.size() <= 100
    && request.resource.data.description is string
    && request.resource.data.description.size() <= 500
    && (!request.resource.data.keys().hasAny(['imagePath']) || request.resource.data.imagePath is string);
  allow delete: if request.auth != null;
}
```

**ルール説明**:
- `name`: 必須、string、1〜100文字
- `description`: 必須、string、最大500文字
- `imagePath`: オプション、指定する場合はstring
- 削除は認証済みユーザーなら可能（既存の動作維持）

### `_meta` コレクションの変更

**現状**:
```javascript
match /_meta/{document=**} {
  allow read, write: if request.auth != null;
}
```

**改善後**:
```javascript
match /_meta/{document=**} {
  allow read: if request.auth != null;
  // write権限を削除（サーバー時刻取得は読み取り専用で十分）
}
```

**理由**:
- `_meta` コレクションはサーバー時刻取得など読み取り専用の用途
- 書き込み権限は不要でありセキュリティリスク

---

## Firebase Hosting CSPヘッダー

### 追加するヘッダー

`firebase.json` の `headers` セクションに追加:

```json
{
  "source": "**/*.html",
  "headers": [
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebasestorage.googleapis.com https://firestore.googleapis.com https://*.firebase.com https://*.firebaseio.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    }
  ]
}
```

### CSPディレクティブ説明

| ディレクティブ | 値 | 理由 |
|--------------|---|------|
| `default-src` | `'self'` | デフォルトで同一オリジンのみ許可 |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` | Next.js（インラインスクリプト、eval使用）対応 |
| `style-src` | `'self' 'unsafe-inline'` | Tailwind CSS（インラインスタイル）対応 |
| `img-src` | `'self' data: https:` | Data URI、HTTPS画像許可 |
| `font-src` | `'self' data:` | カスタムフォント、Data URI許可 |
| `connect-src` | `'self' https://firebasestorage.googleapis.com ...` | Firebase API通信許可 |
| `frame-ancestors` | `'none'` | iframe埋め込み禁止（X-Frame-Options: DENY相当） |
| `base-uri` | `'self'` | `<base>` タグ制限 |
| `form-action` | `'self'` | フォーム送信先制限 |

**注意**:
- `'unsafe-inline'`, `'unsafe-eval'` は理想的ではないが、Next.js + Tailwind CSS v4の制約上必須
- 将来的にはnonce/hashベースのCSP移行を検討

---

## Cloud Functions zodバリデーション

### zodスキーマ定義

#### `ocr-schedule.ts`

```typescript
import { z } from 'zod';

const OcrRequestSchema = z.object({
  imageBase64: z.string().min(1, '画像データが必要です').max(MAX_BASE64_LENGTH, '画像サイズが大きすぎます'),
});
```

**検証箇所**:
```typescript
const validationResult = OcrRequestSchema.safeParse(request.data);
if (!validationResult.success) {
  throw new HttpsError('invalid-argument', validationResult.error.errors[0].message);
}
const { imageBase64 } = validationResult.data;
```

#### `tasting-analysis.ts`

```typescript
import { z } from 'zod';

const TastingAnalysisSchema = z.object({
  beanName: z.string().min(1, '銘柄名が必要です').max(100, '銘柄名が長すぎます'),
  roastLevel: z.string().min(1, '焙煎度が必要です').max(50, '焙煎度が長すぎます'),
  comments: z.array(z.string().max(500, '感想が長すぎます')),
  averageScores: z.object({
    bitterness: z.number().min(0).max(5),
    acidity: z.number().min(0).max(5),
    body: z.number().min(0).max(5),
    sweetness: z.number().min(0).max(5),
    aroma: z.number().min(0).max(5),
  }),
});
```

**検証箇所**:
```typescript
const validationResult = TastingAnalysisSchema.safeParse(request.data);
if (!validationResult.success) {
  throw new HttpsError('invalid-argument', validationResult.error.errors[0].message);
}
const data = validationResult.data;
```

---

## 影響範囲

### ユーザー影響

- **なし**（正常な動作に影響なし、セキュリティ向上のみ）

### 開発者影響

- `defectBeans` コレクションへの書き込み時、スキーマに準拠しないとエラー
- `_meta` コレクションへの書き込みは不可（既存コードで書き込み操作がないか確認必要）
- Cloud Functionsへの不正な入力がバリデーションエラーで明確に返される

### パフォーマンス影響

- Firestoreルール評価: 微増（バリデーション追加）
- Cloud Functions: zodバリデーションによる微増（無視できるレベル）

---

## 禁止事項チェック

- ❌ `unsafe-inline` を除外しない → Next.js + Tailwind制約のため必須
- ❌ Firebase APIドメインを制限しすぎない → 必要なドメインのみ許可
- ❌ 既存の正常な動作を壊さない → 既存コードのバリデーション通過確認必須

---

## テスト方針

### 手動テスト

1. **Firestoreルール**:
   - Firebase Consoleから不正データを書き込もうとする → 拒否されること
   - アプリから正常なデータを書き込む → 成功すること
   - `_meta` コレクションへの書き込みを試みる → 拒否されること

2. **CSPヘッダー**:
   - デプロイ後、Chrome DevToolsの Network タブでレスポンスヘッダーを確認
   - `Content-Security-Policy` が含まれていること

3. **Cloud Functionsバリデーション**:
   - 不正な入力でCloud Functionを呼び出す → zodエラーが返されること
   - 正常な入力で呼び出す → 成功すること

### 自動テスト

- Lint チェック pass
- Build チェック pass
- 既存テスト pass（リグレッションなし）

---

## セキュリティ考慮事項

### 残存リスク

1. **`script-src 'unsafe-inline' 'unsafe-eval'`**:
   - Next.jsの制約上必須だが、XSSリスクが残る
   - 将来的にnonce/hashベースのCSP移行を検討

2. **Storage Rulesのバリデーション不足**:
   - 本Issueでは対象外（オプション要件）
   - 将来的にファイルサイズ、MIME typeのバリデーション追加を検討

### セキュリティ監査推奨事項

- Firebase Emulatorでセキュリティルールのテストスイート作成（別Issue化を推奨）
- CSPレポート収集（`report-uri` または `report-to` ディレクティブ追加）
