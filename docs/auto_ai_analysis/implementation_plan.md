# AIコーヒーマイスター自動分析機能

試飲記録が登録されたタイミングで自動的にAI分析を実行し、結果をアカウント（Firestore）に保存するように仕様を変更します。

## 現在の仕様
- ユーザーが「AIマイスターに分析を依頼」ボタンを押すと分析が開始
- 分析結果はクライアント側のステート（メモリ）に保持され、ページ遷移で消失

## 新しい仕様
- 試飲セッションに記録が存在する場合、自動的に分析を開始
- 分析結果は `TastingSession` オブジェクトの `aiAnalysis` フィールドとしてFirestoreに保存
- 既に分析結果がある場合は再分析せず、保存済みの結果を表示

## Proposed Changes

### [Types]

#### [MODIFY] [index.ts](file:///d:/Dev/roastplus/types/index.ts)

`TastingSession` インターフェースに以下のフィールドを追加：

```typescript
export interface TastingSession {
  // ... 既存フィールド
  aiAnalysis?: string; // AIコーヒーマイスターのコメント
  aiAnalysisUpdatedAt?: string; // 分析日時 (ISO 8601)
}
```

---

### [Firestore]

#### [MODIFY] [firestore.ts](file:///d:/Dev/roastplus/lib/firestore.ts)

`normalizeAppData` 関数で `aiAnalysis` フィールドを正規化する処理を追加。

---

### [Actions]

#### [MODIFY] [analyzeTasting.ts](file:///d:/Dev/roastplus/app/actions/analyzeTasting.ts)

- 分析結果をFirestoreに保存する機能を追加
- セッションIDを受け取り、保存できるように修正

---

### [UI Components]

#### [MODIFY] [TastingSessionCarousel.tsx](file:///d:/Dev/roastplus/components/TastingSessionCarousel.tsx)

- 「AIマイスターに分析を依頼」ボタンを廃止
- `session.aiAnalysis` が存在すればそれを表示
- `session.aiAnalysis` が存在せず、記録（`recordCount > 0`）がある場合は自動的に分析を開始
- 分析結果が更新されたらアカウントデータを更新

## Verification Plan

### Manual Verification
- ローカル環境（http://localhost:3000/tasting/）で以下の点を確認：
  - 記録がある試飲セッションを開くと、自動的に分析が開始される
  - 分析結果がFirestoreに保存される（ページリロード後も結果が表示される）
  - 既に分析結果がある場合は再分析されない
