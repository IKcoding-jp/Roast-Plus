# tasklist.md — Issue #262

## フェーズ 1: 実装（3行変更）

- [ ] `components/drip-guide/runner/TimerDisplay.tsx:29`
  - `text-[4.5rem]` → `text-[5.5rem]`

- [ ] `components/drip-guide/runner/StepInfo.tsx:61`
  - `text-[2.25rem]` → `text-[3rem]`

- [ ] `components/drip-guide/runner/StepInfo.tsx:64`
  - `text-lg` → `text-xl`

## フェーズ 2: 検証

- [ ] `npm run lint && npm run build && npm run test:run` をパス
- [ ] `/drip-guide/run?id=recipe-046` で目視確認（タイマー・注水量が大きくなっている）
- [ ] ボトムボタンサイズが変わっていないことを確認

## フェーズ 3: PR

- [ ] ブランチ: `style/#262-drip-guide-font-size`
- [ ] コミット: `style(#262): ドリップガイドのタイマー・注水量フォントを拡大`
- [ ] PR 作成・自動マージ
