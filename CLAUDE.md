# RoastPlus - Project Rules

## Overview
コーヒー焙煎・抽出管理アプリ（Next.js PWA）

## Tech Stack
- Next.js 16 (App Router) / React 19 / TypeScript 5
- Tailwind CSS v4 / Framer Motion / Lottie
- Firebase (Auth, Firestore, Storage)

## Ignored Directories (DO NOT READ)
- `node_modules/`, `.next/`, `out/`, `.git/`
- `coverage/`, `dist/`, `.turbo/`
- `public/sounds/`, `public/lottie/` (静的アセット)

## Tool Usage Policy

### Default Tools (優先使用)
| 操作 | ツール |
|------|--------|
| ファイル読み込み | `Read` |
| ファイル編集 | `Edit` |
| ファイル作成 | `Write` |
| パターン検索 | `Glob`, `Grep` |
| コード探索 | `Task(Explore)` |

### Serena MCP (必要時のみ)
以下の場合**のみ**使用:
- 大規模リファクタリング（5ファイル以上）
- シンボル名の一括変更（`rename_symbol`）
- 参照追跡が必要な場合（`find_referencing_symbols`）

### Context7 MCP
ライブラリのドキュメント参照が必要な場合のみ使用

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
