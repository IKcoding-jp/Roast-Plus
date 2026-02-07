# 設計書

**Issue**: #177
**更新日**: 2026-02-07

## 実装方針

### アーキテクチャ概要

```
app/dev/design-lab/
├── page.tsx                           # メインページ（タブ切替: Lab / Builder）
├── components/
│   ├── SectionNav.tsx                 # TOCナビゲーション（Lab用）
│   ├── ResponsivePreview.tsx          # レスポンシブプレビューラッパー
│   ├── PatternComparison.tsx          # パターン並列比較
│   ├── FullscreenPreview.tsx          # フルスクリーンモーダル
│   ├── sections/                      # パートA: モック閲覧セクション
│   │   ├── ComponentGallery.tsx
│   │   ├── AnimationShowcase.tsx
│   │   ├── PageMockups.tsx
│   │   ├── ColorPalette.tsx
│   │   ├── Typography.tsx
│   │   └── ComponentVariations.tsx
│   ├── builder/                       # パートB: D&Dビルダー
│   │   ├── Canvas.tsx                 # フリーキャンバス本体
│   │   ├── CanvasElement.tsx          # キャンバス上の各要素
│   │   ├── ElementPalette.tsx         # 要素パレット（左サイドバー）
│   │   ├── PropertyEditor.tsx         # プロパティエディタ（右サイドバー）
│   │   ├── LayerPanel.tsx             # レイヤーパネル
│   │   ├── Toolbar.tsx                # ツールバー（ズーム、保存等）
│   │   ├── ProjectManager.tsx         # プロジェクト管理（一覧、保存、読込）
│   │   └── types.ts                   # デザインデータ型定義
│   └── registry.ts                    # セクション用レジストリ
│
lib/
├── design-lab/
│   ├── schema.ts                      # デザインデータJSON Schema
│   ├── firestore.ts                   # Firestore CRUD操作
│   └── element-registry.ts            # 配置可能要素のレジストリ
│
types/
└── design-lab.ts                      # 共通型定義
```

### 技術選定

| ライブラリ | 用途 | 理由 |
|-----------|------|------|
| **@dnd-kit/core** | ドラッグ&ドロップ | React向け、軽量、アクセシブル |
| **@dnd-kit/utilities** | D&Dユーティリティ | CSS Transform連携 |
| 既存 **Framer Motion** | アニメーション | 既にプロジェクトで使用済み |
| 既存 **Firebase/Firestore** | データ保存 | 既にプロジェクトで使用済み |

### デザインデータJSON Schema

```typescript
// types/design-lab.ts

interface DesignProject {
  id: string;
  name: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;  // userId
  canvas: CanvasData;
}

interface CanvasData {
  width: number;
  height: number;
  backgroundColor: string;
  elements: CanvasElement[];
}

interface CanvasElement {
  id: string;
  type: 'ui-component' | 'html-element';
  componentName?: string;        // 'Button', 'Card' 等（type='ui-component'時）
  htmlTag?: string;              // 'div', 'p', 'img' 等（type='html-element'時）
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  props: Record<string, unknown>;     // コンポーネントprops
  style: Record<string, string>;      // CSSスタイル
  animation?: AnimationConfig;
  children?: CanvasElement[];         // ネスト要素
  locked: boolean;
  visible: boolean;
}

interface AnimationConfig {
  type: 'fadeIn' | 'slideUp' | 'scale' | 'custom';
  duration: number;
  delay: number;
  easing: string;
}
```

### ビルダーUI構成

```
┌─────────────────────────────────────────────────────────┐
│ [ツールバー] 保存 | 読込 | ズーム | グリッド | プレビュー  │
├──────────┬──────────────────────────┬────────────────────┤
│          │                          │                    │
│ 要素     │    フリーキャンバス       │  プロパティ         │
│ パレット  │    （XY自由配置）         │  エディタ          │
│          │                          │                    │
│ ・UI     │  ┌──────┐  ┌─────┐      │  ・Props           │
│   Button │  │ Card │  │Input│      │  ・スタイル         │
│   Card   │  └──────┘  └─────┘      │  ・アニメーション    │
│   Input  │                          │  ・イベント         │
│ ・HTML   │       ┌────────┐         │                    │
│   div    │       │ Button │         │ [レイヤーパネル]    │
│   text   │       └────────┘         │  要素1 (z:3)      │
│   image  │                          │  要素2 (z:2)      │
│          │                          │  要素3 (z:1)      │
├──────────┴──────────────────────────┴────────────────────┤
│ [ステータスバー] キャンバスサイズ | 要素数 | ズーム%        │
└─────────────────────────────────────────────────────────┘
```

### Firestoreデータ構造

```
firestore/
├── designProjects/
│   ├── {projectId}/
│   │   ├── name: string
│   │   ├── description: string
│   │   ├── createdAt: Timestamp
│   │   ├── updatedAt: Timestamp
│   │   ├── createdBy: string
│   │   └── canvas: CanvasData (JSON)
```

### Claude Codeデザイン生成フロー

```
1. ユーザーがClaude Codeに自然言語で指示
   「ログインページを3パターン作って」

2. Claude Codeがデザインデータ（JSON）を生成
   → Design LabのJSONインポート機能で読み込み

3. Design Lab上でプレビュー・D&D調整

4. 調整後、Firestoreに保存

5. 実装時にデザインデータを参照してコーディング
```

### 変更対象ファイル
- `app/settings/page.tsx` - 開発ツールリンク先を `/dev/design-lab` に変更
- `app/ui-test/page.tsx` - リダイレクト処理に変更
- `app/dev/splash-preview/page.tsx` - リダイレクト処理に変更
- `package.json` - @dnd-kit/core, @dnd-kit/utilities 追加

### 新規作成ファイル
- `app/dev/design-lab/page.tsx` - メインページ
- `app/dev/design-lab/components/*.tsx` - 各UIコンポーネント（15+ファイル）
- `lib/design-lab/*.ts` - ビジネスロジック（3ファイル）
- `types/design-lab.ts` - 型定義

## 影響範囲
- 設定ページ: リンク先URL変更のみ
- 旧ページ: リダイレクト追加のみ
- 既存コンポーネント: 変更なし
- Firestore: designProjectsコレクション追加
- package.json: @dnd-kit追加

## 禁止事項チェック
- ❌ 既存の `components/ui/registry.tsx` 構造を変更しない
- ❌ 既存の `components/splash/patterns.tsx` を変更しない
- ❌ 独自CSSでボタン/カード/入力を作らない → 共通UIコンポーネント使用
- ❌ 開発者モードの認証方式を変更しない
- ❌ Canvas2D/WebGL方式にしない（DOMベースでReactコンポーネント直接描画）
