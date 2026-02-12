# タスクリスト

**ステータス**: 完了
**完了日**: 2026-02-13

## フェーズ1: 型定義・データ追加
- [x] `lib/theme.ts` の `ThemePreset` interfaceに `themeColor: string` を追加
- [x] 各テーマプリセットに `themeColor` 値を設定

## フェーズ2: 動的更新ロジック
- [x] `ThemeProvider.tsx` にテーマ変更検知 → `meta[name="theme-color"]` 更新のuseEffectを追加
- [x] `THEME_PRESETS` からテーマIDに対応する `themeColor` を取得するヘルパー関数

## フェーズ3: 確認・微調整
- [x] `site.webmanifest` の `background_color` を `#261a14` に統一
- [x] `app/layout.tsx` の静的themeColorも `#261a14` に統一

## 依存関係
- フェーズ1 → フェーズ2（型定義後にロジック実装）
- フェーズ2 → フェーズ3（実装後に確認）

## 見積もり
- 合計: 約10分（AIエージェント実行）
