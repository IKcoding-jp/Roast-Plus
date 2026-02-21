# design.md — Issue #251: changelog自動化

## 変更対象ファイル

| ファイル | 変更種別 | 詳細 |
|---------|---------|------|
| `.github/PULL_REQUEST_TEMPLATE.md` | 修正 | `<!-- /changelog -->` マーカー追加 |
| `.github/workflows/changelog-suggest.yml` | 新規作成 | AIドラフト提案ワークフロー |
| `.github/workflows/changelog-update.yml` | 新規作成 | changelog自動更新ワークフロー |
| `.github/scripts/update-changelog.mjs` | 新規作成 | TS・package.json更新スクリプト |
| `data/dev-stories/detailed-changelog.ts` | 自動更新 | Actionが担当 |
| `data/dev-stories/version-history.ts` | 自動更新 | Actionが担当 |
| `package.json` | 自動更新 | Actionが担当 |

---

## PRテンプレート変更差分

```diff
 ## ユーザー向け更新内容
-<!-- このセクションはアプリの更新履歴に自動反映されます。
-非エンジニアのユーザーにも分かるように書いてください。... -->
+<!-- ユーザーに見える変化のみ。技術的な内容は不要です -->
+<!-- ユーザー向けの変更なし（内部改善のみ）の場合は "-" のままにしてください -->

 -

+<!-- /changelog -->
+
 ---
```

---

## update-changelog.mjs 実装方針

### 環境変数入力
```javascript
const { NEW_VERSION, CHANGELOG_CONTENT, PR_TYPE, MERGE_DATE } = process.env;
```

### package.json 更新
```javascript
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = NEW_VERSION;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
```

### detailed-changelog.ts 更新（テキスト挿入方式）
```javascript
const content = fs.readFileSync('data/dev-stories/detailed-changelog.ts', 'utf8');
const marker = 'export const DETAILED_CHANGELOG: ChangelogEntry[] = [';
const newEntry = `\n  {\n    id: 'v${NEW_VERSION}',\n    ...省略\n  },`;
const updated = content.replace(marker, marker + newEntry);
fs.writeFileSync('data/dev-stories/detailed-changelog.ts', updated);
```

### version-history.ts 更新（同方式）
```javascript
const marker = 'export const VERSION_HISTORY: VersionHistoryEntry[] = [';
```

---

## changelog-suggest.yml 実装方針

### PR本文パース
```javascript
const body = context.payload.pull_request.body || '';
const match = body.match(/## ユーザー向け更新内容[\s\S]*?\n([\s\S]*?)<!-- \/changelog -->/);
const content = match ? match[1].trim() : '';
const isEmpty = /^[\s\-*]*$/.test(content);
```

### OpenAI API呼び出し（fetch使用・依存ライブラリなし）
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
  }),
});
```

### PRコメント形式
```markdown
🤖 **AIが「ユーザー向け更新内容」のドラフトを生成しました**

内容を確認し、PR本文の該当セクションにコピーして編集してください。

---

- ○○機能が使えるようになりました
- △△の動作が改善されました

---
*ユーザーに見える変化がない場合は、`-` のままで構いません。*
```

---

## changelog-update.yml バージョン判定ロジック

```yaml
- name: Determine version bump
  id: version
  run: |
    BRANCH="${{ github.event.pull_request.head.ref }}"
    CURRENT=$(node -p "require('./package.json').version")
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"

    if [[ "$BRANCH" == feat/* ]]; then
      NEW="$MAJOR.$((MINOR + 1)).0"
      TYPE="feature"
    elif [[ "$BRANCH" == fix/* || "$BRANCH" == style/* ]]; then
      NEW="$MAJOR.$MINOR.$((PATCH + 1))"
      TYPE="bugfix"
    else
      echo "skip=true" >> $GITHUB_OUTPUT
      exit 0
    fi

    echo "new_version=$NEW" >> $GITHUB_OUTPUT
    echo "pr_type=$TYPE" >> $GITHUB_OUTPUT
```

---

## セキュリティ考慮事項

- `OPENAI_API_KEY` は GitHub Secrets 経由で渡す（コードへの直接記述禁止）
- `github-actions[bot]` がコミットするため、`GITHUB_TOKEN` のデフォルト権限で対応可能
- `[skip ci]` タグでコミットループを防止
- `contents: write` は `changelog-update.yml` のみに付与（`changelog-suggest.yml` は不要）
