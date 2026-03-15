# タスクリスト

## フェーズ1: 画像読み込み体験の改善
- [x] `components/DefectBeanCard.tsx`: フェードイン表示
  - [x] 画像読み込み状態のstate追加（`useState`）
  - [x] `onLoad`コールバックで読み込み完了を検知
  - [x] 読み込み中はプレースホルダー背景色（`bg-surface-alt`）を表示
  - [x] 読み込み完了時に`opacity: 0 → 1`のフェードインアニメーション

## フェーズ2: 画像の優先度制御
- [x] `components/DefectBeanCard.tsx`: `index` prop追加
  - [x] 1行目（index < 5）に`priority={true}`を設定
  - [x] 2行目以降はデフォルト遅延読み込み
- [x] `app/defect-beans/page.tsx`: カードにindex値を渡す

## フェーズ3: 画像アップロード時の圧縮処理
- [x] `lib/imageCompression.ts`: 画像圧縮ユーティリティ作成
  - [x] Canvas APIでリサイズ（最大800px）
  - [x] JPEG品質80%で圧縮
  - [x] 元のアスペクト比を維持
- [x] `hooks/useDefectBeans.ts`: アップロード前に圧縮処理を挟む

## フェーズ4: テスト・検証
- [x] 画像圧縮ユーティリティのユニットテスト（8テスト）
- [x] 既存テストの修正（compressImageモック追加）
- [x] `npm run build && npm run test:run` 通過確認

## 依存関係
- フェーズ1, 2は独立して実行可能
- フェーズ3は独立して実行可能
- フェーズ4はフェーズ1-3完了後

## 見積もり
- フェーズ1: 5分
- フェーズ2: 5分
- フェーズ3: 10分
- フェーズ4: 10分
- **合計**: 約30分
