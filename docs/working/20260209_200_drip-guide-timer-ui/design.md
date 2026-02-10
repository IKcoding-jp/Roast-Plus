# 設計書

## 実装方針

### 変更対象ファイル

| ファイル | 行数 | 変更内容 |
|---------|------|---------|
| `components/drip-guide/DripGuideRunner.tsx` | 148 | レイアウト構成の調整 |
| `components/drip-guide/runner/TimerDisplay.tsx` | 21 | タイマー表示の改善 |
| `components/drip-guide/runner/StepInfo.tsx` | 70 | ステップ情報の視認性向上 |
| `components/drip-guide/runner/StepMiniMap.tsx` | 132 | ミニマップの視認性向上 |
| `components/drip-guide/runner/ProgressBar.tsx` | 21 | プログレスバーの強化 |
| `components/drip-guide/runner/FooterControls.tsx` | 174 | 次ステップ表示の改善 |

### 新規作成ファイル

- なし（既存コンポーネント内で改善）

## 現在のレイアウト構成

```
┌─────────────────────────┐
│ RunnerHeader             │ ← レシピ名、戻るボタン
├─────────────────────────┤
│ StepMiniMap (横スクロール)│ ← ステップカード群（text-xs、小さい）
├─────────────────────────┤
│                          │
│    TimerDisplay          │ ← 大型タイマー（text-8xl）
│    00:00                 │
│                          │
│    StepInfo              │ ← 現在のステップ情報
│    ステップ名 / 水量 / 説明│
│                          │
├─────────────────────────┤
│ ProgressBar (h-1, 4px)   │ ← 全体進捗（目立たない）
├─────────────────────────┤
│ FooterControls           │ ← Play/Pause、次ステップ予告（text-xs）
└─────────────────────────┘
```

## 改善の方向性

**注**: 具体的なデザインは実装前にChrome DevToolsでスクリーンショット確認後に詳細化する。

### 重点改善ポイント
1. **次のステップの視認性**: 現在FooterControlsに `text-xs` で表示 → より目立つ位置・サイズに
2. **全体進捗**: `h-1`（4px）のProgressBar → ステップ数テキスト（例: 3/5）追加
3. **水量情報**: StepInfoのバッジ表示 → より大きく目立つ表示
4. **カウントダウン**: 音声のみ → 視覚的カウントダウン追加

## 影響範囲

- ドリップガイド実行画面（`/drip-guide/run`）のみ
- レシピデータ構造への変更なし
- タイマーロジック（useRunnerTimer）への変更は最小限

## 禁止事項チェック

- ❌ レシピ計算ロジックの変更不可
- ❌ タイマーロジックの根本的変更不可（バグ修正のみ）
- ❌ 独自CSS生成しない → CSS変数を使用
- ❌ 音声案内機能の削除不可
