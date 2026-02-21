# testing.md — Issue #251: changelog自動化

## テスト戦略

GitHub Actionsのワークフローは実環境（GitHub）での動作確認が主体。
スクリプト（`update-changelog.mjs`）はローカルでユニットテスト可能。

---

## update-changelog.mjs のユニットテスト

### テストファイル
`__tests__/scripts/update-changelog.test.mjs` または
`scripts/update-changelog.test.mjs`（Vitestで実行）

### テストケース

#### package.json 更新
```
入力: version = "0.11.0", NEW_VERSION = "0.12.0"
期待: package.json の version が "0.12.0" に更新される
```

#### detailed-changelog.ts エントリ挿入
```
入力: 既存配列が存在するTS文字列, 新エントリデータ
期待: DETAILED_CHANGELOG配列の先頭に新エントリが挿入される
期待: 既存エントリはそのまま
```

#### version-history.ts エントリ挿入
```
入力: 既存配列が存在するTS文字列, 新エントリデータ
期待: VERSION_HISTORY配列の先頭に新エントリが挿入される
```

#### PR_TYPE マッピング
```
入力: PR_TYPE = "feature" → type: 'feature'
入力: PR_TYPE = "bugfix"  → type: 'bugfix'
```

---

## GitHub Actions 動作確認（手動テスト）

### テスト1: AIドラフト提案確認

**手順:**
1. 新規ブランチ `feat/test-changelog-automation` を作成
2. 適当な変更（例: コメント追加）をコミット
3. PRを作成。「ユーザー向け更新内容」は `-` のまま
4. `changelog-suggest.yml` が起動し、PRにコメントが投稿されることを確認

**期待結果:**
- PRに 🤖 AIドラフトコメントが投稿される
- コメントに箇条書きのユーザー向け説明文が含まれる
- 技術用語が含まれていない

---

### テスト2: changelog自動更新確認（feat PRマージ）

**手順:**
1. テスト1のPRに、AIドラフトから「ユーザー向け更新内容」を記入
   例: `- テスト機能が使えるようになりました`
2. PRをマージ
3. `changelog-update.yml` が起動することを確認

**期待結果:**
- `package.json` の version が `0.11.0` → `0.12.0` に更新される
- `detailed-changelog.ts` の先頭に新エントリが追加される
- `version-history.ts` の先頭に新エントリが追加される
- コミットメッセージに `[skip ci]` が含まれる
- CI（lint/test/build）が再実行されない

---

### テスト3: 空エントリのスキップ確認

**手順:**
1. 新規ブランチ `chore/test-no-changelog` を作成
2. PRを作成。「ユーザー向け更新内容」は `-` のまま（変更しない）
3. PRをマージ

**期待結果:**
- `changelog-update.yml` が起動するが、処理をスキップして終了
- `package.json` のバージョンが変わらない
- changelog ファイルが変更されない

---

### テスト4: fix PRマージ確認

**手順:**
1. 新規ブランチ `fix/test-patch-bump` で PRを作成
2. 「ユーザー向け更新内容」に内容を記入してマージ

**期待結果:**
- `package.json` の version が patch バンプされる（例: 0.12.0 → 0.12.1）

---

## 確認チェックリスト（リリース前）

- [ ] AIドラフト提案がPRコメントに正しく投稿される
- [ ] feat PR マージでマイナーバンプが発生する
- [ ] fix PR マージでパッチバンプが発生する
- [ ] 空エントリ("-")でバンプが発生しない
- [ ] chore/docs/refactor PRでバンプが発生しない
- [ ] `detailed-changelog.ts` に新エントリが先頭追加される
- [ ] `version-history.ts` に新エントリが先頭追加される
- [ ] 既存のchangelogエントリが壊れていない
- [ ] `[skip ci]` でCIのコミットループが発生しない
- [ ] 技術用語がユーザー向け説明文に含まれない
