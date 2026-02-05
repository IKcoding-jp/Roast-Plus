# Issue解決履歴

RoastPlusで過去に解決したIssueの代表例を記録。同様の問題が発生した場合の参考資料として使用。

## 目次

1. [Issue #150: コードレビュー指摘事項の修正](#issue-150-コードレビュー指摘事項の修正)
2. [Issue #147: ホーム画面の縦スクロール問題](#issue-147-ホーム画面の縦スクロール問題)
3. [Issue #111: Knipによるデッドコード排除](#issue-111-knipによるデッドコード排除)
4. [Issue #153: 雪の結晶デザインの改善](#issue-153-雪の結晶デザインの改善)

---

## Issue #150: コードレビュー指摘事項の修正

**ラベル**: `bug`, `ui`, `priority: high`
**PR**: #151
**解決日**: 2026-01-28

### 問題

PR #135（ローストタイマーページの共通UI化）に対して、コードレビューで複数の指摘事項が発覚：
1. Button内の不要なdiv
2. Modal内のaria-labelledby不足
3. Tabsの重複キー警告
4. クリスマスモード切り替え時のちらつき

### 調査（Serena MCP）

```
# Button コンポーネントの構造確認
find_symbol: "Button"
→ components/ui/Button.tsx:12

# 参照箇所確認
find_referencing_symbols: Button
→ 参照元: 35ファイル（広範囲に影響）

# Modal コンポーネントの確認
find_symbol: "Modal"
→ components/ui/Modal.tsx:25

# useChristmasMode フックの確認
find_symbol: "useChristmasMode"
→ hooks/useChristmasMode.ts:8
```

### 計画

1. **Button修正**: 不要なdivを削除し、直接ボタン要素を返す
2. **Modal修正**: `aria-labelledby` 属性を追加し、タイトルIDと紐付け
3. **Tabs修正**: keyプロパティを一意にする（インデックスではなくID使用）
4. **クリスマスモード修正**: localStorageの初期化タイミングをハイドレーション後に変更

### 実装

#### 1. Button.tsx修正（コミット: 1f9cad4）

```tsx
// Before
export function Button({ children, variant, ...props }: ButtonProps) {
  return (
    <div> {/* 不要なdiv */}
      <button className={buttonStyles[variant]} {...props}>
        {children}
      </button>
    </div>
  );
}

// After
export function Button({ children, variant, ...props }: ButtonProps) {
  return (
    <button className={buttonStyles[variant]} {...props}>
      {children}
    </button>
  );
}
```

#### 2. Modal.tsx修正（コミット: 0a8cf75）

```tsx
// Before
export function Modal({ title, children, ...props }: ModalProps) {
  return (
    <dialog {...props}>
      <h2>{title}</h2>
      {children}
    </dialog>
  );
}

// After
export function Modal({ title, children, ...props }: ModalProps) {
  const titleId = useId();

  return (
    <dialog aria-labelledby={titleId} {...props}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  );
}
```

#### 3. Tabs.tsx修正（コミット: 2b5e8a1）

```tsx
// Before
{tabs.map((tab, index) => (
  <button key={index}>{tab.label}</button> // インデックスをkeyに使用
))}

// After
{tabs.map((tab) => (
  <button key={tab.id}>{tab.label}</button> // IDをkeyに使用
))}
```

#### 4. useChristmasMode.ts修正（コミット: 3c7f9d2）

```tsx
// Before
export function useChristmasMode() {
  const [isChristmasMode, setIsChristmasMode] = useState(() => {
    return localStorage.getItem('christmasMode') === 'true'; // SSR時にエラー
  });
}

// After
export function useChristmasMode() {
  const [isChristmasMode, setIsChristmasMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('christmasMode') === 'true';
    setIsChristmasMode(stored);
    setIsHydrated(true);
  }, []);

  return { isChristmasMode, toggleChristmasMode, isHydrated };
}
```

### 検証

- `npm run lint` → 通過
- `npm run build` → 通過
- Chrome DevTools MCPでUI確認 → ちらつきなし
- クリスマスモード切り替えテスト → 正常動作

### 結果

- PR #151でクローズ
- マージ後にIssue #150をクローズ
- 共通UIコンポーネントの品質向上

### 学び

1. **共通UIコンポーネントの実装時は、aria属性を必ず確認**
   - `aria-labelledby`, `aria-describedby` などのアクセシビリティ属性
   - `useId()` フックでユニークIDを生成

2. **localStorageの初期化はハイドレーション後に行う**
   - SSR時に `localStorage` にアクセスしない
   - `useEffect` で初期化

3. **コードレビュー指摘は迅速に対応することで、他のPRへの影響を最小化**

---

## Issue #147: ホーム画面の縦スクロール問題

**ラベル**: `bug`, `ui`
**PR**: #148
**解決日**: 2026-01-20

### 問題

ホーム画面で縦スクロールができず、コンテンツが画面外に隠れてしまう。
特にモバイル端末で顕著。

### 調査

```
# ホーム画面の構造確認
get_symbols_overview: app/page.tsx
→ HomePage コンポーネント

# CSS確認
search_for_pattern: "overflow-hidden|h-screen"
→ 検出: app/page.tsx:15 - `h-screen overflow-hidden`
```

### 原因

`h-screen overflow-hidden` クラスが適用されており、画面高さを超えるコンテンツがスクロールできない。

### 実装

```tsx
// Before
<div className="h-screen overflow-hidden">
  {/* コンテンツ */}
</div>

// After
<div className="min-h-screen overflow-y-auto">
  {/* コンテンツ */}
</div>
```

### 検証

- iPhone 13 Proでテスト → スクロール正常
- Android（Pixel 5）でテスト → スクロール正常
- デスクトップでテスト → スクロール正常

### 結果

PR #148でクローズ、Issue #147をクローズ

### 学び

- `h-screen` は画面高さ固定、コンテンツが多い場合は `min-h-screen` を使用
- `overflow-hidden` は慎重に使用（スクロール不可になる）
- モバイル端末での動作確認を忘れずに

---

## Issue #111: Knipによるデッドコード排除

**ラベル**: `refactor`, `code-quality`
**PR**: #112
**解決日**: 2026-01-15

### 問題

Knip（デッドコード検出ツール）で未使用のエクスポート、依存関係、ファイルが大量に検出された。

### 調査

`deadcode-audit` スキルで実行:

```bash
npm run deadcode
```

**結果:**
- 未使用ファイル: 4件
- 未使用依存関係: 3件
- 未使用devDependencies: 1件
- 未リスト依存関係: 2件
- 未使用エクスポート: 76件
- 未使用エクスポート型: 25件

### 計画

1. **未使用ファイル削除** (4件)
2. **未使用依存関係アンインストール** (3件)
3. **未リスト依存関係インストール** (2件)
4. **未使用エクスポート削除** (バレルファイル経由でないか確認後)

### 実装

#### 1. 未使用ファイル削除

```bash
# 削除対象
rm components/OldButton.tsx
rm hooks/useOldTimer.ts
rm lib/deprecated/old-utils.ts
rm types/legacy.ts
```

#### 2. 未使用依存関係アンインストール

```bash
npm uninstall lodash
npm uninstall moment
npm uninstall axios
npm uninstall -D @types/lodash
```

#### 3. 未リスト依存関係インストール

```bash
npm install date-fns
npm install clsx
```

#### 4. 未使用エクスポート削除

バレルファイル（`index.ts`）経由の再エクスポートを確認後、本当に未使用のもののみ削除:
- 削除: 48件（本当に未使用）
- 保持: 28件（バレルファイル経由で使用）

### 検証

- `npm run lint` → 通過
- `npm run build` → 通過
- `npm run test` → 通過
- 再度 `npm run deadcode` → 大幅に減少

### 結果

- PR #112でクローズ
- bundle sizeが約15%削減
- 依存関係が整理され、メンテナンス性向上

### 学び

1. **定期的なデッドコード検出が重要**
   - PRごとに `npm run deadcode` を実行
   - CI/CDに統合して自動チェック

2. **バレルファイル経由の再エクスポートは慎重に判断**
   - `index.ts` 経由で使われている可能性
   - 削除前に `find_referencing_symbols` で確認

3. **依存関係の整理は定期的に実施**
   - 未使用パッケージはセキュリティリスクにもなる

---

## Issue #153: 雪の結晶デザインの改善

**ラベル**: `enhancement`, `ui`, `design`, `christmas-mode`
**PR**: #153
**解決日**: 2026-02-01

### 問題

クリスマスモードの雪の結晶が単純な6角形で、本物の雪の結晶らしい繊細さがない。

### 調査

```
# 現在の雪の結晶コンポーネント確認
find_symbol: "SnowflakeIcon"
→ components/icons/SnowflakeIcon.tsx:5

# 使用箇所確認
find_referencing_symbols: SnowflakeIcon
→ 参照元: app/layout.tsx:42
→ 参照元: components/Header.tsx:28
```

### 計画

1. **雪の結晶SVGを本格的なクリスタル形状に改善**
   - 6つの対称な枝
   - 各枝に細かい分岐を追加
   - 中心の六角形コアを明確化

2. **アニメーション追加**
   - 回転アニメーション
   - 透明度の変化

### 実装

```tsx
// Before: シンプルな6角形
<svg viewBox="0 0 24 24">
  <polygon points="12,2 16,8 22,8 18,14 22,20 16,20 12,26 8,20 2,20 6,14 2,8 8,8" />
</svg>

// After: 本格的な雪の結晶
<svg viewBox="0 0 24 24" className="animate-spin-slow">
  {/* 中心の六角形コア */}
  <circle cx="12" cy="12" r="2" fill="currentColor" />

  {/* 6つの対称な枝 */}
  {[0, 60, 120, 180, 240, 300].map((angle) => (
    <g key={angle} transform={`rotate(${angle} 12 12)`}>
      {/* メイン枝 */}
      <line x1="12" y1="12" x2="12" y2="3" strokeWidth="1.5" />

      {/* 細かい分岐 */}
      <line x1="12" y1="6" x2="10" y2="4" strokeWidth="0.8" />
      <line x1="12" y1="6" x2="14" y2="4" strokeWidth="0.8" />
      <line x1="12" y1="8" x2="11" y2="6" strokeWidth="0.6" />
      <line x1="12" y1="8" x2="13" y2="6" strokeWidth="0.6" />

      {/* 先端の装飾 */}
      <circle cx="12" cy="3" r="0.8" />
    </g>
  ))}
</svg>
```

### 検証

- Chrome DevTools MCPでビジュアル確認 → 美しいクリスタル形状
- クリスマスモード切り替えテスト → 正常動作
- アニメーション確認 → スムーズに回転

### 結果

- PR #153でマージ
- ユーザーから好評の声
- クリスマスモードの完成度が大幅に向上

### 学び

1. **SVGの対称性を活用**
   - `transform="rotate()"` で回転させて対称形状を生成
   - コード量を削減しつつ、美しいデザインを実現

2. **アニメーションは控えめに**
   - `animate-spin-slow`（遅い回転）で落ち着いた印象

3. **ビジュアルデザインは実装前にプロトタイプを作成**
   - Figma等でデザイン確認
   - または nano-banana-pro スキルで画像生成

---

## Issue解決のベストプラクティス

### 1. 調査フェーズ

- Serena MCPで徹底的にコードを調査
- `find_symbol`, `find_referencing_symbols`, `search_for_pattern` を活用
- 影響範囲を明確に把握

### 2. 計画フェーズ

- 「think hard」で実装方針を検討
- 複数のアプローチを比較
- ユーザーに確認を取ってから実装開始

### 3. 実装フェーズ

- 最小限の修正で問題を解決
- コミットメッセージはコンベンショナルコミット形式
- 1コミット = 1つの論理的変更

### 4. 検証フェーズ

- lint/build/test を必ず実行
- 関連機能に影響がないか確認
- 必要に応じてE2Eテスト

### 5. レビューフェーズ

- code-review スキルで自己レビュー
- security-reviewer スキルでセキュリティチェック
- PR作成前に必ず実施

### 6. ドキュメント化

- 解決方法を記録（このファイル）
- 同様の問題が発生した際の参考資料として活用
