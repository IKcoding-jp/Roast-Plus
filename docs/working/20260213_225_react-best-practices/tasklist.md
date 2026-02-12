# タスクリスト

## フェーズ1: バンドルサイズ最適化（CRITICAL）
- [ ] `components/Loading.tsx` - Lottieを`next/dynamic`でSSR無効の遅延読み込みに変更
  - `import Lottie from 'lottie-react'` → `const Lottie = dynamic(() => import('lottie-react'), { ssr: false })`
  - フォールバックUIの調整

## フェーズ2: 再レンダリング最適化（MEDIUM）
- [ ] `components/drip-guide/DripGuideRunner.tsx` - 3箇所修正
  - L73: `setIsRunning(!isRunning)` → `setIsRunning(prev => !prev)`
  - L87: `setManualStepIndex(manualStepIndex + 1)` → `setManualStepIndex(prev => prev + 1)`
  - L93: `setManualStepIndex(manualStepIndex - 1)` → `setManualStepIndex(prev => prev - 1)`
- [ ] `components/ocr-time-label-editor/TimeLabelRow.tsx` - 4箇所修正
  - L53: `setEditingTime({ ...editingTime, hour: value })` → `setEditingTime(prev => ({ ...prev, hour: value }))`
  - L68: `setEditingTime({ ...editingTime, minute: value })` → `setEditingTime(prev => ({ ...prev, minute: value }))`
  - L127: `setEditingContinuesUntil({ ...editingContinuesUntil, hour: value })` → functional update
  - L141: `setEditingContinuesUntil({ ...editingContinuesUntil, minute: value })` → functional update
- [ ] `components/notifications/NotificationModal.tsx` - 3箇所修正
  - L71: `setErrors({ ...errors, title: undefined })` → `setErrors(prev => ({ ...prev, title: undefined }))`
  - L96: `setErrors({ ...errors, content: undefined })` → functional update
  - L123: `setErrors({ ...errors, date: undefined })` → functional update

## フェーズ3: デッドコード除去（LOW）
- [ ] `components/RoastScheduleMemoDialog.tsx:82-87` - 空のuseEffectを削除

## フェーズ4: localStorageスキーマバージョニング（LOW）
- [ ] `lib/localStorage.ts` - タイマー状態にバージョニング追加
  - `StoredRoastTimerState` インターフェース追加（version + state）
  - `setRoastTimerState` / `getRoastTimerState` をバージョン対応に修正
  - `setRoastTimerSettings` / `getRoastTimerSettings` をバージョン対応に修正
  - 既存データのマイグレーション処理（version未設定 → v1として扱う）

## フェーズ5: 検証
- [ ] `npm run lint` エラーゼロ確認
- [ ] `npm run test` 全テスト通過確認
- [ ] `npm run build` ビルド成功確認

## 依存関係
- フェーズ1〜4は独立して実行可能（並列化可）
- フェーズ5はフェーズ1〜4完了後に実行

## 見積もり
- AIエージェント実行: 約15分
