# 設計書

## 実装方針

定数ファイルで上限値を一元管理し、追加関数（handler）でバリデーション、UIコンポーネントで表示制御を行う。

### 新規作成ファイル
- `app/assignment/lib/constants.ts` — 上限定数の定義

### 変更対象ファイル
- `app/assignment/components/assignment-table/useTableEditing.ts` — `handleAddTeam`, `handleAddTaskLabel` に上限チェック追加
- `app/assignment/hooks/useAssignmentHandlers.ts` — `handleAddMember` に上限チェック追加
- `app/assignment/components/assignment-table/DesktopTableView.tsx` — 班追加ボタン・作業追加行の条件付きレンダリング
- `app/assignment/components/assignment-table/MobileListView.tsx` — 必要に応じてモバイル側も対応
- `app/assignment/components/assignment-table/AssignmentTable.tsx` — 上限判定用のpropsを必要に応じて追加
- `app/assignment/components/assignment-table/TableModals.tsx` — メンバー追加UIの条件付きレンダリング

## API設計

### 定数定義

```typescript
// app/assignment/lib/constants.ts
export const MAX_TEAMS = 4;
export const MAX_TASK_LABELS = 8;
export const MAX_MEMBERS = 15;
```

### 上限チェックパターン

```typescript
// useTableEditing.ts — handleAddTeam内
const handleAddTeam = useCallback(async () => {
    if (teams.length >= MAX_TEAMS) {
        // Toast表示
        return;
    }
    // 既存の追加ロジック
}, [teams, ...]);
```

### Toast通知

既存の `components/Toast.tsx` を使用。表示メッセージ例:
- 「班は最大4つまでです」
- 「作業は最大8つまでです」
- 「メンバーは最大15名までです」

## UI設計

### 班追加ボタン（DesktopTableView）
- 現状: ヘッダー右端の「+」IconButton で常に表示
- 変更: `teams.length >= MAX_TEAMS` のとき非表示

### 作業ラベル追加行（DesktopTableView）
- 現状: テーブル最下行に入力フィールド＋「+」ボタンが常に表示
- 変更: `taskLabels.length >= MAX_TASK_LABELS` のとき入力フィールドと「+」ボタンを非表示（シャッフルボタンは残す）

### メンバー追加（TableModals）
- 現状: セルタップ時のメンバー選択メニュー内に「新規メンバー追加」
- 変更: `members.length >= MAX_MEMBERS` のとき非表示

### 使用する共通コンポーネント
- `Toast`（既存） — 上限到達時の通知
- `Button`, `IconButton`, `Input`（既存） — 変更なし、表示制御のみ

## 影響範囲
- `app/assignment/` 配下のみに閉じた変更
- Firestoreスキーマ変更なし
- シャッフルロジック変更なし
- 既存データが上限超過していても、表示・削除は正常動作（追加のみ制限）

## UI実装ルール確認
- [x] 共通コンポーネント使用（`@/components/ui`）
- [x] テーマ対応: セマンティックCSS変数使用
- [x] ハードコード色の禁止

## 禁止事項チェック
- [x] 独自CSSでボタン/カード/入力を作らない
- [x] 新しい状態管理ライブラリを導入しない
- [x] 設計方針を変更しない

## ADR

### Decision-001: クライアント側のみで制限
- **理由**: 社内8名チームの業務ツールであり、悪意あるアクセスの考慮不要。Firestore Security Rulesでの制限は過剰
- **影響**: クライアント側コードの変更のみで完結。Firebase側の変更不要

### Decision-002: 上限到達時はボタン非表示 + Toast通知
- **理由**: ボタン非表示だけだと「なぜ追加できないのか」がわからない。Toastで理由を明示
- **影響**: Toast コンポーネントの呼び出しが追加される
