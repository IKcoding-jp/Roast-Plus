# タスクリスト

**ステータス**: 未着手

---

## フェーズ1: Firestoreセキュリティルール強化

Firestoreルールの改善（最重要）。

- [ ] `firestore.rules` の `defectBeans` コレクションにスキーマバリデーション追加
  - 必須フィールド: `name`, `description`
  - 型チェック: `name`, `description`, `imagePath` (optional)
  - サイズ制限: `name` ≤ 100文字, `description` ≤ 500文字
- [ ] `firestore.rules` の `_meta` コレクションを read only に変更
- [ ] 既存コードで `_meta` コレクションへの書き込み操作がないか確認（grep検索）
- [ ] Firebaseルール変更を手動デプロイ（`firebase deploy --only firestore:rules`）
- [ ] 動作確認: Firebase Consoleから不正データ書き込み → 拒否されること
- [ ] 動作確認: アプリから正常データ書き込み → 成功すること

**見積もり時間**: 30分

---

## フェーズ2: Firebase Hosting CSPヘッダー追加

HTTPセキュリティヘッダーの追加。

- [ ] `firebase.json` の `headers` セクションにCSPヘッダーを追加
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  - `style-src 'self' 'unsafe-inline'`
  - `img-src 'self' data: https:`
  - `font-src 'self' data:`
  - `connect-src 'self' https://firebasestorage.googleapis.com ...`
  - `frame-ancestors 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
- [ ] JSONフォーマット確認（構文エラーなし）
- [ ] 動作確認（デプロイ後）: Chrome DevToolsでレスポンスヘッダー確認
- [ ] CSP違反がないか確認（Console警告チェック）

**見積もり時間**: 20分

---

## フェーズ3: Cloud Functions zodバリデーション導入

型安全な入力バリデーション。

- [ ] `functions/package.json` に `zod` を追加（`npm install zod --prefix functions`）
- [ ] `functions/src/ocr-schedule.ts` に zodスキーマ定義追加
  - `OcrRequestSchema`: `imageBase64` (string, min: 1, max: MAX_BASE64_LENGTH)
  - `safeParse` でバリデーション実行
  - バリデーションエラー時は `HttpsError('invalid-argument', ...)` をthrow
- [ ] `functions/src/tasting-analysis.ts` に zodスキーマ定義追加
  - `TastingAnalysisSchema`: `beanName`, `roastLevel`, `comments`, `averageScores`
  - `safeParse` でバリデーション実行
  - バリデーションエラー時は `HttpsError('invalid-argument', ...)` をthrow
- [ ] 既存のバリデーション処理を置き換え（`if (!data.beanName) ...` → zodに統一）
- [ ] `functions` ディレクトリで `npm run build` 確認（TypeScriptコンパイル成功）
- [ ] Cloud Functionsデプロイ（`firebase deploy --only functions`）
- [ ] 動作確認: 不正な入力でFunction呼び出し → zodエラーが返されること
- [ ] 動作確認: 正常な入力でFunction呼び出し → 成功すること

**見積もり時間**: 45分

---

## フェーズ4: 最終検証

全体の統合確認。

- [ ] Lint チェック（`npm run lint`）
- [ ] Build チェック（`npm run build`）
- [ ] 既存テスト実行（`npm run test`）
- [ ] Firebase全体デプロイ（`firebase deploy`）
- [ ] 本番環境での動作確認
  - 欠点豆登録（正常・異常データ）
  - OCR機能（正常・異常画像）
  - テイスティング分析（正常・異常入力）
- [ ] セキュリティヘッダー確認（Chrome DevTools）
- [ ] CSP違反がないか確認（Console警告）

**見積もり時間**: 30分

---

## 依存関係

```
フェーズ1（Firestoreルール）
  ↓（独立して実行可能）
フェーズ2（CSPヘッダー）
  ↓（独立して実行可能）
フェーズ3（Functionsバリデーション）
  ↓
フェーズ4（最終検証）
```

- フェーズ1〜3は独立しているため、並行作業可能
- フェーズ4は全フェーズ完了後に実施

---

## 見積もり合計

- **合計**: 約2時間（AIエージェント実行時間）
- **ユーザー確認時間**: 各フェーズ完了後の動作確認（約30分）
