# タスクリスト

**Issue**: #221
**作成日**: 2026-02-11

## フェーズ1: テスト環境構築

- [ ] `functions/` ディレクトリのpackage.json を確認
- [ ] vitest（または jest）のインストール（`npm install --save-dev vitest @vitest/ui`）
- [ ] `vitest.config.ts` を作成（Node.js環境、TypeScript対応）
- [ ] `functions/package.json` の `scripts` に `"test": "vitest"` を追加
- [ ] サンプルテストファイルを作成し、vitestが動作することを確認

## フェーズ2: analyzeTastingSession のテスト作成

- [ ] `functions/src/tasting-analysis.ts` のコードを確認
- [ ] `functions/src/tasting-analysis.test.ts` を作成
- [ ] Firebase Admin SDK のモック設定
- [ ] 正常系テストケース（有効な入力データ → 分析結果取得）
- [ ] 異常系テストケース（不正な入力 → エラーハンドリング）
- [ ] エッジケース（空データ、極端な値等）のテスト

## フェーズ3: ocrScheduleFromImage のテスト作成

- [ ] `functions/src/ocr-schedule.ts` のコードを確認
- [ ] `functions/src/ocr-schedule.test.ts` を作成
- [ ] Vertex AI APIのモック設定
- [ ] 正常系テストケース（画像URL → OCR結果取得）
- [ ] 異常系テストケース（不正な画像URL → エラーハンドリング）
- [ ] 画像フォーマット別テスト（JPEG/PNG）

## フェーズ4: helpers.ts のテスト作成

- [ ] `functions/src/helpers.ts` のヘルパー関数をリストアップ
- [ ] `functions/src/helpers.test.ts` を作成
- [ ] 各ヘルパー関数のユニットテスト（入力 → 期待される出力）
- [ ] エッジケース（null/undefined/空文字列等）のテスト

## フェーズ5: zod バリデーション導入

- [ ] `npm install zod` を実行（functions/配下）
- [ ] `functions/src/schemas.ts` を作成
- [ ] `analyzeTastingSession` の入力パラメータスキーマを定義
- [ ] `ocrScheduleFromImage` の入力パラメータスキーマを定義
- [ ] 既存の手動バリデーションを `schema.parse()` に置換
- [ ] バリデーションエラー時のエラーレスポンスを統一

## フェーズ6: CIパイプライン統合

- [ ] `.github/workflows/ci.yml` にCloud Functionsテストジョブを追加
- [ ] `working-directory: functions` で実行
- [ ] `npm test` でテストを実行
- [ ] カバレッジレポートを生成（オプション）
- [ ] CIでテストが正常に動作することを確認

## フェーズ7: 検証

- [ ] `cd functions && npm test` でローカルテストが全て通ることを確認
- [ ] Cloud Functionsのデプロイが正常に動作することを確認
- [ ] CIパイプラインでテストが実行されることを確認
- [ ] zodバリデーションが正しくエラーを返すことを確認
- [ ] `docs/steering/TECH_SPEC.md` にテスト方針を記載

## 依存関係

- フェーズ1 → フェーズ2〜4（テスト環境構築後にテスト作成）
- フェーズ2〜4は並行実行可能（各テストが独立）
- フェーズ5は並行実行可能（zodバリデーションは独立）
- フェーズ6はフェーズ1〜5完了後に実行（CIにテスト統合）
- フェーズ7は全フェーズ完了後に検証
