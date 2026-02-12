# タスクリスト

## フェーズ1: 型定義・データ追加
- [ ] `lib/theme.ts` の `ThemePreset` interfaceに `themeColor: string` を追加
- [ ] 各テーマプリセットに `themeColor` 値を設定

## フェーズ2: 動的更新ロジック
- [ ] `ThemeProvider.tsx` にテーマ変更検知 → `meta[name="theme-color"]` 更新のuseEffectを追加
- [ ] `THEME_PRESETS` からテーマIDに対応する `themeColor` を取得するヘルパー関数（or 直接参照）

## フェーズ3: 確認・微調整
- [ ] `site.webmanifest` の `background_color` を確認（現状 `#211714` → デフォルトと整合性確認）
- [ ] 全6テーマでステータスバー色が視覚的に適切か確認（実機 or DevTools）

## 依存関係
- フェーズ1 → フェーズ2（型定義後にロジック実装）
- フェーズ2 → フェーズ3（実装後に確認）

## 見積もり
- 合計: 約10分（AIエージェント実行）
