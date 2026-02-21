# Working Documents テンプレート

## 目次

1. [requirement.md（要件定義）](#requirementmd要件定義)
2. [tasklist.md（タスクリスト）](#tasklistmdタスクリスト)
3. [design.md（設計書）](#designmd設計書)
4. [testing.md（テスト計画）](#testingmdテスト計画)

---

## requirement.md（要件定義）

```markdown
# 要件定義

**Issue**: #123
**作成日**: YYYY-MM-DD
**ラベル**: enhancement

## ユーザーストーリー
ユーザー「[セリフ形式]」
アプリ「[期待する動作]」

## 要件一覧
### 必須要件
- [ ] 要件1

### オプション要件
- [ ] 要件2

## 受け入れ基準
- [ ] 基準1
```

---

## tasklist.md（タスクリスト）

```markdown
# タスクリスト

## フェーズ1: [フェーズ名]
- [ ] タスク1
- [ ] タスク2

## フェーズ2: [フェーズ名]
- [ ] タスク3

## 依存関係
- フェーズ1 → フェーズ2（順次実行）
```

---

## design.md（設計書）

```markdown
# 設計書

## 実装方針

### 変更対象ファイル
- `path/to/file.ts` - [変更内容]

### 新規作成ファイル
- `path/to/new.ts` - [役割]

## 影響範囲
- [影響を受けるコンポーネント]

## 禁止事項チェック
- 独自CSS生成しない
- 設計方針を変更しない
```

---

## testing.md（テスト計画）

```markdown
# テスト計画

## テスト戦略

### ユニットテスト
- `path/to/file.test.ts`
  - テストケース1
  - テストケース2

## カバレッジ目標
- 対象ディレクトリ: 80%以上
```
