# タスク: スケジュールOCRのAPIキーエラー修正

## 概要
本日（2026-01-18T10:30）確認された、スケジュール読み取り（OCR）機能における「OpenAI APIキーが無効です」というエラーを修正します。

## 課題
- [x] Firebase Functions がルートの `.env.local` にある `OPENAI_API_KEY` を認識できていない。
- [x] `functions/src/index.ts` 内で存在しないモデル名 `gpt-5.1` が使用されており、APIリクエストが失敗している可能性がある。（※ソースは修正済みだったがビルドされていなかった）
- [x] `GOOGLE_VISION_API_KEY` が設定ファイルに含まれていない可能性がある。

- [x] `functions/src/index.ts` から Google Vision API の依存（import, secret, client生成）を削除。
- [x] OCR処理を Google Vision API から OpenAI GPT-4o Vision に置き換え。
- [x] `formatScheduleWithGPT` が画像データを受け取り、画像を解析するプロンプトを使用するように変更。
- [x] `npm run build` が成功することを確認。
- [x] 不要になった `@google-cloud/vision` パッケージを削除。
