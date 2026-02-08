# 要件定義: 更新履歴ページの共通UI化とテーマシステム対応

## Issue
- **番号**: #142
- **タイトル**: refactor(changelog): 更新履歴ページの共通UI化とテーマシステム対応

## 背景
更新履歴ページ（`app/changelog/`）が独自UIで構築されており、共通UIコンポーネント（`@/components/ui`）とCSS変数ベースのテーマシステムに未対応。

## 要件

### 1. 共通UIコンポーネント化
- ページの戻るリンク → `BackLink` コンポーネントに置換
- フィルターカード → `Card` コンポーネントに置換
- フィルターボタン → テーマ対応のCSS変数ベースに更新
- クリアボタン → `Button` ghost variantに置換

### 2. テーマ対応（3レイヤー）

#### レイヤー1: ページ背景
- `bg-page` で背景を統一（既に `bg-page` 適用済み → 確認のみ）

#### レイヤー2: コンテナ/カード背景
- フィルターカード: `bg-white` → `Card` コンポーネント
- フッターボーダー: `border-gray-200` → `border-edge`

#### レイヤー3: テキスト・アイコン色
- 見出し: `text-gray-800` → `text-ink`
- 副テキスト: `text-gray-500` → `text-ink-muted`
- アイコン: `text-amber-500` → `text-spot`
- フィルターラベル: `text-gray-500` → `text-ink-muted`
- 非選択フィルター: `bg-gray-100 text-gray-500` → `bg-ground text-ink-muted`
- フッターテキスト: `text-gray-400` → `text-ink-muted`

### 3. CHANGE_TYPE_CONFIG の色定義
- フィルターのハードコードされたTailwindクラス（`bg-emerald-100 text-emerald-700`等）はそのまま維持
  - 理由: 変更タイプの色はセマンティックカラーであり、テーマと独立

## 受け入れ基準
- [ ] 共通UIコンポーネント（BackLink, Card, Button）を使用
- [ ] CSS変数（bg-page, text-ink, text-ink-muted, text-spot, bg-ground, border-edge）でテーマ対応
- [ ] lint / build / test 通過
- [ ] 通常モード・クリスマスモード両方で正常表示
