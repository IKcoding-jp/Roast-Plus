# タスクリスト — Issue #274 テーマプレビューカード個性強化 v2

**ステータス**: ✅ 完了
**完了日**: 2026-02-23

## ブランチ

```
git checkout -b style/#274-theme-preview-card-v2
```

## タスク

### Phase 1: lib/theme.ts 変更

- [x] **T1** `ThemePreset` 型に `bgGradient: string` フィールドを追加
- [x] **T2** 全7テーマのプリセットに `bgGradient` 値を設定
  - default: `linear-gradient(135deg, #261a14 0%, #3d2008 100%)`
  - dark-roast: `linear-gradient(135deg, #0d0b09 0%, #200a04 100%)`
  - light-roast: `linear-gradient(135deg, #faf6ef 0%, #ede0c8 100%)`
  - matcha: `linear-gradient(135deg, #0f1f15 0%, #041a09 100%)`
  - caramel: `linear-gradient(135deg, #1a120d 0%, #2e1200 100%)`
  - christmas: `linear-gradient(135deg, #051a0e 0%, #100520 100%)`
  - dark: `linear-gradient(135deg, #0f0f0f 0%, #0f1020 100%)`
- [x] **T3** `lib/theme.test.ts` に `bgGradient` フィールドの存在確認テストを追加

### Phase 2: ThemeSelector.tsx — アニメーション強化

- [x] **T4** `SteamAnimation`: opacity `[0, 0.35, 0]` → `[0, 0.65, 0]`
- [x] **T5** `FlameAnimation`: opacity `[0.08, 0.2, 0.08]` → `[0.3, 0.65, 0.3]`、scale `[1, 1.1, 1]` → `[1, 1.35, 1]`
- [x] **T6** `LeafAnimation`: opacity 固定`0.12` → アニメ`[0.15, 0.35, 0.15]`、rotate `[-4,4,-4]` → `[-10,10,-10]`
- [x] **T7** `GlowAnimation`: 色強度 `${color}22` → `${color}55`
- [x] **T8** `SnowAnimation`: opacity `0.65` → `0.9`
- [x] **T9** `StarsAnimation`: opacity `[0.8, 0.1, 0.8]` → `[1, 0.05, 1]`

### Phase 3: ThemeSelector.tsx — カードレイアウト変更

- [x] **T10** `ThemePreviewCard` の背景を `bgGradient` で描画（`style={{ background: preset.bgGradient }}`）
- [x] **T11** 右下に大型背景アイコンを追加（`<Icon size={90} style={{ color: accent, opacity: 0.10 }} aria-hidden />`）
- [x] **T12** 上部行からバッジを削除し、アイコン単独配置に変更
- [x] **T13** 下部バーにバッジを追加（スウォッチ左端: `[LIGHT/DARK][●●●]────[✓]`）

### Phase 4: 検証

- [x] **T14** `npm run lint && npm run build && npm run test:run` がゼロエラーで通過
- [x] **T15** Playwright MCP で実際の表示を確認（各テーマの個性・バッジ位置）

## 依存関係

T10 は T1-T2 完了後
T12-T13 は T10 完了後
T14-T15 は全タスク完了後
