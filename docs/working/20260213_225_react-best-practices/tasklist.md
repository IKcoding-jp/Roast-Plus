# タスクリスト

**ステータス**: 完了
**完了日**: 2026-02-13

## フェーズ1: バンドルサイズ最適化（CRITICAL）
- [x] `components/Loading.tsx` - Lottieを`next/dynamic`でSSR無効の遅延読み込みに変更

## フェーズ2: 再レンダリング最適化（MEDIUM）
- [x] `components/drip-guide/DripGuideRunner.tsx` - 3箇所修正
- [x] `components/ocr-time-label-editor/TimeLabelRow.tsx` - 4箇所修正
- [x] `components/notifications/NotificationModal.tsx` - 3箇所修正

## フェーズ3: デッドコード除去（LOW）
- [x] `components/RoastScheduleMemoDialog.tsx` - 空のuseEffectを削除

## フェーズ4: localStorageスキーマバージョニング（LOW）
- [x] `lib/localStorage.ts` - タイマー状態/設定にバージョニング追加（レガシーデータ互換）

## フェーズ5: 検証
- [x] `npm run lint` エラーゼロ確認
- [x] `npm run test` 全テスト通過確認（1014テスト）
- [x] `npm run build` ビルド成功確認（53ページ）
- [x] コードレビュー通過（問題なし）
