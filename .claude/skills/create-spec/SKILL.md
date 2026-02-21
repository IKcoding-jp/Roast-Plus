---
name: create-spec
description: 【手動用】既存IssueからWorking Documentsを生成。通常は /issue-creator で自動生成されるため、手動実行が必要な場合（古いIssue、外部で作成されたIssue等）に使用。「/create-spec 123」のように使用。
---

# Working Documents手動生成スキル

**通常は `/issue-creator` でIssue作成と同時にWorking Documentsが生成される。**
このスキルは以下の場合に手動で使用:
- 古いIssue（Working Documentsがない）
- 外部で作成されたIssue（GitHub Web等）
- `/issue-creator` を使わずに作成されたIssue

## ワークフロー

```
1. Issue取得 → 2. Steering参照 → 3. コード調査 → 4. Working生成 → 5. ユーザー確認
```

---

## Phase 1: Issue情報取得

```bash
gh issue view $ARGUMENTS --json title,body,labels,number,assignees
```

抽出する情報: Issue番号、タイトル、本文（要件・背景・作業内容）、ラベル

---

## Phase 2: Steering Documents参照

Working Documents生成前に以下を読み込み、Issueの文脈をプロジェクト全体で理解する:

1. `docs/steering/PRODUCT.md`（プロダクトビジョン）
2. `docs/steering/FEATURES.md`（関連機能の仕様確認）
3. `docs/steering/UBIQUITOUS_LANGUAGE.md`（用語統一）
4. `docs/steering/GUIDELINES.md`（実装パターン）

---

## Phase 3: コード調査（Serena MCP）

関連コードをSerena MCPで**探索のみ**実行（編集は使用禁止）:

1. `search_for_pattern` — Issueのキーワードで関連コード検索
2. `get_symbols_overview` — 関連ファイルの構造把握
3. `find_symbol` — 修正対象の具体的な実装確認
4. `find_referencing_symbols` — 影響範囲の依存関係追跡

### 調査深度の目安

| Issueタイプ | 深度 | 理由 |
|------------|------|------|
| bug / refactor | 詳細 | 根本原因・影響範囲の完全把握が必須 |
| feat / enhancement | 中程度 | 既存パターンの参照が主 |
| docs / chore | 軽微 | コード調査は最小限 |

---

## Phase 4: Working Documents生成

### ディレクトリ作成

```
docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/
```

- `YYYYMMDD`: 生成日（ソート用）
- `Issue番号`: GitHub Issue番号
- `タイトル`: 日本語可、50文字以内

### 生成ファイル

タスクタイプに応じて以下を生成。テンプレートは **[working-templates.md](references/working-templates.md)** を参照。

| ファイル | 内容 | 生成元 |
|---------|------|--------|
| **requirement.md**（必須） | 要件定義・受け入れ基準 | Issue本文 + FEATURES.md |
| **tasklist.md**（必須） | フェーズ別タスク・依存関係 | design.mdの変更対象 + GUIDELINES.md |
| **design.md**（中〜大規模） | 実装方針・変更ファイル・影響範囲 | Serena調査結果 + TECH_SPEC.md |
| **testing.md**（中〜大規模） | テストケース・カバレッジ目標 | tasklist.md + GUIDELINES.md |

### 生成ロジック

- Phase 2のSteering参照 + Phase 3のコード調査結果を統合して生成
- AIが80%ドラフト生成、ユーザーが確認・修正
- 不要なセクションは省略可（例: Firestore不使用ならデータモデル省略）

---

## Phase 5: ユーザー確認

生成されたWorking Documentsを提示し、以下を確認:

1. **requirement.md**: 要件が正しく理解されているか
2. **design.md**: 実装方針が適切か
3. **tasklist.md**: タスク分割・見積もりが妥当か
4. **testing.md**: テスト計画が十分か

修正依頼があれば該当ファイルを修正 → 再度確認。OKなら完了。

---

## 注意事項

- **Serena MCPは探索のみ**: 編集ツール（`replace_symbol_body`, `insert_*`, `rename_symbol`）は使用禁止。編集はClaude Code標準ツール（Edit/Write）を使用
- **Working DocumentsはGit保管**: PR完了後も削除しない（過去の設計判断の記録）
- **EnterPlanModeとの併用推奨**: Working = 永続的設計メモ、Plan = 一時的詳細計画
