# タスクリスト: 開発秘話ページの共通UI化とテーマシステム対応

**ステータス**: ✅ 完了
**完了日**: 2026-02-08
**Issue**: #140

## フェーズ1: ページレベルのテーマ対応

### タスク1.1: 一覧ページ（page.tsx）の共通UI化
- [x] `style={{ backgroundColor: '#F7F7F5' }}` → `bg-page` クラスに置換
- [x] 戻るリンク（独自Link+HiArrowLeft） → `<BackLink>` に置換
- [x] `text-gray-800`, `text-gray-500` 等 → `text-ink`, `text-ink-sub` に置換
- [x] 空状態表示 → CSS変数対応（bg-amber-100等のハードコード色）
- [x] `transition-colors duration-1000` 追加

### タスク1.2: 詳細ページ（EpisodeDetailClient.tsx）の共通UI化
- [x] `style={{ backgroundColor: '#F7F7F5' }}` → `bg-page` クラスに置換
- [x] ヘッダーの戻るリンク → `<BackLink>` に置換
- [x] ヘッダー背景 `bg-white/50` → `bg-surface/50` に置換
- [x] `border-gray-200/50` → `border-edge/50` に置換
- [x] テキスト色 → CSS変数に置換
- [x] 前後ナビゲーションボタン → CSS変数対応
- [x] エピソード未発見時の表示 → CSS変数対応
- [x] `transition-colors duration-1000` 追加

## フェーズ2: コンポーネントレベルのテーマ対応

### タスク2.1: EpisodeCard の共通UI化
- [x] 外枠 → `bg-surface` + `border-edge` + CSS変数
- [x] サムネイル背景 → `bg-ground` でテーマ対応
- [x] テキスト色 → CSS変数
- [x] タグ表示 → `<Badge>` に置換

### タスク2.2: DetailSection の共通UI化
- [x] `bg-surface` + `border-edge` でCSS変数化
- [x] タグ表示 → `<Badge>` に置換
- [x] `border-t border-edge` に置換

### タスク2.3: DialogueSection のテーマ対応
- [x] `bg-surface` + `border border-edge` でテーマ対応
- [x] キャラクター紹介カード → `bg-ground`（不透明、可読性確保）
- [x] 関係性説明 → `bg-ground`（不透明、可読性確保）
- [x] テキスト色 → CSS変数

### タスク2.4: DialogueBubble・CharacterAvatar
- [x] DialogueBubble: キャラ固有色は維持（テーマ変更不要）
- [x] CharacterAvatar: 変更不要を確認

### 追加タスク: MarkdownRenderer テーマ対応
- [x] テキスト色 → CSS変数（`text-ink`, `text-ink-sub`）
- [x] テーブル → CSS変数（`bg-ground`, `border-edge`）
- [x] インラインコード → CSS変数（`bg-ground`, `text-ink`）

## フェーズ3: 検証
- [x] lint 通過
- [x] build 通過（53ページ全生成）
- [x] test 通過（750テスト全合格）
- [x] コードレビュー通過（問題なし）

## 見積もり
- 実装: 約15分（AI実行）→ 実績: 約20分
- 検証: 約5分 → 実績: 約5分
