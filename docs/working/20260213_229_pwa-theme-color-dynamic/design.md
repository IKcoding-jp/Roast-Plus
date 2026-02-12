# 設計書

## 実装方針

### アプローチ
テーマ変更時に JavaScript で `<meta name="theme-color">` のcontent属性を動的に書き換える。
各テーマに `themeColor` プロパティを追加し、ThemeProvider内でテーマ変更検知 → metaタグ更新を行う。

### テーマ別カラーマッピング

| テーマID | themeColor | 根拠 |
|---------|-----------|------|
| `default` | `#261a14` | header-bg（ダークコーヒー色） |
| `christmas` | `#051a0e` | page（ダークグリーン、全体基調色） |
| `dark-roast` | `#0d0b09` | page = header-bg（ダークエスプレッソ） |
| `light-roast` | `#6b5d4f` | header-bg（ブラウン系ヘッダー） |
| `matcha` | `#0f1f15` | page = header-bg（ダークグリーン） |
| `caramel` | `#1a120d` | page = header-bg（キャラメルダーク） |

**方針**: header-bgを基本とし、ページ全体の色調と統一感がある色を選択。

### 変更対象ファイル
- `lib/theme.ts` - ThemePreset型に `themeColor` プロパティ追加、各プリセットに値設定
- `components/ThemeProvider.tsx` - テーマ変更時の `meta[name="theme-color"]` 動的更新ロジック追加
- `app/layout.tsx` - 静的 `viewport.themeColor` は残す（SSR初期表示用のフォールバック）

### 新規作成ファイル
なし

## 影響範囲
- `ThemeProvider.tsx` にuseEffect追加（テーマ変更監視）
- `lib/theme.ts` の ThemePreset 型拡張（後方互換あり）
- PWAのシステムUI表示のみ変更。アプリ内のレンダリングには影響なし

## 禁止事項チェック
- ❌ 独自CSSで直接ステータスバー色を制御しない（meta tagで制御）
- ❌ next-themes以外のテーマ管理を導入しない
- ❌ `app/layout.tsx` の静的themeColorを削除しない（SSRフォールバック用に残す）
