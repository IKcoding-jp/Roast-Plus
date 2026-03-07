---
name: fix-issue
description: GitHub Issueを自動解決するワークフロー。Issue確認→Working Documents読み込み→説明+計画→実装→動作確認→要件確認→検証→PR作成・自動レビュー→Steering更新→CI待機・自動マージまで。Issue番号を引数に取る（例: /fix-issue 123）。トピックブランチ必須、main直接コミット禁止。
---

# Issue自動解決スキル

## ワークフロー概要

```
Issue確認 → Working読込 → 説明+計画 → 実装 → 動作確認 → 要件確認 → 検証 → PR・レビュー → Steering更新 → CI待機・マージ
```

🔹 確認ポイント（AskUserQuestionで確認後に次へ）: 🔹① 説明+計画（Phase 3）　🔹② 要件確認（Phase 6）　🔹③ Steering更新（Phase 9）

---

⚠️ **superpowers排他制御**: fix-issue実行中は CLAUDE.md の「スキル優先順位と排他制御」に従う。`test-driven-development`（Phase 4で明示呼出）と `systematic-debugging`（必要時）のみ使用。

---

## Phase 1: Issue確認

```bash
gh issue view $ARGUMENTS --json title,body,labels,number,assignees
```

Issueの内容を確認する。次のPhase 2でWorking Documents検索に使用する。

---

## Phase 2: Working Documents読み込み

**Working Documentsが存在する場合は読み込み、存在しない場合は生成を促します。**

### 2.1 Working Documents検索

```bash
ls -d docs/working/*_${ISSUE_NUMBER}_* 2>/dev/null || echo "Not found"
```

### 2.2 存在する場合

以下のファイルを読み込み、コンテキストを復元:

```
docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/
├── requirement.md  # 要件定義 → 何を実装するか
├── tasklist.md     # タスクリスト → 作業の進め方
├── design.md       # 設計書 → どこを修正するか
└── testing.md      # テスト計画 → どうテストするか
```

⚠️ **Working Documentsがあれば、コード探索は不要。設計書に必要な情報が記載されている。**

### 2.3 存在しない場合

AskUserQuestionで以下を提示:

1. **今ここで Working Documents を生成する（推奨）** → Phase 2.4へ
2. **Working なしで続行（探索フェーズを実行）** → Phase 2.5へ

---

## Phase 2.4: Working Documents生成（既存Issue用）

**Working Documentsがない既存Issueに対して、その場で生成します。**

### 手順

1. **Issue本文を読み込み**（Phase 1で取得済み）
2. **Serena MCPで関連コード調査**
   ```
   search_for_pattern → get_symbols_overview → find_symbol → find_referencing_symbols
   ```
3. **Working Documents生成**
   - `docs/working/{YYYYMMDD}_{Issue番号}_{タイトル}/` を作成
   - requirement.md, tasklist.md, design.md, testing.md を生成
   - タスクタイプに応じて生成内容を調整

4. **ユーザー確認（AskUserQuestion）**
   - 生成されたWorking Documentsを提示
   - 修正があれば対応
   - OKならPhase 3（説明+計画）へ

---

## Phase 2.5: コード探索（Working Documentsがない場合のみ）

⚠️ **通常はスキップ。Working Documentsがない緊急時のみ実行。**

Serena MCPで関連コードを探索:

```
search_for_pattern → get_symbols_overview → find_symbol → find_referencing_symbols
```

---

## Phase 3: 説明+計画 🔹確認ポイント①

**Issueの背景・方針と実装計画をまとめて提示し、1回の確認で承認を得る。**

### `/issue-creator` 直後の場合（同一セッション内）

ブレインストーミング・Working生成が直前に完了しているため、**軽量版**で実施:
- 背景・根本原因の詳細説明は省略（issue-creatorで確認済み）
- **修正の方針**と**実装計画の要点**のみ提示

### 通常の場合

**エンジニア初心者向けに**以下をまとめて説明します:

**【説明】**
1. **問題の背景** - なぜこのIssueが作られたのか
2. **解決したいこと** - 何を実現したいのか
3. **根本原因** - 技術的に何が起きているのか
4. **修正の方針** - どのように直すのか
5. **懸念点・リスク** - 考慮すべき影響や可能性

**【計画】**
- tasklist.mdがある場合: フェーズ・タスクに沿った計画を提示
- tasklist.mdがない場合: EnterPlanModeで実装計画を立案（「think hard」で検討）

**説明スタイル:**
- 技術用語は使用OK（ただし初出の用語は簡潔に補足説明する）
- ⚠️ **コードは提示しない**（ファイル名や関数名は記載OK）
- 図解やダイアグラムを活用

