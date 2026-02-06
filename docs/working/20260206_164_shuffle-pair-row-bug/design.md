# 設計書

**Issue**: #164
**作成日**: 2026-02-06

## 実装方針

### アプローチ: ペナルティベースのスコアリング統合改善

現在のアルゴリズム構造（500回試行 × スコア最小選択）は維持し、スコアリングロジックのバグを修正する。

**FEATURES.md制約**: 「シャッフルロジックの根本的変更はバグ修正のみ」→ アルゴリズムの骨格は変更せず、条件分岐のバグ修正とスコアリングの改善に留める。

### 修正方針

#### 修正1: ペア回避条件の改善（行243付近）

**現状（バグ）:**
```typescript
if (totalScore >= 50000 && selectedMembers.length < neededCount - 1) {
    continue; // 最後の1人は強制選択
}
```

**修正方針:**
- スキップ条件を削除し、すべての候補をスコアでランキング
- ペアペナルティもスコアに加算し、最低スコアの候補を選択
- 全候補を評価してからベストを選ぶ方式に変更

#### 修正2: メンバー選択のスコアリング方式変更

**現状（問題）:**
- 行スコアでソート → 上から順にペアチェック → 条件合致でスキップ/選択
- 上位候補がペアペナルティで弾かれると、次の候補（行スコアが高い）が選ばれる

**修正方針:**
- 2段階評価: まず行スコアで候補をランク付け → 全ペア組み合わせを評価してベストを選択
- もしくは: 候補のスコアにペアペナルティを事前に加味してから選択

#### 修正3: 完璧判定基準の修正

**現状:**
```typescript
if (loopScore < eligibleMembers.length * 10) break;
```

**修正方針:**
- ペナルティが0であることを明確に判定（ランダムノイズの影響を除去）
- `loopScore < 1` のように、ランダム要素の合計値のみで判定

### 変更対象ファイル
- `app/assignment/lib/shuffle.ts` - calculateAssignment関数のスコアリング・選択ロジック

### 新規作成ファイル
- なし

## 影響範囲

### 直接影響
- `app/assignment/lib/shuffle.ts` - アルゴリズム修正

### 間接影響（変更不要だが動作確認が必要）
- `app/assignment/hooks/useShuffleExecution.ts` - calculateAssignmentの呼び出し元
- `app/assignment/components/assignment-table/AssignmentTable.tsx` - 結果表示
- `app/assignment/components/assignment-table/DesktopTableView.tsx` - デスクトップ表示
- `app/assignment/components/RouletteOverlay.tsx` - シャッフルアニメーション

### 影響なし
- Firebase I/O（`app/assignment/lib/firebase/`）- データフォーマット変更なし
- 型定義（`types/team.ts`）- インターフェース変更なし

## 禁止事項チェック
- ❌ 独自CSS生成しない → 該当なし（ロジックのみの修正）
- ❌ 設計方針を変更しない → アルゴリズムの骨格は維持
- ❌ シャッフルロジックの根本的変更しない → バグ修正の範囲で改善
- ❌ calculateAssignment関数のインターフェース変更しない → 引数・戻り値は同じ

## 検証方法

### Chrome DevTools MCP による実機検証
1. `npm run dev` で開発サーバー起動
2. Chrome DevTools MCP で `/assignment` ページにアクセス
3. シャッフルボタンを押して結果を記録
4. 再度シャッフルして前回との差異を検証
5. 以下を複数回確認:
   - 全メンバーが前回と異なる行に配置されている
   - 同じペアが連続していない
6. 問題があればコード修正→再検証を繰り返す
