# ドリップガイド iPad レイアウト設計

**日付**: 2026-02-22
**関連Issue**: TBD（Issue作成後に更新）
**承認済みデザイン**: B-1（タイマーヘッダー統合型）
**対象画面サイズ**: iPadランドスケープ（768px以上）

---

## 決定デザイン: B-1 タイマーヘッダー統合型

```
+──────────────────────────────────────────────────────────+
│ ← │ 04:30  [████████░░░░]  4:6メソッド  │ Step 2 / 5  │  ← Super Header (md:)
+─────────────────────┬────────────────────────────────────+
│ ✓ 蒸らし            │                                    │
│   00:00・30g        │  [Drop] 2投目（味：40%）           │
│ ▶ 2投目             │                                    │
│   00:45・60g        │         60g まで注ぐ               │
│ ○ 濃度調整          │                                    │
│   01:30・150g       │  中心から外へ円を描くように注ぐ     │
│ ○ 仕上げ①          │  ────────────────────────────      │
│ ○ 仕上げ②          │  → 濃度調整   あと 35秒           │
+─────────────────────┴────────────────────────────────────+
│                    [↺]  [▶]  [×]                        │  ← Footer (コンパクト)
+──────────────────────────────────────────────────────────+
```

### 各エリアの仕様

#### ヘッダー（md:のみ拡張）
- Back ボタン（既存）
- タイマー: `text-[3rem]` font-nunito、tabular-nums
- プログレスバー: 全体進捗（flex-1）+ `00:30 / 03:30` テキスト
- レシピ名: text-xs text-ink-muted
- Step X/N カウンター（既存）

#### 左サイドバー（md:のみ表示、width: 220px）
- 全ステップをリスト表示
- 各行: 状態アイコン（✓ / ● / ○） + ステップ名 + 時刻・水量
- 現在ステップ: `bg-spot/10 border border-spot/20` でハイライト
- 完了ステップ: 取り消し線、薄色
- スクロール可能（overflow-y-auto）

#### 右メインカラム（flex-1）
- 既存の `StepInfo` コンポーネントをそのまま使用
- `max-w-md` 制限を md: で解除
- 注水量フォント: `text-[5rem]`（B-1モック準拠）
- 次ステップカウントダウン: `text-2xl`

#### フッター
- コントロールボタン: 既存 `FooterControls` をベース
- iPad時はボタンサイズをやや縮小（play: `w-16 h-16`、サブ: `size=20`）

---

## 実装方針

### ブレイクポイント戦略
Tailwind CSS v4 の `md:` ブレイクポイント（768px）を使用:
- モバイル（< 768px）: 既存レイアウトを変更なしで維持
- iPad（768px+）: 2カラムレイアウトに切り替え

### 変更対象ファイル

| ファイル | 変更内容 |
|--------|--------|
| `components/drip-guide/DripGuideRunner.tsx` | メインレイアウト切り替え |
| `components/drip-guide/runner/RunnerHeader.tsx` | md:時にタイマーpropsを受け取り表示 |
| `components/drip-guide/runner/TimerDisplay.tsx` | md:で非表示（`md:hidden`） |
| `components/drip-guide/runner/StepInfo.tsx` | max-w-md を md:で解除 |
| `components/drip-guide/runner/FooterControls.tsx` | md:でボタンサイズ縮小 |
| `components/drip-guide/runner/StepListSidebar.tsx` | **新規作成**・iPad用ステップリスト |

### 新規コンポーネント: StepListSidebar

```tsx
interface StepListSidebarProps {
  steps: DripStep[];
  currentStepIndex: number;
}
```

- `w-[220px] flex-none border-r border-edge` でスタイル
- 各ステップに CheckCircle / 現在インジケーター / 空丸を表示

---

## Design Lab モック

`/dev/design-lab` → 「ドリップガイド iPad レイアウト比較」セクション
承認モック: **B-1** (`IpadLayoutB1.tsx`)

---

## 非対応スコープ

- マニュアルモード（前へ/次へボタン）の iPad レイアウト → 同じ2カラム構造を適用
- ポートレート向け最適化 → 対応しない（< 768px は既存モバイルレイアウトのまま）
- 1024px 超（デスクトップ）→ iPad レイアウトを踏襲（追加最適化なし）
