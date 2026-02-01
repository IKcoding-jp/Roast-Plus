---
name: git-workflow
description: Git操作とリリースの自動化。コンベンショナルコミット形式(日本語)でのコミットメッセージ生成、セマンティックバージョニング、変更履歴生成、デプロイ手順。commit、version、changelog、git、コミットメッセージ、deploy、release、build時に使用。
---

# Git Workflow スキル

## コミットメッセージ形式

```
<type>(<scope>): <日本語で50文字以内の説明>

<body: 変更点を箇条書き>

<footer: Closes #番号 等>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**タイプ:**

| タイプ | 用途 | 例 |
|--------|------|-----|
| `feat` | 新機能 | feat(auth): ログイン機能を追加 |
| `fix` | バグ修正 | fix(timer): タイマー停止問題を修正 |
| `refactor` | リファクタリング | refactor(utils): ヘルパー関数を整理 |
| `docs` | ドキュメント | docs(readme): セットアップ手順を追加 |
| `style` | コードスタイル | style: フォーマットを統一 |
| `perf` | パフォーマンス | perf(render): 描画速度を最適化 |
| `test` | テスト | test(api): APIテストを追加 |
| `chore` | ビルド・設定 | chore(deps): 依存関係を更新 |
| `ci` | CI/CD | ci(github): ワークフローを追加 |

**スコープ例:** コンポーネント名(`header`, `modal`)、機能名(`auth`, `timer`)、レイヤー名(`api`, `ui`)

## コミット手順

```bash
# 1. 変更確認
git diff --staged --stat && git diff --staged

# 2. コミット（複数行はHEREDOC使用）
git commit -m "$(cat <<'EOF'
fix(auth): ログインバリデーションを修正

- メールアドレスの正規表現を改善
- エラーメッセージ表示を追加

Closes #123

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## セマンティックバージョニング

`MAJOR.MINOR.PATCH` — package.jsonの`version`フィールドを更新。

| 変更種別 | バージョン | コマンド |
|----------|-----------|---------|
| 破壊的変更 | MAJOR | `npm version major` |
| 新機能 | MINOR | `npm version minor` |
| バグ修正 | PATCH | `npm version patch` |

## リリースノート形式

```markdown
# v0.6.0 (2026-02-01)

## 追加
- 新機能の説明

## 修正
- バグ修正の説明

## 変更
- 既存機能の変更
```

## デプロイ

**デプロイ前チェック:**
```bash
npm run lint && npm run build && npm run test
```

**Vercel:** `git push origin main` で自動デプロイ
**Firebase Hosting:** `npm run build && firebase deploy --only hosting`

## ルール

- コミットメッセージは**日本語**
- 1コミット = 1つの論理的変更
- mainブランチへの直接コミット禁止
- デプロイ前に必ずテスト実行
