## 概要

Issue #64 を解決し、コードの重複を解消してDRY原則に従った保守性の高いコードベースに改善しました。

## 変更内容

### 1. ROAST_LEVELS定数の統一
- **削除**: 6ファイルから重複定義を削除
  - `components/TastingSessionList.tsx`
  - `components/TastingSessionForm.tsx`
  - `components/TastingRecordForm.tsx`
  - `components/RoastRecordList.tsx`
  - `components/RoastRecordForm.tsx`
  - `components/roast-timer/constants.ts` (ファイル削除)
- **統一**: `lib/constants.ts`から一元管理

### 2. ユーティリティ関数の統合
- **新規作成**: `lib/utils.ts`
  - `convertToHalfWidth()` - 全角数字→半角数字変換
  - `removeNonNumeric()` - 数字以外の文字削除
- **削除**: `components/roast-timer/utils.ts` (lib/に移動)
- **修正**: ローカル定義を削除してインポートに変更

### 3. 日付フォーマット処理の統一
- **新規作成**: `lib/dateUtils.ts`
  - `formatDateString()` - YYYY-MM-DD形式に変換
- **置換**: `.toISOString().split('T')[0]` の繰り返し処理を関数呼び出しに統一
- **対象ファイル**:
  - `components/RoastRecordForm.tsx`
  - `components/TastingSessionForm.tsx`
  - `components/TastingRecordForm.tsx`

## テスト

- [x] `npm run lint` が通ること
- [x] `npm run build` が通ること
- [x] 型エラーがないこと
- [x] インポートパスが正しいこと

## 技術的な詳細

- **as const パターン**: `lib/constants.ts`では`as const`を使用し、より型安全なアプローチを採用
- **バレルエクスポート**: `components/roast-timer/index.ts`の不要な再エクスポートを削除
- **エイリアスインポート**: `DEFAULT_DURATIONS`を`DEFAULT_DURATION_BY_WEIGHT`としてインポート(互換性維持)

## 影響範囲

- 11ファイル変更
- 83行削減、33行追加
- コード重複率の大幅な改善

Closes #64
