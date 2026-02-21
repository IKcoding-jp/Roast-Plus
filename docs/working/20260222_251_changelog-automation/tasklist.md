# tasklist.md — Issue #251: changelog自動化

**ステータス**: ✅ 完了
**完了日**: 2026-02-22

## フェーズ1: PRテンプレート修正

- [x] `.github/PULL_REQUEST_TEMPLATE.md` に `<!-- /changelog -->` 終端マーカーを追加
  - 「ユーザー向け更新内容」セクション末尾、`---` の直前に挿入

## フェーズ2: update-changelog.mjs スクリプト作成

- [x] `.github/scripts/update-changelog.mjs` を新規作成
  - 環境変数から入力受け取り: `NEW_VERSION`, `CHANGELOG_CONTENT`, `PR_TYPE`, `MERGE_DATE`
  - `package.json` の `version` フィールドを更新
  - `data/dev-stories/detailed-changelog.ts` の配列先頭に新エントリを挿入
  - `data/dev-stories/version-history.ts` の配列先頭に新エントリを挿入
  - ファイル内容の文字列操作（AST不要、正規表現でテキスト挿入）
  - Vitestユニットテスト12件作成（`__tests__/scripts/update-changelog.test.ts`）

## フェーズ3: changelog-suggest.yml ワークフロー作成

- [x] `.github/workflows/changelog-suggest.yml` を新規作成
  ```
  trigger: pull_request: types: [opened], branches: [main]
  permissions: pull-requests: write, contents: read
  ```
  - PR本文から「ユーザー向け更新内容」を抽出
  - 空("-"のみ)なら OpenAI API (gpt-4o-mini) でドラフト生成
  - ドラフトをPRコメントとして投稿
  - 既に内容がある場合はスキップ

## フェーズ4: changelog-update.yml ワークフロー作成

- [x] `.github/workflows/changelog-update.yml` を新規作成
  ```
  trigger: pull_request: types: [closed], branches: [main]
  condition: github.event.pull_request.merged == true
  permissions: contents: write, pull-requests: read
  ```
  - PR本文から「ユーザー向け更新内容」を抽出
  - 空("-"のみ)なら終了
  - ブランチ名からバージョン種別を判定
  - バンプなし判定なら終了
  - 新バージョン番号を計算
  - `node .github/scripts/update-changelog.mjs` を実行
  - `git add` → `git commit` (`chore: v{version} changelog自動更新 [skip ci]`) → `git push`

## フェーズ5: 動作確認

- [ ] テスト用PRを作成し、AIドラフト提案が正しく投稿されることを確認（実環境での手動確認が必要）
- [ ] 「ユーザー向け更新内容」を入力してマージし、changelog・package.jsonが自動更新されることを確認
- [ ] 空("-"のみ)のPRをマージし、バージョンが変わらないことを確認

## 依存関係

フェーズ2 → フェーズ4（スクリプトが先に必要）
フェーズ1, 2, 3, 4 → フェーズ5（全フェーズ完了後に動作確認）