**AskUserQuestionで確認**: 方針と計画に問題がなければPhase 4へ進む。

---

## リファレンスドキュメント

詳細な実装パターンと過去事例は以下を参照:

- **[error-patterns.md](references/error-patterns.md)** - よくあるエラーパターンの原因・解決方法・予防策
- **[issue-resolution-history.md](references/issue-resolution-history.md)** - 過去に解決したIssueの詳細記録
- **[changelog-guide.md](references/changelog-guide.md)** - changelog更新のファイル形式・バージョンバンプルール・AI生成ガイドライン（Phase 8 Step 0で参照）

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

**Bug/Bugfix/想定外動作の場合に実行。Enhancement/feat/docs/chore系はスキップ。**

Taskエージェントを起動してデータフローを調査する。これにより「初回実装の誤り」を防ぐ:

```
Task ツールで調査エージェントを起動:

指示:
1. 影響するコンポーネント・フック・関数のデータフローを追跡する
   （Serena MCP: search_for_pattern → find_symbol → find_referencing_symbols）
2. 関連するすべての変数・定数・条件分岐を列挙する（証拠となるコードの場所を引用）
3. 根本原因の仮説を2〜3個提示する（各仮説に証拠を付ける）
4. 推奨修正アプローチを1つ選択し、他の仮説との比較理由を説明する
```

⚠️ **調査結果を確認し、正しいアプローチを確定してから実装に進む。推測で実装しない。**

---

### Context7 MCPでドキュメント確認

実装前に必ず最新ドキュメントを参照:

```
resolve-library-id → query-docs
```

### 実装実行（TDD必須）

**コード変更を含む実装は、`superpowers:test-driven-development` スキルを Skill ツールで明示的に呼び出し、Red→Green→Refactorサイクルに従う。**

⚠️ **TDDスキルはここで明示的に呼び出す。using-superpowersの自動発動には依存しない。**

#### TDD対象の場合（lib/, hooks/, components/のロジック, バグ修正）

```
1. Skill ツールで superpowers:test-driven-development を呼び出す
2. testing.md を読み込み → テスト設計のインプット
3. 🔴 Red: 失敗テストを作成 → コミット
4. 🟢 Green: テスト合格する最小実装 → コミット
5. 🔵 Refactor: テスト維持したまま改善 → コミット（必要な場合のみ）
```

⚠️ **テストなしの実装コミットは行わない。必ずテストを先に書く。**

#### TDD対象外の場合（docs/, chore, ビジュアル調整のみ）

Claude Code標準ツール（Edit/Write）でそのまま実装。

#### 共通

**⚠️ tasklist.mdを逐次更新**: 完了したタスクは `[x]` に変更。

### ⚠️ 緊急ロールバック

実装が取り返しのつかない状態になった場合:

```bash
git stash              # 変更を一時退避
git reset --hard HEAD  # 最後のコミットに戻す
```

問題が複雑な場合は `systematic-debugging` スキルを使用して根本原因を特定してから再実装する。

---

## Phase 5: 動作確認（自動実行）

**実装完了後、ユーザーに手動確認を案内します。確認は求めず、Phase 6に進みます。**

ユーザーに以下を伝える（AskUserQuestionは使わない）:

```
実装が完了しました。動作確認をお願いします:
- `npm run dev` でローカルサーバーを起動し、ブラウザで確認してください
- 問題があれば次の要件確認で教えてください
```

⚠️ **UI変更の場合**: Playwright MCPでスクリーンショットを取得し、ユーザーに提示する。

---

## Phase 6: 要件確認 🔹確認ポイント②（ループ型・検証なし）

**requirement.mdの各要件をチェックリスト形式で提示し、ユーザーに充足を確認します。ユーザーの明示的な承認が得られるまでループします。**

### 手順

1. **requirement.mdを読み込む**（Working Documentsが存在する場合）
2. **要件チェックリストを作成・提示**:

```
📋 要件充足チェック（Issue #番号）:

✅ [要件1の内容]
   → 対応: 〇〇ファイルの〇〇を追加/変更

✅ [要件2の内容]
   → 対応: 〇〇を実装

⬜ [未確認の要件]（手動確認をお願いします）
```

3. **動作確認の結果**（Phase 5のスクリーンショット等）を補足

4. **AskUserQuestionで承認を求める**

### フローチャート

