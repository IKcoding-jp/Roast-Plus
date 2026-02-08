# 要件定義: 開発秘話ページの共通UI化とテーマシステム対応

## Issue
- **番号**: #140
- **タイトル**: refactor(dev-stories): 開発秘話ページの共通UI化とテーマシステム対応

## 概要
開発秘話ページ（`app/dev-stories/`）の独自UI要素を共通UIコンポーネントに置換し、CSS変数ベースのテーマシステムに対応する。

## 現状の問題
- 共通UIコンポーネント未使用（独自の`<button>`, カード, 戻るリンクを使用）
- ハードコード色（`#F7F7F5`, `text-gray-*`, `bg-white`等）によりテーマ切替不可
- クリスマスモード未対応

## 要件

### 1. 共通UIコンポーネント化
- 戻るリンク → `<BackLink>` に置換
- カード要素（EpisodeCard） → `<Card>` + CSS変数に置換
- タグ表示 → `<Badge>` に置換
- ナビゲーションボタン → `<Button>` / `<IconButton>` に置換

### 2. テーマ対応（CSS変数方式）
- ページ背景 → `bg-page`
- カード/コンテナ背景 → `bg-surface`, `border-edge`
- テキスト → `text-ink`, `text-ink-sub`, `text-ink-muted`
- ヘッダー背景 → `bg-surface/50` + `backdrop-blur`
- `transition-colors duration-1000` で滑らかなテーマ切替

### 3. 対象ファイル
- `app/dev-stories/page.tsx` - 一覧ページ
- `app/dev-stories/[id]/EpisodeDetailClient.tsx` - 詳細ページ
- `components/dev-stories/EpisodeCard.tsx` - エピソードカード
- `components/dev-stories/DetailSection.tsx` - 詳細セクション
- `components/dev-stories/DialogueSection.tsx` - 対話セクション
- `components/dev-stories/DialogueBubble.tsx` - 吹き出し（キャラ固有色のため対象外の可能性）
- `components/dev-stories/CharacterAvatar.tsx` - アバター（変更不要の可能性）

### 4. 非対象
- `DialogueBubble` のキャラクター固有色（`bubbleColor`, `textColor`）はデザイン意図どおり
- `CharacterAvatar` は画像表示のみで色変更不要
- エピソードデータ（`data/dev-stories/`）は変更しない

## 受け入れ基準
- [ ] 全ハードコード色がCSS変数に置換されている
- [ ] 共通UIコンポーネント（BackLink, Card, Badge等）を使用している
- [ ] 通常モード・クリスマスモード両方で正常表示
- [ ] lint / build / test 通過
