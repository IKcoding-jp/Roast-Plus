# タスクリスト

**Issue**: #177
**更新日**: 2026-02-07

## パートA: モック閲覧・比較ツール

### フェーズA1: ページ基盤（推定: 15分）
- [ ] `app/dev/design-lab/page.tsx` を作成（Lab/Builderタブ切替）
- [ ] `app/dev/design-lab/components/registry.ts` にセクション定義
- [ ] `app/dev/design-lab/components/SectionNav.tsx` TOCナビゲーション
  - IntersectionObserverで現在セクションハイライト
  - スムーズスクロール
- [ ] ダッシュボードレイアウト
- [ ] クリスマスモード切り替えボタン

### フェーズA2: セクション実装（推定: 25分）
- [ ] セクション1: `ComponentGallery.tsx`（既存registry流用）
- [ ] セクション2: `AnimationShowcase.tsx`（既存splash patterns流用）
- [ ] セクション3: `PageMockups.tsx`（レジストリ方式、初期は空テンプレート）
- [ ] セクション4: `ColorPalette.tsx`（CSS変数可視化）
- [ ] セクション5: `Typography.tsx`（フォント一覧）
- [ ] セクション6: `ComponentVariations.tsx`（初期は空テンプレート）

### フェーズA3: プレビュー機能（推定: 15分）
- [ ] `PatternComparison.tsx` パターン並列比較
- [ ] `ResponsivePreview.tsx` レスポンシブプレビュー（375/768/1280px）
- [ ] `FullscreenPreview.tsx` フルスクリーンモーダル

## パートB: フリーキャンバスD&Dデザインビルダー

### フェーズB1: 基盤・型定義（推定: 20分）
- [ ] `types/design-lab.ts` デザインデータ型定義
- [ ] `lib/design-lab/schema.ts` JSON Schema・バリデーション
- [ ] `lib/design-lab/element-registry.ts` 配置可能要素レジストリ
  - 既存UIコンポーネント21種の定義（名前、デフォルトprops、アイコン）
  - 基本HTML要素の定義（div, p, img, hr等）
- [ ] @dnd-kit/core, @dnd-kit/utilities インストール

### フェーズB2: キャンバス実装（推定: 30分）
- [ ] `Canvas.tsx` フリーキャンバス本体
  - 無限キャンバス（パン対応）
  - ズーム機能（ホイール + ボタン）
  - グリッド表示・スナップ
  - 背景色設定
- [ ] `CanvasElement.tsx` キャンバス上の各要素
  - position: absolute + transform で配置
  - 選択状態のハイライト
  - リサイズハンドル（8方向）
  - ドラッグ移動
- [ ] 複数選択（Shift+クリック）
- [ ] キーボードショートカット（Delete削除、Ctrl+Z undo）

### フェーズB3: 要素パレット（推定: 15分）
- [ ] `ElementPalette.tsx` 左サイドバー
  - UIコンポーネントカテゴリ（ボタン、フォーム、コンテナ等）
  - HTML要素カテゴリ（テキスト、画像、レイアウト等）
  - 検索・フィルタ
  - パレットからキャンバスへのD&D

### フェーズB4: プロパティエディタ（推定: 25分）
- [ ] `PropertyEditor.tsx` 右サイドバー
  - Props編集セクション
    - コンポーネント固有props（variant, size, label等）を動的フォーム生成
  - スタイル編集セクション
    - 余白（margin, padding）
    - 色（背景色、テキスト色、ボーダー色）
    - フォント（サイズ、ウェイト、行間）
    - ボーダー（幅、スタイル、角丸）
  - アニメーション設定セクション
    - タイプ選択（fadeIn, slideUp, scale, custom）
    - duration, delay, easing
  - イベントハンドラ設定セクション
    - onClick, onHover の動作定義

### フェーズB5: レイヤーパネル（推定: 10分）
- [ ] `LayerPanel.tsx`
  - 要素一覧（z-index順）
  - D&Dで順序変更
  - 表示/非表示トグル
  - ロック/アンロックトグル
  - 要素名の編集

### フェーズB6: ツールバー（推定: 10分）
- [ ] `Toolbar.tsx`
  - 保存ボタン
  - 読み込みボタン
  - ズーム操作（+/-/リセット）
  - グリッド切り替え
  - プレビューモード切替
  - Undo/Redo
  - JSON インポート/エクスポート

### フェーズB7: Firestoreデータ管理（推定: 20分）
- [ ] `lib/design-lab/firestore.ts` CRUD操作
  - createProject
  - getProject
  - updateProject
  - deleteProject
  - listProjects（ユーザー別）
- [ ] `ProjectManager.tsx` プロジェクト管理UI
  - プロジェクト一覧
  - 新規作成ダイアログ
  - 削除確認ダイアログ
  - 検索

### フェーズB8: Claude Codeデザイン生成連携（推定: 10分）
- [ ] JSONインポート機能（テキストエリアにペースト or ファイルアップロード）
- [ ] JSONエクスポート機能
- [ ] Claude Code用デザインデータテンプレート（スキル参考資料として）

## パートC: 統合・移行

### フェーズC1: 統合（推定: 10分）
- [ ] `app/settings/page.tsx` のリンク更新
- [ ] `app/ui-test/page.tsx` リダイレクト化
- [ ] `app/dev/splash-preview/page.tsx` リダイレクト化

### フェーズC2: 品質チェック（推定: 10分）
- [ ] Lintエラー・warningゼロ確認
- [ ] ビルド成功確認
- [ ] 動作確認（開発者モードON/OFF）
- [ ] D&Dビルダー動作確認
- [ ] Firestore保存・読込確認

## 依存関係
- フェーズA1 → A2 → A3（順次）
- フェーズB1 → B2 → B3, B4, B5（B2以降は並行可能）
- フェーズB6はB2に依存
- フェーズB7はB1に依存（独立して先行可能）
- フェーズB8はB2, B7に依存
- パートA, パートBは並行開発可能
- パートC はパートA, B完了後

## 見積もり合計
約215分（AIエージェント実行時間）