```
requirement.mdを読み込む
        ↓
要件チェックリストを作成
        ↓
ユーザーに報告（チェックリスト + 動作確認結果）
        ↓
ユーザー承認？
  ├── ✅ OK（すべての要件が満たされた）→ Phase 7（検証）へ
  └── ❌ 追加修正が必要
        ↓
   追加の指示を受ける → 修正実装 → 必要に応じて動作再確認 → 再度チェックリスト提示（ループ）
```

### ⚠️ 重要ルール

- **requirement.mdが存在する場合は必ず読み込み、各要件をチェックリスト形式で提示すること**
- **「すべて実装しました」という一言報告は禁止** — 各要件の充足状況を個別に示すこと
- **このフェーズでは `npm run lint` / `npm run build` / `npm run test` を実行しない**
- 追加修正は実装のみに集中し、検証はPhase 7でまとめて1回だけ実行する
- **ユーザーの承認なしに検証フェーズへ進まないこと**（テスト通過では承認の代替にならない）

---

## Phase 7: 検証（自動実行）

**ユーザーの操作なしで自動実行します。**

```bash
npm run lint && npm run build && npm run test:run
```

- Lintエラーは完全解消するまでループ
- ビルド・テストが通るまで修正を繰り返す
- 自動で完了する（ユーザーへの確認不要）

### エラー発生時のエスカレーション

- **Lintエラー**: `npm run lint -- --fix` → 手動修正（[error-patterns.md](references/error-patterns.md) 参照）
- **ビルドエラー**: エラーを確認 → 関連ファイル修正 → 再ビルド
- **テスト失敗**: モック・前提条件確認 → 実装ロジック見直し

⚠️ **いずれも5回以上ループして解消しない場合は `systematic-debugging` スキルを呼び出す。**

---

## Phase 8: コミット・PR作成・コードレビュー

**実装をコミットしてPRを作成し、規模に応じてコードレビューを自動実行します。**

### 手順

0. **changelog更新（完全自動）**（詳細: [changelog-guide.md](references/changelog-guide.md)）
   - `feat/*` → minor バンプ / `fix/*`, `style/*` → patch / それ以外はスキップ
   - AIがバンプ判断・テキスト生成・ファイル更新まで自動実行（ユーザー確認なし）
   - 更新対象: `package.json`, `version-history.ts`, `detailed-changelog.ts`
   - ⚠️ chore コミット（Step 1 ①）に同梱。別コミット・別PR不要。

1. **コミット・プッシュ**

   まず `git status` で全ての未コミット変更を確認する。

   **① 実装外の変更がある場合（chore コミットを先に作成）**
   ```bash
   # スキル更新、.gitignore、CLAUDE.md、docs等の実装外変更を先にコミット
   # changelog更新ファイルもここに含める
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

   ⚠️ **両方のコミットを同じPR（同じブランチ）に含める。別ブランチは不要。**

2. **PR作成**
   ```bash
   # ⚠️ 一時ファイルはリポジトリルートに相対パスで作成（Windows互換）
   # /tmp/ はWindowsで正しく解決されないため使用禁止
   cat > .tmp-pr-body.md <<'PREOF'
   ## 概要
   Issue #番号 を解決。

   ## 変更内容
   - 変更点1
   - 変更点2

   ## テスト
   - [x] lint / build / test 通過
   - [x] コードレビュー（自動判断）
   - [ ] 実機動作確認

   Closes #番号
   PREOF

   gh pr create --base main --title "<type>(#<Issue番号>): <タイトル>" --body-file .tmp-pr-body.md

   # 一時ファイルを必ず削除
   rm -f .tmp-pr-body.md
   ```

3. **コードレビュー（規模で自動判断）**

   ⚠️ **ユーザーには確認を求めない。AIが規模に応じて自動判断する。**

   | 規模 | レビュー | 基準 |
   |------|---------|------|
   | **小** | スキップ | 1-2ファイル変更、CSS/docs/chore |
   | **中** | フルレビュー | 3-5ファイル変更、機能追加・修正 |
   | **大** | フルレビュー | 6ファイル以上、新機能・アーキテクチャ変更 |

   **フルレビューの場合:**
   - Skillツールで `code-review:code-review` を呼び出し
   - 信頼度スコア80以上の問題のみPRにコメント投稿

4. **レビュー結果の処理**
   - **問題なし / スキップ** → Phase 9（Steering更新）へ
   - **問題あり** → 修正 → コミット → プッシュ → 再度code-reviewを実行（ループ）

⚠️ **レビューで指摘された問題は、修正するか技術的根拠をもって反論すること。盲従は不要。**

### ⚠️ Push/PR失敗時の対応

| 問題 | 対処 |
|-----|------|
| push失敗 | `git push --set-upstream origin $(git branch --show-current)` |
| PR作成失敗 | `.tmp-pr-body.md` 残存確認 → `rm -f` → 再実行 |
| コンフリクト | `git fetch origin main && git rebase origin/main` → `git push --force-with-lease` |

---

## Phase 9: Steering Documents更新 🔹確認ポイント③

**変更内容から影響するドキュメントを判定し、該当するもののみレビュー・更新する。**

### 9.1 影響判定

変更内容に基づき、以下のマトリクスで影響するドキュメントを判定する:

| 変更内容 | FEATURES | TECH_SPEC | GUIDELINES | REPOSITORY | UBIQUITOUS | PRODUCT |
|---------|:--------:|:---------:|:----------:|:----------:|:----------:|:-------:|
| 機能追加・変更 | ✅ | - | - | △ | △ | ✅ |
| バグ修正 | - | - | - | - | - | ✅ |
| UI/スタイル調整 | △ | - | - | - | - | ✅ |
| 技術スタック変更 | - | ✅ | ✅ | - | - | - |
| ファイル追加・移動 | - | - | - | ✅ | - | - |
| 新ドメイン用語 | - | - | - | - | ✅ | - |
| テスト追加 | - | ✅ | - | - | - | ✅ |
| docs/chore | - | - | - | △ | - | - |

✅ = 必ず読み込み・レビュー　△ = 変更内容に応じて判断　- = スキップ

**常にチェック**: PRODUCT.md（バージョン更新）、TECH_SPEC.md（テスト数更新）は影響がある場合のみ読み込む。

### 9.2 更新チェックリスト生成

AskUserQuestionで以下の形式のレビュー結果を提示する:

```
📋 Steering Documents レビュー結果:

