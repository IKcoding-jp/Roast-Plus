# changelog更新ガイド

## 更新対象ファイル（3つ）

```
package.json
data/dev-stories/version-history.ts
data/dev-stories/detailed-changelog.ts
```

---

## バージョンバンプルール

| ブランチ名 | バンプ種別 | 例 |
|-----------|:---:|---|
| `feat/*` | minor | 0.12.0 → 0.13.0 |
| `fix/*`, `style/*` | patch | 0.12.0 → 0.12.1 |
| `docs/*`, `test/*`, `chore/*` | スキップ | changelog更新なし |

現在バージョンは `package.json` の `version` フィールドから取得:
```bash
node -p "require('./package.json').version"
```

---

## エントリ形式

### version-history.ts（先頭に追加）

```typescript
{
  version: '0.13.0',
  date: 'YYYY-MM-DD',
  summary: '〇〇機能を追加しました など N件の更新',
},
```

- `summary`: 1〜2行の簡潔な説明。複数変更は「など N件の更新」で締める

### detailed-changelog.ts（先頭に追加）

```typescript
{
  id: 'v0.13.0',
  version: '0.13.0',
  date: 'YYYY-MM-DD',
  type: 'feature',   // 下記テーブル参照
  title: '〇〇機能を追加しました',
  content: `
- 変更内容1
- 変更内容2
  `.trim(),
  tags: ['タグ1', 'タグ2'],
  createdAt: 'YYYY-MM-DDTHH:mm:ss.000Z',
  updatedAt: 'YYYY-MM-DDTHH:mm:ss.000Z',
},
```

#### type の選択基準

| type | label | 使う状況 |
|------|-------|---------|
| `feature` | 機能追加 | 新しい機能・画面を追加 |
| `bugfix` | 修正 | バグ・不具合の修正 |
| `improvement` | 改善 | 既存機能の使い勝手・パフォーマンス改善 |
| `style` | デザイン | UIデザイン・見た目の変更 |
| `docs` | ドキュメント | ドキュメント追加・更新 |
| `update` | 更新 | 依存関係・設定の更新 |

---

## AI生成ガイドライン（ユーザー向け文体）

- **読者**: アプリを使う一般ユーザー（エンジニアではない）
- **言語**: 日本語・丁寧体（〜しました、〜できるようになりました）
- **禁止表現**: 技術用語（Refactor, TypeScript, API, PR等）
- **箇条書き**: 各行は「- 」で始め、1行1変更
- **tags**: 機能名・ページ名など2〜4個（例: `['テーマ', 'UI', 'クイズ']`）

### 例（feat/ ブランチ）

```
title: 'ダークモード・テーマ切り替え機能を追加しました'
content:
- ダークモードを追加しました
- テーマを6種類の中から選べるようになりました（設定 → テーマ）
- アプリのテーマカラーがテーマ切り替えに連動するようになりました
tags: ['テーマ', 'ダークモード', 'UI']
```

---

## AskUserQuestion テンプレート

```
📝 changelog更新の確認

バージョン: 0.12.X → 0.13.0（minor バンプ）

以下の内容でchangelogを更新します:
- title: 〇〇機能を追加しました
- type: feature
- content:
  - 変更内容1
  - 変更内容2
- tags: ['タグ1', 'タグ2']

修正が必要な場合は「Other」で指示してください。
```

---

## コミット方法

changelog更新ファイルは **chore コミット（Phase 9 Step 1 ①）に含める**:

```bash
git add package.json data/dev-stories/version-history.ts data/dev-stories/detailed-changelog.ts
# ← 実装外の変更と一緒に chore コミット
git commit -m "chore(#<Issue番号>): changelog・バージョン更新"
```

別コミット・別PRは不要。同じブランチのPRにすべて含める。
