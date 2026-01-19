# RoastPlus - Project Rules

## Overview
コーヒー焙煎・抽出業務支援アプリ（Next.js PWA）

## Tech Stack
- Next.js 16 (App Router) / React 19 / TypeScript 5
- Tailwind CSS v4 / Framer Motion / Lottie
- Firebase (Auth, Firestore, Storage)

## Ignored Directories (DO NOT READ)
- `node_modules/`, `.next/`, `out/`, `.git/`
- `coverage/`, `dist/`, `.turbo/`
- `public/sounds/`, `public/lottie/` (静的アセット)

## Tool Usage Policy

### Serena MCP (コード探索時は必須)
コードの探索・把握には**必ず**Serena MCPを使用すること。

**主要ツール：**
- `get_symbols_overview` - ファイルのシンボル一覧取得
- `find_symbol` - シンボル検索（クラス、関数、変数など）
- `find_referencing_symbols` - 参照元の検索
- `search_for_pattern` - コードベース全体のパターン検索
- `list_dir` / `find_file` - ディレクトリ・ファイル探索

**注意：** Glob/Grep/Task(Explore)の直接使用よりSerenaを優先

### Context7 MCP (コード実装時は必須)
コードを実装する際は**必ず**Context7 MCPで最新ドキュメントを参照すること。

**使用手順：**
1. `resolve-library-id` - ライブラリIDを取得
2. `query-docs` - 該当機能のドキュメント・コード例を取得

**対象ライブラリ例：**
- Next.js, React, TypeScript
- Tailwind CSS, Framer Motion
- Firebase (Auth, Firestore, Storage)

**注意：** 古い知識に頼らず、常に最新のAPIやベストプラクティスを確認

### Chrome DevTools MCP (動作確認時は必須)
UIの動作確認・デバッグには**必ず**Chrome DevTools MCPを使用すること。

**主要ツール：**
- `take_snapshot` - ページのA11Yツリースナップショット取得
- `take_screenshot` - スクリーンショット撮影
- `click` / `fill` / `hover` - UI操作
- `navigate_page` - ページ遷移
- `list_console_messages` - コンソールログ確認
- `list_network_requests` - ネットワークリクエスト確認
- `evaluate_script` - JavaScript実行

**確認フロー：**
1. `navigate_page` でページにアクセス
2. `take_snapshot` で要素確認
3. `click` / `fill` で操作
4. `take_screenshot` で結果確認
5. エラー時は `list_console_messages` でログ確認

## Code Style
- 日本語コメント可
- コンポーネント: `src/components/`
- ページ: `src/app/`
- 型定義: `src/types/`
- Firebase: `src/lib/firebase/`

## Commands
```bash
npm run dev      # 開発サーバー
npm run build    # ビルド
npm run lint     # Lint
```

## Context Management
- タスク完了後は `/clear` を推奨
- 長いセッションでは `/compact` を使用
- 詳細ドキュメントは `docs/` を参照
