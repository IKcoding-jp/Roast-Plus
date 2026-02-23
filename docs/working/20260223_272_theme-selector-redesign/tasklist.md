# タスクリスト: テーマセレクターのビジュアルリデザイン

**Issue**: #272
**ブランチ**: `feat/#272-theme-selector-redesign`

---

## フェーズ 1: データモデル拡張

### T1-1: `lib/theme.ts` にメタデータ追加
- [ ] `ThemePreset` インターフェースに `fontStyle`, `animationType` フィールドを追加
- [ ] 7テーマ分のデータを更新（アイコンコンポーネントは実装フェーズで設定）
- [ ] `lib/theme.test.ts` を更新（新フィールドのテスト追加）

**依存**: なし
**ファイル**: `lib/theme.ts`, `lib/theme.test.ts`

---

## フェーズ 2: アイコン選定・確認

### T2-1: react-icons の在庫確認
- [ ] 各テーマの候補アイコンが react-icons に存在するか確認
- [ ] 最終アイコンを決定し、メモに残す

| テーマ | 第1候補 | 第2候補 |
|--------|--------|--------|
| デフォルト | `TbCoffee` | `HiOutlineCup` |
| ダークロースト | `TbFlame` | `HiOutlineFire` |
| ライトロースト | `TbSun` | `HiOutlineSun` |
| 抹茶ラテ | `TbLeaf` | `PiLeafBold` |
| キャラメルマキアート | `TbDroplet` | `TbAutumn` |
| クリスマス | `TbSnowflake` | `HiOutlineSnowflake` |
| ダークモード | `TbMoon` | `HiOutlineMoon` |

**依存**: なし

---

## フェーズ 3: アニメーションコンポーネント設計

### T3-1: `/find-skills` でアニメーション専用スキルを探索（任意）
- [ ] アニメーション実装に役立つスキルがあれば確認

### T3-2: アニメーション実装計画
- [ ] Framer Motion の `motion.div` + `animate`/`transition` API を確認
- [ ] `prefers-reduced-motion` 対応方針を決定

**依存**: なし

---

## フェーズ 4: UIコンポーネント実装（/frontend-design スキル使用）

### T4-1: `ThemePreviewCard` のリデザイン
- [ ] `/frontend-design` スキルを呼び出して実装を進める
- [ ] フルイマーシブカードの基本レイアウト実装
  - [ ] カード背景色 = `previewColors.bg`
  - [ ] テーマ名の大きなタイポグラフィ（font-weight/tracking対応）
  - [ ] テーマ専用アイコン表示
  - [ ] LIGHT/DARK バッジ
  - [ ] 説明文（opacity-75）
  - [ ] 色スウォッチ（3ドット）
  - [ ] 選択チェックアイコン
- [ ] 選択状態のborderスタイル実装

**依存**: T1-1, T2-1
**ファイル**: `components/settings/ThemeSelector.tsx`

### T4-2: アンビエントアニメーション実装
- [ ] デフォルト: 湯気上昇アニメーション
- [ ] ダークロースト: 炎ゆらぎアニメーション
- [ ] ライトロースト: 粒子浮上アニメーション
- [ ] 抹茶ラテ: 葉そよぎアニメーション
- [ ] キャラメルマキアート: 光波アニメーション
- [ ] クリスマス: 雪パーティクルアニメーション
- [ ] ダークモード: 星瞬きアニメーション
- [ ] `prefers-reduced-motion` 対応

**依存**: T4-1
**ファイル**: `components/settings/ThemeSelector.tsx`

---

## フェーズ 5: テスト更新

### T5-1: `ThemeSelector.test.tsx` 更新
- [ ] 新しいカード構造のレンダリングテスト
- [ ] 各テーマのアイコン・バッジ表示テスト
- [ ] 選択状態の表示テスト

**依存**: T4-1

---

## フェーズ 6: 検証

### T6-1: ビジュアル確認（Playwright MCP）
- [ ] テーマ設定画面をスクリーンショットで確認
- [ ] 7テーマ全てのカードが正しく表示されているか確認
- [ ] アニメーションが動いているか確認

### T6-2: 品質チェック
- [ ] `npm run lint && npm run build && npm run test:run`
- [ ] 全テスト通過確認

**依存**: T4-2, T5-1

---

## 完了後

```
/fix-issue 272
```
