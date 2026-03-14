---
name: fix-issue
description: Issue番号を引数に受け取り（例: /fix-issue 123）、Working Documents読み込み→実装（TDD）→PR作成→CI通過確認→即マージまで全自動実行するワークフロー。Phase 3終了時のみ確認あり。トピックブランチ必須、main直接コミット禁止。
---

# Issue自動解決スキル

## ワークフロー概要

```
Issue確認 → Working読込 → 説明+計画+確認 → 実装(TDD) → ローカル検証 → コミット・PR作成 → Steering更新 → CI確認・即マージ
```

⚠️ **Phase 3終了時のみ確認あり。それ以外は全自動実行。**

---

⚠️ **superpowers排他制御**: fix-issue実行中は `test-driven-development`（Phase 4で明示呼出）と `systematic-debugging`（必要時）のみ使用。`using-superpowers`の「1%ルール」は適用しない。

---

## リファレンスドキュメント

- **[error-patterns.md](references/error-patterns.md)** - よくあるエラーパターン
- **[issue-resolution-history.md](references/issue-resolution-history.md)** - 過去の解決記録
- **[changelog-guide.md](references/changelog-guide.md)** - changelog更新ガイド（Phase 5 Step 0で参照）

---

## Phase 1: Issue確認

```bash
gh issue view $ARGUMENTS --json title,body,labels,number,assignees
```

---

## Phase 2: Working Documents読み込み

### 2.1 Working Documents検索

```bash
ls -d docs/working/*_${ISSUE_NUMBER}_* 2>/dev/null || echo "Not found"
```

### 2.2 存在する場合

以下を読み込む:

```
docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/
├── requirement.md  # 要件定義
├── tasklist.md     # タスクリスト
├── design.md       # 設計書
└── testing.md      # テスト計画
```

⚠️ **Working Documentsがあれば、コード探索は不要。**

### 2.3 存在しない場合

自動でPhase 2.4へ進む。

---

## Phase 2.4: Working Documents生成（既存Issue用）

1. Issue本文読み込み（Phase 1取得済み）
2. Serena MCPで関連コード調査: `search_for_pattern → get_symbols_overview → find_symbol`
3. `docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/` を作成・生成

---

## Phase 3: Issue説明 + 計画

### `/issue-creator` 直後の場合

要点のみ（背景・根本原因省略）:
- **修正の方針**と**懸念点・リスク**を簡潔に提示

### 通常の場合

1. **問題の背景** - なぜこのIssueが作られたのか
2. **根本原因** - 技術的に何が起きているのか
3. **修正の方針** - どのように直すのか
4. **懸念点・リスク** - 考慮すべき影響

**説明スタイル:** ⚠️ **コードは提示しない**（ファイル名・関数名はOK）

### 計画提示

tasklist.mdのフェーズ・タスクに沿った実装計画を提示。

### ⚠️ 確認（唯一の確認ポイント）

AskUserQuestionで提示:
1. **進める** → Phase 4へ
2. **方針を変更して再提示** → Phase 3を再実行
3. **キャンセル** → 終了

---

## Phase 4: 実装

### ブランチ作成（必須）

⚠️ **mainブランチへの直接コミット禁止**

```bash
git checkout -b fix/#番号-説明    # bug/bugfixラベル
git checkout -b feat/#番号-説明   # enhancement/featureラベル
git checkout -b test/#番号-説明   # testingラベル
```

### 事前調査（Bugラベルの場合のみ）

Serena MCPで直接調査:
1. 影響コンポーネントのデータフロー追跡（`search_for_pattern → find_symbol → find_referencing_symbols`）
2. 根本原因の仮説を2〜3個提示
3. 推奨修正アプローチを1つ選択

⚠️ **調査結果を確認してから実装。推測で実装しない。**

### Context7 MCPでドキュメント確認（条件付き）

新規ライブラリ使用・バージョン不明な場合のみ:

```
resolve-library-id → query-docs
```

### 実装実行（TDD必須）

**`superpowers:test-driven-development` スキルを Skill ツールで明示呼出。**

#### TDD対象の場合（lib/, hooks/, components/のロジック, バグ修正）

```
1. Skill ツールで superpowers:test-driven-development を呼び出す
2. testing.md を読み込み → テスト設計のインプット
3. 🔴 Red: 失敗テストを作成 → コミット
4. 🟢 Green: テスト合格する最小実装 → コミット
5. 🔵 Refactor: テスト維持したまま改善（必要な場合のみ）
```

#### TDD対象外の場合（docs/, chore, ビジュアル調整のみ）

Claude Code標準ツール（Edit/Write）で実装。

**⚠️ tasklist.mdを逐次更新**: 完了したタスクは `[x]` に変更。

---

## Phase 5: ローカル検証（自動ループ）

```bash
npm run build && npm run test:run
```

