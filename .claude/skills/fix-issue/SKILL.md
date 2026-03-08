---
name: fix-issue
description: GitHub Issueを自動解決するワークフロー。Issue確認→Working Documents読み込み→Issue説明+計画（自動）→実装（TDD）→検証（lint/build/unit）→コードレビュー（AI自動判断・PR前）→E2Eテスト全実行→PR作成→Steering更新（自動）→即マージまで一気通貫。確認ポイントなし・全自動実行。Issue番号を引数に取る（例: /fix-issue 123）。トピックブランチ必須、main直接コミット禁止。
---

# Issue自動解決スキル

## ワークフロー概要

```
Issue確認 → Working読込 → 説明+計画 → 実装(TDD) → 検証(lint/build/unit) → コードレビュー(AI判断) → E2Eテスト → PR作成 → Steering更新 → 即マージ → クリーンアップ
```

⚠️ **確認ポイントなし。全フェーズ自動実行。完了時に結果のみ報告。**

---

⚠️ **superpowers排他制御**: fix-issue実行中は `test-driven-development`（Phase 4で明示呼出）と `systematic-debugging`（必要時）のみ使用。`using-superpowers`の「1%ルール」は適用しない。

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

AskUserQuestionで提示:
1. **今ここで Working Documents を生成する（推奨）** → Phase 2.4へ
2. **Working なしで続行（探索フェーズを実行）** → Phase 2.5へ

---

## Phase 2.4: Working Documents生成（既存Issue用）

1. Issue本文読み込み（Phase 1取得済み）
2. Serena MCPで関連コード調査: `search_for_pattern → get_symbols_overview → find_symbol`
3. `docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/` を作成・生成

---

## Phase 2.5: コード探索（Working Documentsがない場合のみ）

```
search_for_pattern → get_symbols_overview → find_symbol → find_referencing_symbols
```

---

## リファレンスドキュメント

- **[error-patterns.md](references/error-patterns.md)** - よくあるエラーパターン
- **[issue-resolution-history.md](references/issue-resolution-history.md)** - 過去の解決記録
- **[changelog-guide.md](references/changelog-guide.md)** - changelog更新ガイド（Phase 8 Step 0で参照）

---

## Phase 3: Issue説明 + 計画（自動・確認なし）

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

tasklist.mdのフェーズ・タスクに沿った実装計画を提示。**確認不要、即Phase 4へ進む。**

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

Taskツールで調査エージェントを起動:
1. 影響コンポーネントのデータフロー追跡（Serena MCP）
2. 関連変数・条件分岐を列挙（証拠となるコードの場所を引用）
3. 根本原因の仮説を2〜3個提示
4. 推奨修正アプローチを1つ選択

⚠️ **調査結果を確認してから実装。推測で実装しない。**

### Context7 MCPでドキュメント確認

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

### ⚠️ 緊急ロールバック

```bash
git stash              # 変更を一時退避
git reset --hard HEAD  # 最後のコミットに戻す
```

---

## Phase 5: 検証1（自動ループ）

```bash
npm run lint && npm run build && npm run test:run
```

- Lintエラー: `npm run lint -- --fix` → 手動修正（[error-patterns.md](references/error-patterns.md) 参照）
- ビルドエラー: エラー確認 → 関連ファイル修正 → 再ビルド
- テスト失敗: モック・前提条件確認 → 実装ロジック見直し

⚠️ **5回以上ループして解消しない場合は `systematic-debugging` を呼び出す。**

---

## Phase 6: コードレビュー（AI自動判断・PR前）

**AIが以下の基準でレビュー要否を自動判断する。確認不要。**

### レビュー実施する場合（いずれかに該当）

- 変更ファイルが5以上
- 新機能・新コンポーネントの追加
- セキュリティ・認証・Firestore Rules関連
- アーキテクチャ変更・依存関係追加

→ Skillツールで `code-review:code-review` を呼び出す
→ 信頼度スコア80以上の問題を修正 → 修正後は Phase 5（検証1）へ戻る

### スキップする場合（以下のみの変更）

- docs変更のみ / typo修正
- CSS/スタイル調整のみ
- 設定ファイルのみ（非セキュリティ）
- 1〜2ファイルの軽微な変更

→ スキップ理由を記録してPhase 7へ

---

## Phase 7: E2Eテスト（全実行・自動ループ）

```bash
npm run test:e2e
```

- 全テストスイートを実行
- 失敗時: 原因特定 → 修正 → 再実行（ループ）
- **5回以上ループして解消しない場合は `systematic-debugging` を呼び出す。**
- 全通後Phase 8へ

---

## Phase 8: コミット・PR作成

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
- [x] lint / build / unit test 通過
- [x] E2Eテスト通過
- [x] コードレビュー（AI自動判断）

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

## Phase 9: Steering Documents更新（自動・確認なし）

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

## Phase 10: 最終更新・即マージ・クリーンアップ（全自動）

### 1. Working Documents最終更新

```markdown
**ステータス**: ✅ 完了
**完了日**: YYYY-MM-DD
```

### 2. Steering/Working更新のコミット・プッシュ（Phase 9で更新があった場合）

```bash
git add docs/
git commit -m "docs(#<Issue番号>): Steering/Working Documents更新"
git push
```

### 3. 即マージ（ローカル検証済み・CI待ちなし）

```bash
gh pr merge --merge --delete-branch
```

⚠️ **`--auto` は不使用。lint/build/unit/E2Eはローカルで完了済み。**
⚠️ **`--delete-branch` がローカル・リモートブランチのクリーンアップとmainへの切り替えを自動実行する。**

---

## 完了

```
✅ Issue #番号 を解決しました

📋 実施内容:
- [変更の概要]

🔍 コードレビュー: [実施（X件修正） / スキップ（理由）]
🧪 E2Eテスト: ✅ 全通
🔀 PR: #番号 → マージ完了 ✅
🧹 ブランチクリーンアップ完了

📝 Steering Documents:
- FEATURES.md: [✏️更新済 / ✅変更なし（理由）]
- TECH_SPEC.md: [✏️更新済 / ✅変更なし（理由）]
- GUIDELINES.md: [✏️更新済 / ✅変更なし（理由）]
- REPOSITORY.md: [✏️更新済 / ✅変更なし（理由）]
- UBIQUITOUS_LANGUAGE.md: [✏️更新済 / ✅変更なし（理由）]
- PRODUCT.md: [✏️更新済 / ✅変更なし（理由）]
```
