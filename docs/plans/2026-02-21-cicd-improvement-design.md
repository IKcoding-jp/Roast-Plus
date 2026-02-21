# CI/CD 段階的強化 設計ドキュメント

**作成日**: 2026-02-21
**アプローチ**: 段階的強化（3フェーズ）
**制約**: GitHub Actions 無料プラン（月2,000分）

## 現状分析

### 既存CI/CD構成

| コンポーネント | 状態 |
|--------------|------|
| CI (`ci.yml`) | PR時に lint/test/e2e/build の4ジョブ並列 + CI Gate |
| CD (`firebase-hosting-merge.yml`) | マージ時に Firebase Hosting 自動デプロイ |
| ローカル | Husky + lint-staged (pre-commit ESLint) |
| ブランチ保護 | CI Gate 必須、enforce_admins有効、force push禁止 |

### 課題

1. 4ジョブ全てで `npm ci` を重複実行（~4分のオーバーヘッド）
2. 品質チェック（complexity, deadcode, security）がCIに未統合
3. Cloud Functionsのデプロイが手動
4. PRプレビューデプロイなし
5. カバレッジレポートがPRに未公開

## Phase 1: パフォーマンス最適化

### 目的

`npm ci` の重複実行を排除し、CI実行時間を短縮する。

### 設計

```
install (1ジョブ)
  └── npm ci + node_modules をアーティファクトとして保存
        ├── lint (node_modules を復元)
        ├── test (node_modules を復元)
        ├── e2e (node_modules を復元 + Playwright browsers キャッシュ)
        └── build (node_modules を復元)
              └── ci-gate (全ジョブ通過チェック)
```

### 技術仕様

- `actions/upload-artifact` / `download-artifact` で `node_modules` を共有
- Playwright ブラウザは `actions/cache` で `~/.cache/ms-playwright` をキャッシュ
- `setup-node` の `cache: npm` は引き続き使用（npm registry キャッシュ）

### 効果見積もり

- 現状: `npm ci` × 4 = ~4分のオーバーヘッド
- 改善後: `npm ci` × 1 + アーティファクト復元 × 4 = ~1.5分
- **PR1回あたり約2.5分の節約**

## Phase 2: 品質チェック統合

### 目的

手動実行している品質チェックをCIに統合し、コード品質を自動監視する。

### 追加チェック

| チェック | コマンド | CI結果 |
|---------|---------|--------|
| カバレッジレポート | `vitest run --coverage` | PRコメントに報告。75%未満で**警告** |
| 循環的複雑度 | `lizard` (CCN 15超) | **エラー** |
| デッドコード | `knip` | **警告**（情報提供） |
| セキュリティ | `npm audit` | high/critical は**エラー**、moderate以下は**警告** |

### ジョブ配置

```
install
  ├── lint
  ├── test ──→ カバレッジレポートをPRコメントに投稿
  ├── e2e
  ├── build
  └── quality (新規ジョブ)
        ├── complexity
        ├── deadcode
        └── security
  └── ci-gate (lint + test + e2e + build が必須)
```

### 注意点

- `quality` ジョブは初期段階では ci-gate に**含めない**（既存コードで失敗する可能性）
- チーム慣熟後に ci-gate 必須化を検討

## Phase 3: デプロイ強化

### 3a. PRプレビューデプロイ

PR作成/更新時に Firebase Hosting Preview Channel へ自動デプロイ。

- `FirebaseExtended/action-hosting-deploy@v0` を使用
- PRコメントにプレビューURLを自動投稿
- PRクローズ後7日でチャネル自動削除

### 3b. Cloud Functions 自動デプロイ

mainマージ時、`functions/` 配下に変更があった場合のみ自動デプロイ。

- `paths` フィルターで `functions/**` の変更を検知
- `firebase deploy --only functions` を実行
- Hostingデプロイとは独立ジョブ

### 3c. デプロイ後ヘルスチェック

本番デプロイ後にメインページの疎通確認を実行。

```bash
curl -f https://roastplus-72fa6.web.app/ || exit 1
```

## ワークフロー最終形

### PR時 (ci.yml)

```
install
  ├── lint
  ├── test (+ coverage report)
  ├── e2e
  ├── build
  │     └── preview-deploy (Firebase Preview Channel)
  └── quality
  └── ci-gate (lint + test + e2e + build 必須)
```

### マージ時 (firebase-hosting-merge.yml)

```
build_and_deploy (Hosting)
  └── health-check
functions_deploy (functions/ 変更時のみ)
```

## 実装順序

1. Phase 1 → PR作成・マージ・検証
2. Phase 2 → PR作成・マージ・検証
3. Phase 3 → PR作成・マージ・検証

各フェーズは独立したPRで実装し、段階的に統合する。
