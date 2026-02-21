# GitHub Issue 作成例集

## 目次

1. [バグ報告（タイマー停止問題）](#1-バグ報告タイマー停止問題)
2. [共通UI不統一](#2-共通ui不統一)
3. [機能追加（CSVエクスポート）](#3-機能追加csvエクスポート)
4. [リファクタリング（複雑度削減）](#4-リファクタリング複雑度削減)
5. [ドキュメント追加](#5-ドキュメント追加)

---

## 共通パターン: gh CLI コマンド

全例共通。`--body-file` で一時ファイルを使用（バッククォート問題回避）:

```bash
cat > /tmp/issue_body.md <<'EOF'
[Issue本文]
EOF

gh issue create \
  --title "[type](scope): タイトル" \
  --body-file /tmp/issue_body.md \
  --label "label1,label2"

rm /tmp/issue_body.md
```

**ラベル対応**: bug→`bug`, feat→`enhancement`, refactor→`refactor`, docs→`documentation`, style→`design`, perf→`performance`, chore→`chore`, test→`testing`

---

## 1. バグ報告（タイマー停止問題）

**調査**: `search_for_pattern: "clearInterval"` → `hooks/useRoastTimer.ts:42` 検出。`find_referencing_symbols: useRoastTimer` → 2箇所で参照。

**Issue本文**:

```markdown
## 概要
ローストタイマーが一時停止後に再開できず、停止したままになる問題を修正する。

## 再現手順
1. ローストタイマー画面を開く → タイマー開始 → 一時停止 → 再開 → **動かない**

## 原因
`useRoastTimer` 内で一時停止時に `clearInterval` 後、タイマーIDが `null` に設定されない。

## 対象箇所
- `hooks/useRoastTimer.ts:42` - `pauseTimer` 関数
- `hooks/useRoastTimer.ts:55` - `resumeTimer` 関数

## 作業内容
- [ ] `pauseTimer` でタイマーIDを `null` に設定
- [ ] `resumeTimer` で既存タイマーをクリアしてから新規開始
- [ ] テストケース追加（一時停止→再開シナリオ）

## 影響範囲
- ローストタイマー機能全体、クイックタイマー
```

**ラベル**: `bug`, `priority: high`
**タイトル**: `fix(timer): タイマー一時停止後の再開不具合を修正`

---

## 2. 共通UI不統一

**調査**: `search_for_pattern: "className.*bg-amber-600.*rounded"` → 3箇所で生のTailwindボタン/カード検出。

**Issue本文**:

```markdown
## 概要
一部ページで共通UIコンポーネント未使用。デザイン一貫性が損なわれている。

## 問題
CLAUDE.md「UI Component Rules」違反が3箇所：
1. `app/settings/page.tsx:45` - カスタムボタン → `<Button>` に置換
2. `app/profile/page.tsx:28` - カスタムカード → `<Card>` に置換
3. `components/CustomDialog.tsx:12` - カスタムダイアログ → `<Dialog>` に置換

## 作業内容
- [ ] 各箇所を共通UIコンポーネントに置き換え
- [ ] テーマ対応確認
```

**ラベル**: `refactor`, `ui`
**タイトル**: `refactor(ui): 共通UIコンポーネントに統一`

---

## 3. 機能追加（CSVエクスポート）

**調査**: `find_symbol: "useAppData"` → データ取得フック確認。`search_for_pattern: "export.*csv"` → 未実装確認。

**Issue本文**:

```markdown
## 概要
コーヒー記録データをCSV形式でエクスポートする機能を追加する。

## 理由/背景
外部ツール（Excel等）でデータ分析を行いたいという要望。

## 対象箇所
### 新規作成
- `lib/export/csv-exporter.ts` - CSV生成ロジック
- `components/ExportButton.tsx` - エクスポートボタン

### 既存修正
- `app/assignment/page.tsx` - エクスポートボタン追加
- `app/tasting/page.tsx` - エクスポートボタン追加

## 作業内容
- [ ] CSV生成ユーティリティ（UTF-8 BOM付き、日本語ヘッダー対応）
- [ ] ExportButtonコンポーネント作成
- [ ] 割付画面・テイスティング画面にボタン追加
- [ ] テストケース追加（エスケープ処理含む）

## 影響範囲
- 割付管理機能、テイスティング記録機能
```

**ラベル**: `enhancement`
**タイトル**: `feat(export): CSVエクスポート機能を追加`

---

## 4. リファクタリング（複雑度削減）

**調査**: Lizardスキャン結果 → `DesktopTableView.tsx`(CCN 125)、`TableModals.tsx`(CCN 117)。

**Issue本文**:

```markdown
## 概要
高CCN関数をリファクタリングし、保守性を向上させる。

## 理由/背景
| ファイル | CCN | 重症度 |
|---------|-----|--------|
| `DesktopTableView.tsx` | 125 | 即対応 |
| `TableModals.tsx` | 117 | 即対応 |

## 作業内容
### DesktopTableView.tsx（CCN 125 → 30以下目標）
- [ ] テーブル行を `TableRow` コンポーネントに抽出
- [ ] ソート・フィルタを `useTableLogic` フックに移動

### TableModals.tsx（CCN 117 → 30以下目標）
- [ ] 各モーダルを独立コンポーネントに分割
- [ ] バリデーションを `validators.ts` に抽出

### 検証
- [ ] リファクタリング後にCCN再測定
- [ ] 既存テスト全通過確認
```

**ラベル**: `refactor`, `code-quality`
**タイトル**: `refactor(assignment): 高CCN関数のリファクタリング`

---

## 5. ドキュメント追加

**調査**: `search_for_pattern: "@param|@returns"` → `hooks/` 配下でJSDoc不足を検出。

**Issue本文**:

```markdown
## 概要
カスタムフックのAPIドキュメント（JSDoc）を追加する。

## 対象箇所
- `hooks/useAppData.ts`
- `hooks/useRoastTimer.ts`
- `hooks/useAuth.ts`

## 作業内容
- [ ] 各フックにJSDoc（@param, @returns, @example）追加
```

**ラベル**: `documentation`
**タイトル**: `docs(hooks): カスタムフックのAPIドキュメントを追加`
