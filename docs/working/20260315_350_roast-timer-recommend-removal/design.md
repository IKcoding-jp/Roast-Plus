# 設計書

## 実装方針

### 変更対象ファイル
- `types/timer.ts` - `goToRoastRoomTimeSeconds`フィールド削除
- `lib/roastTimerUtils.ts` - `calculateRecommendedTime`関数削除
- `lib/roastTimerSettings.ts` - デフォルト値から該当フィールド削除
- `lib/firestore/common.ts` - 正規化処理から該当フィールド削除
- `components/RoastTimerSettings.tsx` - NumberInput UI削除
- `lib/roastTimerUtils.test.ts` - 関連テスト削除
- `lib/roastTimerSettings.test.ts` - 関連テスト修正
- `lib/firestore/common.test.ts` - 関連テスト修正

### 新規作成ファイル
- なし

## 削除対象の詳細

### 1. 型定義（types/timer.ts）

```typescript
// 削除前
export interface RoastTimerSettings {
  goToRoastRoomTimeSeconds: number;  // ← 削除
  timerSoundEnabled: boolean;
  timerSoundFile: string;
  // ...
}

// 削除後
export interface RoastTimerSettings {
  timerSoundEnabled: boolean;
  timerSoundFile: string;
  // ...
}
```

### 2. 計算関数（lib/roastTimerUtils.ts）

`calculateRecommendedTime`関数を丸ごと削除。この関数の呼び出し箇所も削除。

### 3. 設定UI（components/RoastTimerSettings.tsx）

159〜175行のNumberInputブロック（「焙煎室に行くまでの時間（秒）」）を削除。

### 4. Firestore正規化（lib/firestore/common.ts）

`normalizeAppData`内の`goToRoastRoomTimeSeconds`正規化行を削除。

## 後方互換性

### LocalStorage
- `getRoastTimerSettings()`は`localStorage.getItem`→`JSON.parse`→型にマッピング
- 古いデータに`goToRoastRoomTimeSeconds`が残っていても、TypeScriptの型から消えるだけで実行時エラーにはならない
- `JSON.parse`は余分なフィールドを無視する（destructuringで必要なフィールドのみ取得する設計なら問題なし）

### Firestore
- `normalizeAppData`から該当フィールドの正規化を削除
- Firestoreドキュメントに残る古いフィールドはクライアントで無視される（TypeScript型に含まれないフィールドは参照されない）

## 影響範囲
- ローストタイマー設定画面: 設定項目1つ減少
- おすすめ焙煎時間表示: 機能廃止（関連UI削除）
- 他の機能への影響なし

## 禁止事項チェック
- [x] 独自CSSでボタン/カード/入力を作らない（削除のみのため該当なし）
- [x] 新しい状態管理ライブラリを導入しない
- [x] 設計方針を変更しない

## ADR（この設計の決定事項）

### Decision-001: おすすめ機能の完全廃止
- **理由**: 焙煎室移動時間の概念が運用上不要になったため、設定UIだけでなく計算ロジックごと廃止
- **影響**: `calculateRecommendedTime`呼び出し箇所のUI（推奨時間表示）も削除が必要

### Decision-002: 既存データのマイグレーション不要
- **理由**: 古いフィールドがLocalStorage/Firestoreに残っていても実行時エラーにならない。明示的なデータクリーンアップは不要
- **影響**: 古いデータが残り続けるが、参照されないため無害