- lintはpre-commitフック（Husky）が担当するため不要
- ビルドエラー: エラー確認 → 関連ファイル修正 → 再実行
- テスト失敗: モック・前提条件確認 → 実装ロジック見直し → 再実行

⚠️ **5回以上ループして解消しない場合は `systematic-debugging` を呼び出す。**

---

## Phase 6: コミット・PR作成

### Step 0: changelog更新（詳細: [changelog-guide.md](references/changelog-guide.md)）


- `feat/*` → minor バンプ / `fix/*`, `style/*` → patch / それ以外はスキップ
- AI自動生成 → `package.json`, `version-history.ts`, `detailed-changelog.ts` 更新（確認不要）

### Step 1: コミット・プッシュ

まず `git status` で全変更を確認。

**① 実装外の変更がある場合（chore コミットを先に作成）**

```bash
git add <実装外の変更ファイル> package.json data/dev-stories/version-history.ts data/dev-stories/detailed-changelog.ts
git commit -m "chore(#<Issue番号>): <説明>"
```

対象例: `.claude/skills/`, `.gitignore`, `CLAUDE.md`, `docs/steering/`, `docs/working/`, changelog更新ファイル

**② 実装コミット**

```bash
git add <実装の変更ファイル>
git commit -m "<type>(#<Issue番号>): <説明>"
git push -u origin $(git branch --show-current)
```

⚠️ **両方のコミットを同じPR（同じブランチ）に含める。**

### Step 2: PR作成

```bash
# ⚠️ 一時ファイルはリポジトリルートに相対パスで作成（Windows互換）
cat > .tmp-pr-body.md <<'PREOF'
## 概要
Issue #番号 を解決。

## 変更内容
- 変更点1
- 変更点2

## 検証
- [x] GitHub Actions CI（lint / build / unit test / E2E）
- [x] コードレビュー（claude-code-review.yml）

Closes #番号
PREOF

gh pr create --base main --title "<type>(#<Issue番号>): <タイトル>" --body-file .tmp-pr-body.md

rm -f .tmp-pr-body.md
```

### ⚠️ Push/PR失敗時の対応

| 問題 | 対処 |
|-----|------|
| push失敗 | `git push --set-upstream origin $(git branch --show-current)` |
| PR作成失敗 | `.tmp-pr-body.md` 残存確認 → `rm -f` → 再実行 |
| コンフリクト | `git fetch origin main && git rebase origin/main` → `git push --force-with-lease` |

---

## Phase 7: Steering Documents更新（自動・確認なし）

**全6ドキュメントを確認し、変更があれば自動更新する。**

| # | ドキュメント | チェック観点 |
|---|-------------|-------------|
| 1 | **FEATURES.md** | 機能追加・変更・削除、UI実装ルール |
| 2 | **TECH_SPEC.md** | 技術スタック変更、テスト数・カバレッジ |
| 3 | **GUIDELINES.md** | 実装パターン変更 |
| 4 | **REPOSITORY.md** | ファイル追加・削除・移動 |
| 5 | **UBIQUITOUS_LANGUAGE.md** | 新規ドメイン用語 |
| 6 | **PRODUCT.md** | バージョン更新、テスト数更新 |

更新があれば自動実行し、結果を最終報告に含める。

---

## Phase 8: CI確認・即マージ・クリーンアップ（全自動）

### 1. Working Documents最終更新

```markdown
**ステータス**: ✅ 完了
**完了日**: YYYY-MM-DD
```

### 2. Steering/Working更新のコミット・プッシュ（Phase 7で更新があった場合）

```bash
git add docs/
git commit -m "docs(#<Issue番号>): Steering/Working Documents更新"
git push
```

### 3. CI確認・待機

```bash
gh pr checks --watch
```

- **全通**: Step 4へ
- **失敗**: PRにコメントして修正を依頼

```bash
gh pr comment --body "@claude CI が失敗しています。エラーを確認して修正してください。"
```

CI通過後、Step 4へ。

### 4. 即マージ

```bash
gh pr merge --merge --delete-branch
```

### 5. 完了確認

```bash
gh pr view --json state,mergedAt,headRefName
```

---

## 完了

```
✅ Issue #番号 を解決しました

📋 実施内容:
- [変更の概要]

🔀 PR: #番号
🔬 CI: ✅ 全通 / ❌ 失敗→@claude修正後通過
🔀 マージ: ✅ 完了（main）
🧹 ブランチ: 削除済み

📝 Steering Documents:
- FEATURES.md: [✏️更新済 / ✅変更なし（理由）]
- TECH_SPEC.md: [✏️更新済 / ✅変更なし（理由）]
- GUIDELINES.md: [✏️更新済 / ✅変更なし（理由）]
- REPOSITORY.md: [✏️更新済 / ✅変更なし（理由）]
- UBIQUITOUS_LANGUAGE.md: [✏️更新済 / ✅変更なし（理由）]
- PRODUCT.md: [✏️更新済 / ✅変更なし（理由）]
```
