# 設計書

## 実装方針

ダイアログ関連のコードをクリーン削除する。完了画面自体（`TimerDisplay` + `TimerControls` のcompleted状態）は変更不要。

### 削除対象ファイル
- `components/RoastTimerDialogs.tsx` - ダイアログ3コンポーネント（CompletionDialog, ContinuousRoastDialog, AfterPurgeDialog）
- `hooks/useRoastTimerDialogs.ts` - ダイアログ管理フック（状態管理、Firestore同期、ハンドラ）

### 変更対象ファイル
- `types/timer.ts` - `RoastTimerDialogState` 型削除、`RoastTimerState.dialogState` プロパティ削除
- `hooks/roast-timer/useTimerUpdater.ts:69` - `completeTimer` 内の `dialogState: 'completion'` を削除
- `components/RoastTimer.tsx` - ダイアログimport削除、`useRoastTimerDialogs`呼び出し削除、ダイアログ描画（行125-139）削除
- `hooks/useRoastTimer.test.ts` - ダイアログ関連のモック・テストがあれば削除

## データモデル

### 型変更

```typescript
// 削除: RoastTimerDialogState 型
// before
export type RoastTimerDialogState = 'completion' | 'continuousRoast' | 'afterPurge' | null;

// after
// (型自体を削除)

// RoastTimerState から dialogState プロパティを削除
// before
export interface RoastTimerState {
  // ...
  dialogState?: RoastTimerDialogState;
}

// after
export interface RoastTimerState {
  // ... (dialogState なし)
}
```

### Firestore互換性
- 既存ドキュメントに `dialogState` フィールドが残るが、TypeScript型から外すだけで実害なし
- Firestoreはスキーマレスなので、未定義フィールドは自然に無視される

## 影響範囲
- ローストタイマー機能のみ（`app/roast-timer/`, `components/RoastTimer*`, `hooks/*RoastTimer*`）
- 他ページ・他機能への影響なし

## ADR

### Decision-001: dialogState を型から完全削除
- **理由**: Firestore上の既存データとの互換性は、スキーマレスDBの特性で自然に担保される。型を残すとデッドコード扱いになる
- **影響**: Firestoreの既存ドキュメントに `dialogState` フィールドが残るが、読み取り時に無視される
