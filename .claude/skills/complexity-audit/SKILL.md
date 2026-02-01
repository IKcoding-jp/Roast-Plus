---
name: complexity-audit
description: Lizardによる循環的複雑度（CCN）解析を実行し、リファクタリング対象を特定する。コードレビューやリファクタリング計画時に使用。
allowed-tools: Bash, Read
---

# Complexity Audit Protocol

ユーザーから複雑度分析やリファクタリング対象の特定を求められた場合、以下の手順を実行せよ。

## 前提条件

- **Lizard** がインストール済みであること（`pip install lizard`）
- Python 3.x が利用可能であること

## 閾値設定

| 指標 | 閾値 | 説明 |
|------|------|------|
| CCN（循環的複雑度） | **15** | 条件分岐・ループの複雑さ。15超は要リファクタリング |
| NLOC（論理行数） | **50** | 関数の長さ。50行超は分割を検討 |

### CCN重症度レベル

| レベル | CCN範囲 | 対応 |
|--------|---------|------|
| 正常 | 1-10 | 問題なし |
| 注意 | 11-15 | モニタリング |
| 警告 | 16-25 | リファクタリング推奨 |
| 危険 | 26-50 | リファクタリング必須 |
| 即対応 | 51+ | 即座に分割すべき |

## 実行コマンド

### プロジェクトソースのみスキャン

```bash
lizard ./app ./components ./hooks ./lib ./types ./scripts -C 15 -L 50 -w
```

> `node_modules/`, `.next/`, `functions/`, `.claude/` は自動除外するためスキャン対象ディレクトリを明示指定する。
> `-C 15`: CCN閾値  `-L 50`: 行数閾値  `-w`: 警告のみ表示

### 特定ファイル・ディレクトリのスキャン

```bash
lizard ./app/assignment -C 15 -L 50 -w
```

### CSV出力（詳細分析用）

```bash
lizard ./app ./components ./hooks ./lib ./types ./scripts --csv > complexity-report.csv
```

## 分析手順

### Step 1: 全体スキャンの実行

上記コマンドを実行し、閾値を超える関数を一覧化する。

### Step 2: 重症度別に分類

検出された警告をCCN値に基づいて重症度レベルに分類する。

### Step 3: リファクタリング優先順位の決定

以下の基準で優先順位を付ける：

1. **CCNが最も高い関数**（複雑度の削減効果が最大）
2. **頻繁に変更されるファイル**（`git log --oneline --follow <file> | wc -l`）
3. **テストカバレッジが低い箇所**

### Step 4: 改善案の提示

各関数に対して具体的なリファクタリング手法を提案：

- **ガード節の導入**: 早期リターンでネストを削減
- **関数の抽出**: 一つの責務に分割
- **ストラテジーパターン**: 条件分岐をポリモーフィズムで置換
- **テーブル駆動**: switch/if-else チェーンをマップに変換
- **コンポーネント分割**: 巨大なReactコンポーネントを子コンポーネントに分離

## レポート出力

スキャン完了後、以下のフォーマットでレポートを作成：

```markdown
# 複雑度監査レポート

**日時**: YYYY-MM-DD
**対象**: RoastPlus

## 結果サマリー

| 重症度 | 件数 |
|--------|------|
| 即対応（CCN 51+） | N件 |
| 危険（CCN 26-50） | N件 |
| 警告（CCN 16-25） | N件 |

## 詳細

| ファイル | 関数名 | CCN | NLOC | 重症度 | 改善案 |
|---------|--------|-----|------|--------|--------|
| `path/to/file.tsx` | `functionName` | XX | XX | 危険 | ガード節の導入 |

## 推奨アクション

1. [優先度順にアクションを列挙]
```

## ベースライン（2026-02-01 測定）

初回測定結果の上位（CCN順）：

| ファイル | 関数名 | CCN | NLOC |
|---------|--------|-----|------|
| `app/assignment/components/assignment-table/DesktopTableView.tsx` | `DesktopTableView` | 125 | 289 |
| `app/assignment/components/assignment-table/TableModals.tsx` | `TableModals` | 117 | 414 |
| `app/coffee-trivia/stats/page.tsx` | `(anonymous)` | 97 | 193 |
| `app/coffee-trivia/quiz/page.tsx` | `QuizPageContent` | 43 | 238 |
| `app/defect-beans/page.tsx` | `(anonymous)` | 39 | 49 |
| `app/assignment/components/assignment-table/MobileListView.tsx` | `MobileListView` | 39 | 107 |
| `app/progress/page.tsx` | `(anonymous)` | 39 | 36 |
| `hooks/useAppData.ts` | `(anonymous)` | 30 | 67 |
| `app/schedule/page.tsx` | `(anonymous)` | 27 | 63 |
| `app/tasting/page.tsx` | `TastingPageContent` | 26 | 310 |
