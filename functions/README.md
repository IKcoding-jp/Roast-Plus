# Firebase Functions

## 環境変数の設定

Firebase Functionsで使用する環境変数を設定するには、以下のコマンドを実行してください：

```bash
# Google Vision APIキーを設定
firebase functions:config:set google.vision_api_key="YOUR_GOOGLE_VISION_API_KEY"

# OpenAI APIキーを設定
firebase functions:config:set openai.api_key="YOUR_OPENAI_API_KEY"

# 設定を確認
firebase functions:config:get
```

## ローカル開発時の環境変数

ローカル開発時（エミュレーター使用時）は、`.env`ファイルを作成して環境変数を設定できます：

```bash
# functions/.env
GOOGLE_VISION_API_KEY=your_google_vision_api_key
OPENAI_API_KEY=your_openai_api_key
```

ただし、Firebase Functions v2以降では、環境変数は`functions/src/index.ts`で`process.env`から直接読み取ることができます。

## デプロイ

```bash
# Functionsをビルド
cd functions
npm install
npm run build

# デプロイ
firebase deploy --only functions
```

