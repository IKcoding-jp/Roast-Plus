# tasklist.md — Issue #262

## フェーズ 1: 実装（3行変更）

- [x] `components/drip-guide/runner/TimerDisplay.tsx:29`
  - `text-[4.5rem]` → `text-[5.5rem]`

- [x] `components/drip-guide/runner/StepInfo.tsx:61`
  - `text-[2.25rem]` → `text-[3rem]`

- [x] `components/drip-guide/runner/StepInfo.tsx:64`
  - `text-lg` → `text-xl`

## フェーズ 2: 検証

- [x] `npm run lint && npm run build && npm run test:run` をパス（1066テスト合格）
- [x] ボトムボタンサイズが変わっていないことを確認

## フェーズ 3: PR

- [x] ブランチ: `style/#262-drip-guide-font-size`
- [x] コミット: `style(#262): ドリップガイドのタイマー・注水量フォントを拡大`
- [x] PR #263 作成・自動マージ設定

---

**ステータス**: ✅ 完了
**完了日**: 2026-02-22
