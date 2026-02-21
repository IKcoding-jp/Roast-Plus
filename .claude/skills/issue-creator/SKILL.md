---
name: issue-creator
description: GitHub Issue作成スキル。ブレインストーミング→コードベース調査→影響範囲特定→gh issue create→Working Documents生成まで一気通貫。タスク規模に応じて調査深度とWorking生成を自動調整。使用タイミング: (1)「〜のIssueを作って」 (2)「〜を実装したい」 (3)「〜のバグを報告」 (4)「〜をリファクタしたい」 (5)「Issue作成」 (6)「〜の機能を追加したい」 (7)「〜を改善したい」
---

# Issue Creator

## ワークフロー

```
0. ブレインストーミング → 1. 作業内容理解+規模判定 → 2. コード調査(規模に応じて) → 3. Issue内容整理 → 4. ユーザー確認 → 5. Issue作成 → 6. Working Documents生成(規模に応じて)
```

⚠️ **このスキルではコード修正を行わない。調査とIssue作成とWorking生成のみ。**

---

## Phase 0: ブレインストーミング（必須）

**必ず `superpowers:brainstorming` スキルを Skill ツールで明示的に呼び出すこと。**

⚠️ **`using-superpowers`による自動発動には依存しない。** 本スキル内でbrainstormingを明示的に呼び出すため、using-superpowersの「1%ルール」による二重発動は不要。issue-creator実行中はbrainstormingの自動発動を抑制する。

ユーザーの意図・要件・設計を深掘りし、曖昧な要件を明確化してからPhase 1に進む。

### Phase 1 への引き継ぎ

ブレインストーミング完了後、以下を確定した状態で Phase 1 に進む:
- **何を実現したいか**（ユーザーの意図）
- **スコープ**（含む/含まない機能）
- **制約・前提条件**（技術的制約、既存機能との関係）

この確定内容が Issue 本文・Working Documents の基盤となる。

---

## Phase 1: 作業内容理解 + 規模判定

### タイプ判定

Issueタイプを判定: `bug` / `feat` / `refactor` / `docs` / `style` / `perf` / `chore` / `test`
不明点はユーザーに質問。

### 規模判定

タスクの規模を3段階で判定:

| 規模 | 基準 | 例 |
|------|------|-----|
| **小** | 1-2ファイル変更、単純な修正 | typo修正、設定変更、1関数の修正 |
| **中** | 3-5ファイル変更、機能の追加・修正 | コンポーネント追加、既存機能の改善 |
| **大** | 6ファイル以上、新機能、複雑なリファクタ | 新ページ作成、アーキテクチャ変更 |

⚠️ **規模判定に迷ったら「中」として扱う。**

---

## Phase 2: コード調査（規模に応じて調整）

### 大規模タスク → 詳細調査

- `find_symbol` / `search_for_pattern` で関連コード特定
- `get_symbols_overview` で構造把握
- `find_referencing_symbols` で影響範囲確認

⚠️ **この調査結果はWorking Documents生成に流用されるため、しっかり行う。**

### 中規模タスク → 標準調査

- `search_for_pattern` で関連コード特定
- `get_symbols_overview` で変更対象ファイルの構造把握

### 小規模タスク → 軽微調査 or 省略

- 対象ファイルが明確な場合は調査省略可
- 不明な場合のみ `search_for_pattern` で軽く確認

---

## Phase 3: Issue本文作成

```markdown
## 概要
[何をするか - 1-2文]

## 理由/背景
[なぜ必要か]

## 対象箇所
- `path/to/file.ts:行番号` - 関数/コンポーネント名

## 作業内容
- [ ] タスク1
- [ ] タスク2

## 影響範囲
- 関連コンポーネント・依存関係
```

⚠️ **小規模タスクでは「対象箇所」「影響範囲」は省略可。**

---

## Phase 4: ユーザー確認 🔹確認ポイント

Issue本文を提示し、以下を確認:
- 内容が正しいか
- 規模判定が妥当か
- Working Documents生成の有無（AIの判断を提示）

---

## Phase 5: Issue作成

```bash
cat > /tmp/issue_body.md <<'EOF'
[Issue本文]
EOF

gh issue create --title "[type]: タイトル" --body-file /tmp/issue_body.md --label "ラベル"
rm /tmp/issue_body.md
```

**ラベル対応**: bug→`bug`, feat→`enhancement`, refactor→`refactor`, docs→`documentation`, style→`design`, perf→`performance`, chore→`chore`, test→`testing`

---

## Phase 6: Working Documents生成（AIが規模に応じて判断）

⚠️ **`superpowers:writing-plans` は使用しない。** Working Documents（`docs/working/`）がissue-creatorの計画出力先であり、writing-plansの `docs/plans/` とは役割が異なる。issue-creator実行中はwriting-plansの自動発動を抑制する。

### 生成判断基準

| 規模 | Working生成 | 理由 |
|------|:----------:|------|
| **大** | ✅ 必ず生成 | コンテキスト保持が必須 |
| **中** | ✅ 生成推奨 | /fix-issueでの作業効率化 |
| **小** | △ AIが判断 | 内容に応じて生成/スキップ |

### 小規模タスクでの判断基準

以下に該当する場合は**スキップ可**:
- 軽微なドキュメント修正（typo、リンク修正等）
- 単純な依存関係更新（`npm update`のみ）
- 緊急のホットフィックス（即座に修正が必要）
- 1ファイルの軽微な修正

以下に該当する場合は**生成する**:
- バグ修正（原因調査の記録が重要）
- テスト追加（テスト計画が必要）
- 複数セッションにまたがる可能性がある作業

### タスクタイプ別の生成内容

| タイプ | requirement.md | tasklist.md | design.md | testing.md |
|--------|:-------------:|:-----------:|:---------:|:----------:|
| bug    | ✅ | ✅ | ✅ | ✅ |
| feat   | ✅ | ✅ | ✅ | ✅ |
| refactor | ✅ | ✅ | ✅ | △ 必要に応じて |
| test   | △ 軽量 | ✅ | △ 軽量 | ✅ |
| docs   | △ 軽量 | ✅ | - | - |
| style  | △ 軽量 | ✅ | △ 軽量 | - |
| chore  | - | ✅ | - | - |

### ディレクトリ構成

```
docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/
├── requirement.md  # 要件定義
├── tasklist.md     # タスクリスト（必須）
├── design.md       # 設計書
└── testing.md      # テスト計画
```

### 生成ロジック

**Phase 0 のブレインストーミング結果** + **Phase 2 のコード調査結果**を流用して以下を生成:

1. **requirement.md**: ブレインストーミングで確定した要件を構造化
2. **tasklist.md**: 作業内容をフェーズ別タスクに分解
3. **design.md**: 変更対象ファイル、実装方針、影響範囲
4. **testing.md**: テストケース、カバレッジ目標

テンプレートは **[working-templates.md](references/working-templates.md)** を参照。

---

## Phase 7: 完了

```
✅ Issue #124 を作成しました
✅ Working Documents を生成しました（or スキップしました）
   └── docs/working/20260206_124_タイトル/

次のステップ:
  /fix-issue 124
```

---

## 詳細パターン

実際のIssue作成例は以下を参照:

- **[issue-examples.md](references/issue-examples.md)** - バグ報告、機能追加、リファクタリング等の具体例
