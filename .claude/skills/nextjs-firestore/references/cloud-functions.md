# Cloud Functions パターン（RoastPlus実装）

## 目次

1. [アーキテクチャ](#アーキテクチャ)
2. [クライアント側（httpsCallable）](#クライアント側httpsCallable)
3. [サーバー側（onCall）](#サーバー側oncall)
4. [エラーハンドリング](#エラーハンドリング)

---

## アーキテクチャ

```
クライアント                          Cloud Functions v2
httpsCallable<Req, Res>()    →    onCall({ secrets, cors, ... })
  ├── 自動認証トークン付与              ├── request.auth で認証チェック
  ├── 型安全な引数                     ├── request.data でデータ受け取り
  └── result.data で結果取得           └── OpenAI API 呼び出し
```

**制約**: `output: 'export'` のためNext.js API Routes使用不可。サーバー処理は全てCloud Functions経由。

---

## クライアント側（httpsCallable）

```typescript
// lib/scheduleOCR.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// 型パラメータで入出力を型安全に
const ocrScheduleFromImage = httpsCallable<
  { imageBase64: string },
  { timeLabels: TimeLabel[]; roastSchedules: RoastSchedule[] }
>(functions, 'ocrScheduleFromImage');

export async function extractScheduleFromImage(
  imageFile: File,
  selectedDate: string
) {
  const base64 = await fileToBase64(imageFile);

  const result = await ocrScheduleFromImage({ imageBase64: base64 });

  return {
    timeLabels: result.data.timeLabels,
    roastSchedules: result.data.roastSchedules.map(schedule => ({
      ...schedule,
      date: selectedDate,
    })),
  };
}
```

### ポイント

- `httpsCallable<RequestType, ResponseType>` で型安全
- Firebase SDKが自動的に認証トークンを付与
- 結果は `result.data` で取得

---

## サーバー側（onCall）

```typescript
// functions/src/ocr-schedule.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import OpenAI from 'openai';

export const ocrScheduleFromImage = onCall(
  {
    cors: ['https://roastplus-72fa6.web.app'],  // CORS設定
    maxInstances: 10,      // 最大同時実行数
    timeoutSeconds: 300,   // タイムアウト（OCRは長め）
    memory: '512MiB',      // メモリ割り当て
    secrets: ['OPENAI_API_KEY'],  // Secret Manager から注入
  },
  async (request) => {
    // 認証チェック（必須）
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '認証が必要です');
    }

    const { imageBase64 } = request.data;

    // バリデーション
    if (!imageBase64 || imageBase64.length > MAX_BASE64_LENGTH) {
      throw new HttpsError('invalid-argument', '画像データが不正です');
    }

    // OpenAI GPT-4o Vision で処理
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content!);
  }
);
```

### テイスティング分析

```typescript
// functions/src/tasting-analysis.ts
export const analyzeTastingSession = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: ['OPENAI_API_KEY'],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', '認証が必要です');
    }

    const data = request.data as TastingAnalysisRequest;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000 });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: TASTING_SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(data) },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return { status: 'success', text: response.choices[0].message.content };
  }
);
```

---

## エラーハンドリング

### クライアント側

```typescript
try {
  const result = await ocrScheduleFromImage({ imageBase64 });
  return result.data;
} catch (error) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'functions/unauthenticated':
        // 再ログインを促す
        break;
      case 'functions/resource-exhausted':
        // レート制限 → リトライ
        break;
      case 'functions/not-found':
        throw new Error('Cloud Functionsが見つかりません。デプロイを確認してください');
      case 'functions/deadline-exceeded':
        throw new Error('処理がタイムアウトしました。画像を小さくして再試行してください');
      default:
        throw new Error(`エラーが発生しました: ${error.message}`);
    }
  }
}
```

### サーバー側

```typescript
// HttpsError で構造化エラーを返す
throw new HttpsError('invalid-argument', 'メッセージ', { details: '追加情報' });

// 主要なエラーコード:
// 'unauthenticated' - 認証なし
// 'permission-denied' - 権限不足
// 'invalid-argument' - 引数不正
// 'not-found' - リソース未発見
// 'resource-exhausted' - レート制限
// 'internal' - サーバー内部エラー
```

### Secrets管理

```bash
# Secret Managerにキーを設定
firebase functions:secrets:set OPENAI_API_KEY

# ローカル開発時は .secret.local ファイル
echo "OPENAI_API_KEY=sk-..." > functions/.secret.local
```

`secrets: ['OPENAI_API_KEY']` で宣言すると、Cloud Functions実行時に `process.env.OPENAI_API_KEY` として自動注入。クライアントにAPIキーは露出しない。
