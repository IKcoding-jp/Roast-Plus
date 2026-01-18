# 実装計画 - スケジュールOCRのOpenAI Vision移行

## 1. 概要
ユーザーの要望により、スケジュール画像のOCR処理から Google Vision API を排除し、OpenAI API (GPT-4o Vision) だけで完結するように変更する。
これにより、Google Vision API Key が不要となり、構成がシンプルになる。

## 2. 変更内容
### `functions/src/index.ts` の修正

#### 現状のフロー
1. Base64画像を受け取る
2. Google Vision API でテキスト抽出 (`textDetection`)
3. 抽出されたテキストを `formatScheduleWithGPT` に渡す
4. GPT-4o がテキストを解析してJSONを返す

#### 新しいフロー
1. Base64画像を受け取る
2. `formatScheduleWithGPT` に画像データ（Base64）を直接渡す
3. GPT-4o に画像とプロンプトを送信し、画像解析とJSON生成を一度に行わせる

### 詳細な変更点
1. **Google Vision API 関連の削除**:
   - `import { ImageAnnotatorClient } ...` を削除。
   - `secrets` 配列から `GOOGLE_VISION_API_KEY` を削除。
   - `getVisionErrorMessage` などの関連ヘルパー関数を削除（または不要部分を削除）。

2. **OCRロジックの変更**:
   - `ocrScheduleFromImage` 関数内の Vision API 呼び出し部分を削除。
   - `formatScheduleWithGPT` の引数を `ocrText: string` から `imageBase64: string` に変更。
   - `formatScheduleWithGPT` 内で `openai.chat.completions.create` を呼ぶ際、messages に画像コンテンツを含めるように変更。

3. **プロンプトの調整**:
   - 「以下のテキストを解析し」から「以下の画像を解析し」に変更。
   - 入力として `image_url` (data uri) を指定。

## 3. 実装ステップ
1. `functions/package.json` から `@google-cloud/vision` を削除（後回しでも可だが、クリーンにする）。
2. `functions/src/index.ts` を修正して Vision API 依存を排除し、GPT-4o Vision への直接リクエストに書き換える。
3. `functions/src/index.ts` の `formatScheduleWithGPT` を改名するか、シグネチャを変更して画像を受け付けるようにする。
4. ビルドして整合性を確認する。

## 4. 注意事項
- OpenAI の Vision 機能は画像サイズや解像度によってトークン消費が変わるが、現在のホワイトボード画像程度なら問題ないはず。
- タイムアウト設定は既に長め（300秒）になっているので、Vision処理を含めても十分と思われる。
- `MAX_BASE64_LENGTH` のチェックは OpenAI の制限やメモリ保護の観点から維持する。

