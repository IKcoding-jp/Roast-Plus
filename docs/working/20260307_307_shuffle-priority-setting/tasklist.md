# タスクリスト

**ステータス**: ✅ 完了
**完了日**: 2026-03-07

## フェーズ1: データモデル・型定義
- [x] `types/team.ts` の `ShuffleSettings` に `priority: 'pair' | 'row'` 追加
- [x] `app/assignment/lib/firebase/helpers.ts` の `DEFAULT_SHUFFLE_SETTINGS` 更新（`priority: 'pair'`）

## フェーズ2: シャッフルアルゴリズム拡張
- [x] `app/assignment/lib/shuffle.ts` に `row_strict` / `row_hard` / `row_only` 制約レベル追加
  - [x] `ConstraintLevel` 型に3つの新レベルを追加
  - [x] `hasRowConflict` に `row_*` レベル用のロジック追加
  - [x] `hasPairConflict` に `row_*` レベル用のロジック追加
- [x] `calculateAssignment` に `priority` パラメータ追加
- [x] `priority` に応じた `levels` 配列の切り替え実装

## フェーズ3: Firestore連携
- [x] `app/assignment/lib/firebase/settings.ts` の `subscribeShuffleSettings` が `priority` を含むデータを正しく読み込むことを確認
  - 既存の `...DEFAULT_SHUFFLE_SETTINGS, ...data` パターンで自動対応済み

## フェーズ4: UI実装
- [x] `app/assignment/components/AssignmentSettingsModal.tsx` にラジオボタンUI追加
  - [x] 「シャッフルの優先順位」セクション追加（「班をまたいでシャッフル」の下）
  - [x] 2つのラジオボタン + 説明テキスト
  - [x] `onUpdateShuffleSettings({ priority: value })` で即時保存

## フェーズ5: 結合
- [x] `app/assignment/hooks/useShuffleExecution.ts` で `shuffleSettings.priority` を `calculateAssignment` に渡す

## フェーズ6: テスト
- [x] `app/assignment/lib/shuffle.test.ts` にrow優先モードのテスト追加
  - [x] row優先時に行の連続回避がペアより優先されるケース
  - [x] pair優先時に従来と同じ動作になるケース
  - [x] デフォルト（priority未指定）でペア優先になるケース
- [x] lint / build / test パス確認

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3 → フェーズ5（順次実行）
- フェーズ4 は フェーズ1 完了後に並行実行可能
- フェーズ6 は フェーズ2, 4 完了後

## 見積もり
- フェーズ1: 5分
- フェーズ2: 15分
- フェーズ3: 5分
- フェーズ4: 10分
- フェーズ5: 5分
- フェーズ6: 15分
- **合計**: 約55分
