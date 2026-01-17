# RoastPlus 詳細リファレンス

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router ページ
│   ├── (auth)/            # 認証関連ページ
│   ├── (main)/            # メインアプリページ
│   └── layout.tsx
├── components/            # Reactコンポーネント
│   ├── ui/               # 共通UIコンポーネント
│   ├── features/         # 機能別コンポーネント
│   └── layouts/          # レイアウトコンポーネント
├── lib/
│   ├── firebase/         # Firebase設定・ヘルパー
│   └── utils/            # ユーティリティ関数
├── types/                # TypeScript型定義
├── hooks/                # カスタムフック
└── constants/            # 定数定義

public/
├── sounds/               # 効果音ファイル
├── lottie/              # Lottieアニメーション
└── images/              # 画像アセット
```

## Firebase構成

### Firestore Collections
- `users/{userId}` - ユーザープロフィール
- `users/{userId}/roasts` - 焙煎記録
- `users/{userId}/brews` - 抽出記録
- `beans` - コーヒー豆マスタ

### Authentication
- Email/Password認証
- Google認証（予定）

## UI Design System

### カラーパレット
詳細は `.claude/skills/roastplus-ui/color-schemes.md` を参照

### コンポーネントパターン
詳細は `.claude/skills/roastplus-ui/components.md` を参照

## 開発ワークフロー

### ブランチ戦略
- `main` - 本番
- `develop` - 開発
- `feature/*` - 機能開発

### デプロイ
Firebase Hosting + Vercel

## トラブルシューティング

### よくあるエラー
1. Firebase初期化エラー → 環境変数確認
2. Hydrationエラー → `use client` ディレクティブ確認
3. 型エラー → `src/types/` の型定義確認
