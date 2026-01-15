---
name: code-review-assist
description: コード品質チェックと改善提案。Lintエラー修正、未使用コード削除、リファクタリング時に使用。警告、unused、refactor時に使用。
---

# コードレビュー支援スキル

コード品質の向上とリファクタリングを支援するスキルです。

---

## このスキルを使用するタイミング

- Lintエラー・警告を修正するとき
- 未使用コードを削除するとき
- コードをリファクタリングするとき
- コードレビューを行うとき

---

## 1. Lint修正

### Next.js / TypeScript
```bash
# Lint実行
npm run lint

# 自動修正
npm run lint -- --fix

# 型チェック
npx tsc --noEmit
```

### Flutter / Dart
```bash
# 解析
flutter analyze

# 自動修正
dart fix --apply

# フォーマット
dart format .
```

---

## 2. よくある警告と修正

### 未使用インポート
```typescript
// ❌ 警告
import { unused } from 'module';

// ✅ 修正: 削除する
```

### 未使用変数
```typescript
// ❌ 警告
const unusedVar = 'value';

// ✅ 修正: 削除またはアンダースコア
const _intentionallyUnused = 'value';
```

### any型の使用
```typescript
// ❌ 警告
const data: any = response;

// ✅ 修正: 適切な型を定義
interface ResponseData { ... }
const data: ResponseData = response;
```

---

## 3. 未使用コード検出

### 検索パターン
```bash
# 未使用エクスポートを検索
npx ts-prune

# 未使用依存関係
npx depcheck
```

### 削除チェックリスト
- [ ] 関数/クラスが他で参照されていないか
- [ ] エクスポートが外部で使用されていないか
- [ ] テストでのみ使用されていないか
- [ ] 将来的に必要になる可能性はないか

---

## 4. リファクタリングパターン

### 関数の抽出
```typescript
// Before
function process() {
  // 長い処理A
  // 長い処理B
}

// After
function processA() { /* 処理A */ }
function processB() { /* 処理B */ }
function process() {
  processA();
  processB();
}
```

### 条件分岐の簡略化
```typescript
// Before
if (condition) {
  return true;
} else {
  return false;
}

// After
return condition;
```

### マジックナンバーの定数化
```typescript
// Before
if (count > 10) { ... }

// After
const MAX_ITEMS = 10;
if (count > MAX_ITEMS) { ... }
```

---

## 5. コードレビューチェックリスト

### 可読性
- [ ] 変数名が意図を表しているか
- [ ] 関数が単一責任か
- [ ] コメントは「なぜ」を説明しているか

### 保守性
- [ ] DRY原則に従っているか
- [ ] 結合度が低いか
- [ ] テストが書きやすい構造か

### パフォーマンス
- [ ] 不要な再計算がないか
- [ ] メモリリークの可能性はないか
- [ ] N+1問題がないか

### セキュリティ
- [ ] 入力のバリデーションがあるか
- [ ] 機密情報がハードコードされていないか
- [ ] SQLインジェクション対策があるか

---

## 6. 自動フォーマット設定

### Prettier (.prettierrc)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### ESLint (.eslintrc)
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn"
  }
}
```

---

## AI アシスタント指示

1. **警告を全て読む**: エラーメッセージを理解
2. **影響範囲を確認**: 削除・変更の影響を把握
3. **段階的に修正**: 一度に大量の変更を避ける
4. **テスト実行**: 修正後にテストを確認

**必ず守ること**:
- 未使用コードは躊躇せず削除
- 型は明示的に定義
- フォーマットは自動ツールに任せる

**避けること**:
- @ts-ignore の乱用
- any型の安易な使用
- 警告の無視
