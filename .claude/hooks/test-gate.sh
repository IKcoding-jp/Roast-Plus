#!/bin/bash
# Stop Hook: セッション終了前にテストスイートを実行するゲート
# テスト失敗時はnon-zero exit codeを返し、Claudeに修正を促す

# プロジェクトルートに移動
cd "$CLAUDE_PROJECT_DIR" || exit 0

# テストファイルが存在するか確認（テストがなければスキップ）
TEST_FILES=$(find . -path ./node_modules -prune -o -path ./.next -prune -o -name '*.test.ts' -print -o -name '*.test.tsx' -print 2>/dev/null)

if [ -z "$TEST_FILES" ]; then
  # テストファイルがない場合はスキップ
  exit 0
fi

# テスト実行
npx vitest run --reporter=verbose 2>&1
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo ""
  echo "=========================================="
  echo "  テストが失敗しました"
  echo "  失敗したテストを修正してください"
  echo "=========================================="
  exit 1
fi

exit 0
