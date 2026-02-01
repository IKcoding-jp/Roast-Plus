# RoastPlus - Project Rules

## Overview
コーヒー焙煎・抽出業務支援アプリ（Next.js PWA）

## Tech Stack
- Next.js 16 (App Router) / React 19 / TypeScript 5
- Tailwind CSS v4 / Framer Motion / Lottie
- Firebase (Auth, Firestore, Storage)

## Workflows

### 1. 探索→計画→コード→コミット型（標準）
1. ファイルを読んで理解（コード作成は禁止）
2. 「think hard」で計画立案
3. 実装・検証
4. PR作成、README更新

### 2. TDD型
1. 入出力ペアからテスト作成
2. テスト実行で失敗確認 → コミット
3. 実装で全テスト合格まで反復
4. コード確定後コミット

### 3. ビジュアル反復型
Chrome DevTools MCPでスクショ確認しながらUI改善

## Thinking Keywords
| キーワード | 用途 |
|-----------|------|
| `think` | 通常の推論 |
| `think hard` | 複雑な問題、設計判断 |
| `ultrathink` | 最も困難なアーキテクチャ決定 |

## Tool Usage Policy

### Serena MCP（コード探索）
- `get_symbols_overview` / `find_symbol` - シンボル検索
- `search_for_pattern` - パターン検索
- Glob/Grep/Task(Explore)より優先

### Context7 MCP（実装時）
`resolve-library-id` → `query-docs` で最新ドキュメント参照

### Chrome DevTools MCP（動作確認）
`navigate_page` → `take_snapshot` → 操作 → `take_screenshot`

## Code Style
- ディレクトリ: `app/`, `components/`, `lib/`, `hooks/`, `types/`
- 命名: PascalCase（コンポーネント）, camelCase（関数）, UPPER_SNAKE_CASE（定数）
- 型定義: interface優先、ユニオン型はtype
- 詳細は `docs/coding-standards.md` 参照

## Testing
- **推奨**: Vitest
- テストファイル: `*.test.ts`, `*.test.tsx`
- 詳細は `docs/testing-strategy.md` 参照

## Commands
```bash
npm run dev      # 開発サーバー
npm run build    # ビルド
npm run lint     # Lint
npm run test     # テスト（Vitest導入後）
```

## Development Flow
1. **Issue作成** → 機能追加・修正の起点（Claudeが作成）
2. **ブランチ作成** → `feature/#123-xxx`（または `feat/#123-xxx`）、`fix/#123-xxx`
3. **実装・動作確認**
4. **コミット＆プッシュ**
5. **PR作成** → `Closes #123` を含める
6. **mainにマージ**

⚠️ **mainブランチへの直接コミット禁止**

## Git & GitHub CLI
- **ベースブランチ**: `main`
- Issue/PR作成時は `--body-file` で一時ファイルを使用（バッククォート問題回避）

## Shortcuts
| キー | 機能 |
|-----|------|
| `Escape` | 現在の生成を中断 |
| `Ctrl+Esc` | 全応答を中止、履歴遡行 |
| `/clear` | コンテキストリセット |
| `/compact` | 長いセッションを圧縮 |

## Project Memory
- アーキテクチャ意思決定記録: `docs/memory.md`（ADR形式）
- 重要な設計判断を行った際は、必ず `docs/memory.md` に ADR-XXX 形式で追記すること
- 過去の設計理由を問われた場合は、まず `docs/memory.md` を参照すること

## Ignored Directories
`node_modules/`, `.next/`, `out/`, `.git/`, `coverage/`, `public/sounds/`, `public/lottie/`
