---
name: issue-creator
description: GitHub Issue作成。調査→整理→gh issue create。バグ、機能追加、リファクタ、ドキュメント、UIデザイン変更、パフォーマンス改善、設定更新、テスト追加などあらゆる作業に対応。コードベース調査を行い、影響範囲を特定してから詳細なIssueを作成する。ユーザーが「〜のIssueを作って」「〜を実装したい」などと言った時に使用。
argument-hint: "[作業内容]"
---

# Issue Creator

GitHub Issueを作成するためのスキル。あらゆる種類の作業(バグ修正、機能追加、リファクタリング、ドキュメント更新など)をIssue化する。issue-automationスキルと組み合わせて使用することで、Issue作成から実装、マージまでの完全な開発フローを実現する。

## Core Workflow

### 1. 作業内容の理解

ユーザーの要求を分析し、以下を明確化する:

- **何をしたいか**: 具体的な作業内容
- **なぜ必要か**: 背景や理由
- **Issueタイプの判定**:
  - `bug`: バグ修正
  - `feat`: 新機能追加
  - `refactor`: リファクタリング
  - `docs`: ドキュメント更新
  - `style`: UIデザイン変更
  - `perf`: パフォーマンス改善
  - `chore`: 設定、依存関係更新
  - `test`: テスト追加

不明点があれば、ユーザーに確認する。

### 2. コードベース調査

**重要**: このフェーズでは**コード修正を一切行わない**。Issue作成のための調査のみを実施する。

Serena MCPツールを使用してコードベースを調査する:

```
# シンボル検索で関連コンポーネントを特定
mcp__serena__find_symbol

# パターン検索でコード全体から関連箇所を発見
mcp__serena__search_for_pattern

# シンボル概要で構造を理解
mcp__serena__get_symbols_overview

# 参照関係を理解
mcp__serena__find_referencing_symbols
```

**調査範囲の判断**:
- **詳細調査が必要**: バグ修正、機能追加、リファクタ、パフォーマンス改善
- **軽微な調査**: UIデザイン変更、既存機能の小規模修正
- **調査不要**: ドキュメント追加、設定ファイルのみの変更、新規ファイル作成

**調査で明確にすべき情報**:
- 対象ファイルとその場所
- 関連するコンポーネント/関数/クラス
- 影響を受ける可能性のある箇所
- 既存の類似実装パターン

### 3. Issue内容の整理

調査結果を基に、以下の構造でIssue本文を作成する:

```markdown
## 概要
[何をするか - 1-2文で簡潔に]

## 理由/背景
[なぜ必要か - 問題点や改善の動機]

## 対象箇所
[調査で特定したファイル、コンポーネント、関数など]
- `path/to/file.ts:123` - 該当する関数名
- `path/to/another.tsx:456` - 関連コンポーネント

## 作業内容
[具体的なタスクリスト]
- [ ] タスク1
- [ ] タスク2
- [ ] タスク3

## 影響範囲
[この変更が影響を与える可能性のある箇所]
- 関連する機能やコンポーネント
- 考慮すべき依存関係

## 補足
[その他の重要な情報、参考リンク、技術的な注意点など]
```

**Issue本文作成のポイント**:
- 調査結果を具体的に記載する
- ファイルパスと行番号を含める(`file.ts:123`)
- 実装の方向性や技術的な制約を明記する
- issue-automationでの実装を想定した内容にする

### 4. Issue作成

**必ずユーザー確認を入れる**:

Issue内容を表示し、以下を確認する:
- Issueタイプ(ラベル)
- タイトル
- 本文の要約

ユーザーの承認後、以下の手順でIssueを作成:

```bash
# 一時ファイルにIssue本文を書き込む
cat > /tmp/issue_body.md <<'EOF'
[Issue本文]
EOF

# gh CLIでIssue作成
gh issue create \
  --title "[type]: 簡潔なタイトル" \
  --body-file /tmp/issue_body.md \
  --label "ラベル名"

# 一時ファイルを削除
rm /tmp/issue_body.md
```

**ラベルの対応表**:
- `bug` → `bug`
- `feat` → `enhancement`
- `refactor` → `refactor`
- `docs` → `documentation`
- `style` → `design`
- `perf` → `performance`
- `chore` → `chore`
- `test` → `testing`

### 5. 次のステップの案内

Issue作成後、以下をユーザーに伝える:

```
✅ Issue #123 を作成しました

次のステップ:
- issue-automationスキルで実装を開始できます
- コマンド: /issue-automation 123
```

## Best Practices

### 調査の効率化

