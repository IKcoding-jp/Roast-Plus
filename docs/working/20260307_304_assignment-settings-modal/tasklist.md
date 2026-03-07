# タスクリスト

## フェーズ1: データモデル・Firebase層
- [ ] `types/team.ts` に `ShuffleSettings` interface追加
  - `{ crossTeamShuffle: boolean }`
- [ ] `lib/firebase/settings.ts` にシャッフル設定関数を追加
  - `subscribeShuffleSettings(userId, callback)` — リアルタイム購読
  - `updateShuffleSettings(userId, settings)` — 設定更新
- [ ] `lib/firebase/helpers.ts` に `DEFAULT_SHUFFLE_SETTINGS` 定数を追加
- [ ] `lib/firebase/index.ts` から新関数をエクスポート

## フェーズ2: フック・状態管理
- [ ] `useAssignmentData` に `shuffleSettings` 状態を追加
  - `subscribeShuffleSettings` で購読
  - returnオブジェクトに追加
- [ ] `useShuffleExecution` に `shuffleSettings` パラメータを追加
  - `calculateAssignment` 呼び出し時に `crossTeamShuffle` を渡す

## フェーズ3: シャッフルアルゴリズム改修
- [ ] `calculateAssignment` のシグネチャに `crossTeamShuffle?: boolean` を追加
- [ ] `crossTeamShuffle === false` 時の制約を実装
  - 各メンバーの `teamId` と一致するスロットのみに配置
  - バックトラッキングの候補フィルタに追加

## フェーズ4: UI実装
- [ ] `PairExclusionSettingsModal.tsx` を `AssignmentSettingsModal.tsx` にリネーム・作り変え
  - セクション分割レイアウト（スクロール可能なモーダル）
  - シャッフル設定セクション: Switchコンポーネントでトグル
  - ペア除外セクション: 既存UIを移植（isDeveloperMode条件付き）
- [ ] `page.tsx` の設定ボタン表示条件を変更
  - `isDeveloperMode` → 常時表示
  - import更新（`PairExclusionSettingsModal` → `AssignmentSettingsModal`）
  - `isDeveloperMode` propをモーダルに渡す

## フェーズ5: テスト
- [ ] `lib/shuffle.ts` のユニットテスト
  - `crossTeamShuffle: false` で班内制約が効いていることを検証
  - `crossTeamShuffle: true` で従来動作を検証
  - `crossTeamShuffle: undefined` (デフォルト) = false として動作
- [ ] `AssignmentSettingsModal` のコンポーネントテスト
  - トグル操作によるコールバック呼び出し
  - isDeveloperMode=false でペア除外非表示
  - isDeveloperMode=true でペア除外表示

## 依存関係
- フェーズ1 → フェーズ2 → フェーズ3（データ層から上位へ）
- フェーズ3・フェーズ4 は並列実行可
- フェーズ5 はフェーズ3・4完了後

## 見積もり
- フェーズ1: 5分
- フェーズ2: 5分
- フェーズ3: 10分
- フェーズ4: 15分
- フェーズ5: 15分
- **合計**: 約50分
