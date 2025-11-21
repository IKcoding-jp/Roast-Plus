# ビルドとデプロイ

## 開発環境

### 開発サーバー
- `npm run dev` で開発サーバー起動（ポート3000）
- 通常のNext.js開発モードを使用
- 開発環境では通常のNext.jsサーバーとして動作（動的ルートが正常に動作する）

## 本番環境

### 静的エクスポート
- `npm run build` で静的エクスポートを生成
- **静的エクスポートの有効化**: `next.config.ts` で本番環境（`NODE_ENV === 'production'`）でのみ `output: 'export'` が有効化される
- 開発環境では通常のNext.jsサーバーとして動作（動的ルートが正常に動作する）
- 画像は `unoptimized: true` で最適化を無効化（静的エクスポートの制約）
- ビルド出力は `out/` ディレクトリに生成される

### アプリバージョン
- アプリバージョンは `package.json` の `version` フィールドで管理
- `NEXT_PUBLIC_APP_VERSION` 環境変数として設定
- バージョン更新時は `useAppVersion` フックで通知を表示
- バージョン更新通知は `VersionUpdateModal` コンポーネントで表示

## Firebase Hosting

### デプロイ先
- **デプロイ先**: Firebase Hosting
- **設定ファイル**: `firebase.json` の `hosting` セクションで設定
- **公開ディレクトリ**: `out/`（Next.jsの静的エクスポート出力先）
- **SPAルーティング**: `rewrites` で全てのリクエストを `/index.html` にリダイレクト
- **デプロイコマンド**: `firebase deploy --only hosting`（プロジェクトルートから実行）

### キャッシュ戦略
- **HTMLファイル**: キャッシュ無効化
- **静的アセット（JS/CSS/画像など）**: 長期キャッシュ（max-age=31536000, immutable）
- **フォントファイル**: woff2、woff、ttfファイルに適切なContent-Typeヘッダーを設定

### Web Manifest
- **webmanifest**: `.webmanifest` ファイルに適切なContent-Typeヘッダーを設定

## PWA 挙動

### Service Worker
- Service Workerは本番環境でのみ有効化（`process.env.NODE_ENV === 'production'`）
- Web App Manifest（`site.webmanifest`）でPWA設定を管理
- オフライン時の動作を考慮した実装

### オフライン対応
- Service Workerにより、オフライン時も基本的な機能が利用可能
- Firestoreのオフラインキャッシュを活用
- ネットワーク接続が不安定な環境でも動作

## 本番と開発環境での挙動の違い

### 開発環境
- 通常のNext.jsサーバーとして動作
- 動的ルートが正常に動作する
- Service Workerは無効化

### 本番環境
- 静的エクスポートとして動作
- 全てのリクエストが `/index.html` にリダイレクト（SPAルーティング）
- Service Workerが有効化
- 画像の最適化が無効化（`unoptimized: true`）

