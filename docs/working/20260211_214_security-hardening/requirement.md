# 要件定義

**Issue**: #214
**作成日**: 2026-02-11
**ラベル**: security

## ユーザーストーリー

開発者「本番環境の技術監査で、セキュリティの穴がいくつか指摘された。Firestoreルールとヘッダー設定を強化したい」
アプリ「スキーマバリデーション、CSPヘッダー、型安全な入力バリデーションでセキュリティを強化」

## 背景

技術監査（本番運用レビュー・アーキテクチャレビュー）で以下が指摘された:

1. **Firestoreルールの問題**
   - `defectBeans` コレクション: 認証済みユーザーなら誰でも書き込み可能（スキーマバリデーションなし）
   - `_meta` コレクション: 全認証ユーザーがread/write可能（read onlyで十分）

2. **HTTPセキュリティヘッダー不足**
   - Content-Security-Policy (CSP) ヘッダーが未設定（XSS対策の重要レイヤー欠如）

3. **Cloud Functions入力バリデーション不足**
   - 型チェックが甘く、ランタイムエラーの可能性
   - zodなどの型安全なバリデーションライブラリが未導入

## 要件一覧

### 必須要件

#### Firestoreセキュリティルール強化

- [ ] `defectBeans` コレクションの書き込みルールにスキーマバリデーション追加
  - 必須フィールド（`name`, `description`）の存在チェック
  - 型チェック（`name`: string, `description`: string, `imagePath`: string）
  - サイズ制限（`name`: 100文字以内、`description`: 500文字以内）
- [ ] `_meta` コレクションを read only に変更（write権限削除）

#### Firebase Hosting CSPヘッダー追加

- [ ] `firebase.json` に Content-Security-Policy ヘッダーを追加
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (Next.js必須)
  - `style-src 'self' 'unsafe-inline'` (Tailwind必須)
  - `img-src 'self' data: https:`
  - `font-src 'self' data:`
  - `connect-src 'self' https://firebasestorage.googleapis.com https://firestore.googleapis.com https://*.firebase.com`
  - `frame-ancestors 'none'` (X-Frame-Options: DENYと同等)

#### Cloud Functions入力バリデーション強化

- [ ] `functions/package.json` に `zod` を追加
- [ ] `ocr-schedule.ts` に zodスキーマ定義を追加
  - `imageBase64`: z.string().min(1).max(MAX_BASE64_LENGTH)
- [ ] `tasting-analysis.ts` に zodスキーマ定義を追加
  - `beanName`: z.string().min(1).max(100)
  - `roastLevel`: z.string().min(1).max(50)
  - `comments`: z.array(z.string().max(500))
  - `averageScores`: 各フィールド z.number().min(0).max(5)

### オプション要件

- [ ] Firebase Emulatorでセキュリティルールのテスト実施
- [ ] Storage Rulesも同様にスキーマバリデーション追加（ファイルサイズ、MIME type）

## 受け入れ基準

- [ ] `defectBeans` コレクションへの不正なデータ書き込みが拒否されること（スキーマ違反）
- [ ] `_meta` コレクションへの書き込みが認証済みユーザーでも拒否されること
- [ ] Firebase Hostingから配信されるHTMLに Content-Security-Policy ヘッダーが含まれていること
- [ ] Cloud Functionsが不正な入力を受け取った際、zodバリデーションエラーが返されること
- [ ] 既存の正常な動作に影響がないこと（リグレッションなし）
- [ ] Lint エラー・warning がゼロであること
