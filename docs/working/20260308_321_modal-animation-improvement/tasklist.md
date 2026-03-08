# タスクリスト

## フェーズ1: デザインラボ比較セクション追加
- [x] `ModalAnimations.tsx` 新規作成（5パターン比較UI）
  - [x] Current（scale: 0.5→1, spring damping: 20）
  - [x] Fade Only（opacity: 0→1, duration: 0.2）
  - [x] Fade + Subtle Scale（scale: 0.95→1 + opacity, ease-out）
  - [x] Slide Up（y: 30→0 + opacity, ease-out）
  - [x] Slide Up + Spring（y: 40→0 + opacity, spring）
- [x] `registry.ts` にセクション登録
- [x] `page.tsx` にコンポーネント登録

## フェーズ2: ユーザー選定 → Modal.tsx適用
- [x] ユーザーがデザインラボで選定 → **Slide Up** を採用
- [x] Modal.tsx のアニメーション設定を変更
- [x] Dialog.tsx の動作確認（Modalを基盤としているため自動反映）

## フェーズ3: 検証
- [x] lint / build / test パス確認

**ステータス**: ✅ 完了
**完了日**: 2026-03-08

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3（順次実行）

## 見積もり
- フェーズ1: 10分
- フェーズ2: 5分
- フェーズ3: 5分
- **合計**: 20分
