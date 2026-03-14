# タスクリスト: テーマ設定画面パターンBデザイン刷新

## Issue #338

---

## Phase 1: 型定義・データ更新 (`lib/theme.ts`)

- [ ] `ThemeAnimationType` 型を削除
- [ ] `ThemePreset` インターフェースから `animationType` / `bgGradient` / `fontStyle` を削除
- [ ] `ThemePreset` に `previewGradient: string` を追加（ドット用CSSグラデーション）
- [ ] `THEME_PRESETS` の各テーマデータを更新
  - 削除: animationType, bgGradient, fontStyle
  - 追加: previewGradient（確定済みグラデーション値）

## Phase 2: コンポーネント書き換え (`components/settings/ThemeSelector.tsx`)

- [ ] アニメーションコンポーネント7種を全削除 (SteamAnimation, FlameAnimation, ParticlesAnimation, LeafAnimation, GlowAnimation, SnowAnimation, StarsAnimation)
- [ ] `ThemeAnimation` ルーターコンポーネントを削除
- [ ] `framer-motion` のimportを削除
- [ ] `useReducedMotion` のimportを削除
- [ ] テーマアイコンマップ(`THEME_ICONS`)を削除
- [ ] react-icons/tb のimportを削除
- [ ] `ThemePreviewCard` をパターンBに書き換え:
  - カラードット（48px丸、previewGradient使用、内側リング）
  - テーマ名（15px bold）
  - 説明文（12.5px）
  - 選択チェック（右上、absolute配置）
- [ ] `ThemeSelector` のグリッドを更新:
  - `grid-cols-2 sm:grid-cols-4`
  - `gap-2.5 sm:gap-3`
  - max-widthはページ側で制御

## Phase 3: ページレイアウト更新 (`app/settings/theme/page.tsx`)

- [ ] `max-w-4xl` → `max-w-5xl` に変更（960px相当）

## Phase 4: テスト更新 (`components/settings/ThemeSelector.test.tsx`)

- [ ] アニメーション関連のテストを削除/更新
- [ ] 新しいカード構造に合わせてテスト更新:
  - 7テーマが表示される
  - `aria-pressed` で選択状態が管理される
  - 選択チェックが表示される
  - カラードットが表示される
- [ ] LIGHT/DARKバッジ、色スウォッチのテストを削除

## Phase 5: 検証

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run test:run`
- [ ] design-preview.html と実装の見た目を比較確認

---

**ステータス**: ✅ 完了
**完了日**: 2026-03-14

## 依存関係

```
Phase 1 → Phase 2 → Phase 3 (並行可) → Phase 4 → Phase 5
```

Phase 1（型変更）が完了してからPhase 2（コンポーネント）に着手。
Phase 3はPhase 2と並行可能。