- **段階的に調査**: まず`find_symbol`で候補を絞り、必要に応じて`include_body=True`で詳細を取得
- **パターン検索を活用**: 変数名や関数名が不明な場合は`search_for_pattern`を使用
- **参照関係の確認**: 修正箇所が他に影響する場合は`find_referencing_symbols`で確認

### Issue本文の質の向上

- **具体的な場所を特定**: 「ログイン機能」ではなく「`app/auth/login/page.tsx:45`のhandleSubmit関数」
- **技術的な背景を含める**: 「Firestore Rulesで権限エラーが発生」など
- **実装の方向性を示す**: 「既存の`useAuth`パターンを踏襲」など
- **依存関係を明記**: 「`UserProfile`コンポーネントにも影響」など

### よくあるパターン

**パターン1: バグ修正Issue**
```markdown
## 概要
ログイン画面でメールアドレスの検証が動作しない

## 理由/背景
無効なメールアドレスでもログインボタンが押せてしまい、
Firebaseエラーが表示されてしまう

## 対象箇所
- `app/auth/login/page.tsx:67` - validateEmail関数
- `components/forms/EmailInput.tsx:23` - バリデーションロジック

## 作業内容
- [ ] validateEmail関数の正規表現を修正
- [ ] エラーメッセージの表示ロジックを追加
- [ ] 無効な入力時にボタンを無効化

## 影響範囲
- ログイン画面のみに影響
- サインアップ画面も同じEmailInputを使用しているため動作確認が必要
```

**パターン2: 機能追加Issue**
```markdown
## 概要
ダークモード対応を実装する

## 理由/背景
ユーザーからの要望が多く、夜間の使用時の視認性向上が必要

## 対象箇所
- `app/layout.tsx` - テーマプロバイダーの追加
- `lib/theme.ts` - テーマ定義
- `components/**/*.tsx` - 全コンポーネントの色指定を変数化

## 作業内容
- [ ] next-themesをインストール
- [ ] テーマプロバイダーをセットアップ
- [ ] CSS変数でカラーパレットを定義
- [ ] 既存コンポーネントを段階的に対応
- [ ] テーマ切り替えボタンを追加

## 影響範囲
- ほぼ全てのUIコンポーネントに影響
- 既存のTailwindクラスを段階的に移行
```

**パターン3: リファクタリングIssue**
```markdown
## 概要
認証関連のロジックをカスタムフックに集約する

## 理由/背景
複数のコンポーネントで重複したFirebase Auth呼び出しが散在している

## 対象箇所
- `app/auth/login/page.tsx:34` - 重複ロジック1
- `app/profile/page.tsx:56` - 重複ロジック2
- `components/Navbar.tsx:78` - 重複ロジック3

## 作業内容
- [ ] hooks/useAuth.tsを作成
- [ ] サインイン、サインアウト、ユーザー状態を集約
- [ ] 各コンポーネントをカスタムフック利用に書き換え
- [ ] テストを追加

## 影響範囲
- 認証関連の全コンポーネント(約5ファイル)
- ロジックは変更なく、構造のみ変更
```

**パターン4: シンプルなタスクIssue**
```markdown
## 概要
READMEにFirebaseセットアップ手順を追加

## 理由/背景
新しい開発者がプロジェクトをセットアップする際の手順が不明瞭

## 作業内容
- [ ] Firebaseプロジェクト作成手順を記載
- [ ] 環境変数(.env.local)の設定例を追加
- [ ] 初回セットアップコマンドを明記

## 影響範囲
- ドキュメントのみ、コード変更なし
```

## Integration with Other Skills

### issue-automation

このスキルで作成したIssueは、issue-automationスキルで実装できる:

```bash
# issue-creatorでIssueを作成
/issue-creator ログイン画面のバグを修正したい

# issue-automationで実装
/issue-automation 123
```

### git-workflow

Issueタイプはgit-workflowのコミットタイプに対応:
- `bug` → `fix:`
- `feat` → `feat:`
- `refactor` → `refactor:`
- `docs` → `docs:`
- など

### serena

コードベース調査にSerena MCPツールを活用:
- シンボル単位での効率的な調査
- 参照関係の把握
- 影響範囲の特定

## Limitations

- **コード修正は行わない**: このスキルは調査とIssue作成のみを担当
- **実装は別スキルで**: issue-automationスキルで実装を実施
- **GitHub CLI必須**: `gh` コマンドが利用可能である必要がある
- **リポジトリ内で実行**: GitHub リポジトリのディレクトリ内で実行する必要がある