1. FEATURES.md     → ✏️ 更新あり（〇〇を追記）
2. TECH_SPEC.md    → ✅ 変更なし（理由: テスト数変動なし）
3. GUIDELINES.md   → ⏭️ スキップ（理由: 実装パターン変更なし）
4. REPOSITORY.md   → ⏭️ スキップ（理由: ファイル構造変更なし）
5. UBIQUITOUS_LANGUAGE.md → ⏭️ スキップ（理由: 新規用語なし）
6. PRODUCT.md      → ✏️ 更新あり（バージョン更新）

更新を実行してよろしいですか？
```

⚠️ **影響判定で「スキップ」としたドキュメントは読み込まない（コンテキスト節約）。**
⚠️ **「変更なし」と「スキップ」の違い**: 「変更なし」は読み込んだが更新不要、「スキップ」は影響判定で読み込み自体を省略。

### 9.3 更新実行

ユーザー承認後、更新対象ドキュメントを編集する。

⚠️ **ユーザーの最終確認なしに Steering Documents を更新しないこと。**

---

## Phase 10: マージ・クリーンアップ（全自動）

**ユーザーの確認なしで自動実行します。PR作成・レビューはPhase 8で完了済み。**
**このフェーズではCI完了待機→マージ確認→クリーンアップまで一気通貫で実行します。**

### 1. Working Documents最終更新

tasklist.mdを完了状態に更新:

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

### 3. 自動マージ設定

```bash
gh pr merge --auto --merge --delete-branch
```

### 4. CI完了待機

**CIが完了するまで待機し、マージが実行されたことを確認する。**

```bash
gh pr checks --watch
```

⚠️ **CI失敗時**: エラーを確認し、修正 → コミット → プッシュ → 再度待機。

### 5. ブランチクリーンアップ

**マージ完了を確認してからローカルブランチを削除する。**

```bash
FEATURE_BRANCH=$(git branch --show-current)
git switch main && git pull origin main
git branch -D "$FEATURE_BRANCH"
```

---

## 完了

```
✅ Issue #番号 を解決しました

📋 実施内容:
- [変更の概要]

🔀 PR: #番号 → マージ完了 ✅
🧹 ブランチクリーンアップ完了

📝 Steering Documents レビュー完了:
- FEATURES.md: [✏️更新済 / ✅変更なし / ⏭️スキップ]
- TECH_SPEC.md: [✏️更新済 / ✅変更なし / ⏭️スキップ]
- GUIDELINES.md: [✏️更新済 / ✅変更なし / ⏭️スキップ]
- REPOSITORY.md: [✏️更新済 / ✅変更なし / ⏭️スキップ]
- UBIQUITOUS_LANGUAGE.md: [✏️更新済 / ✅変更なし / ⏭️スキップ]
- PRODUCT.md: [✏️更新済 / ✅変更なし / ⏭️スキップ]
```
