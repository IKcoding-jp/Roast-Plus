#!/bin/bash
# PostToolUse hook: Edit/Write後にESLint --fixを自動実行する
# stdinからJSON（tool_input）を受け取り、対象ファイルを整形する

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# ファイルパスが取得できない場合は何もしない
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# 対象拡張子のみ処理（ts, tsx, js, jsx, mjs）
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs)
    ;;
  *)
    exit 0
    ;;
esac

# ファイルが存在するか確認
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# ESLint --fix を実行（エラーがあっても続行）
npx eslint --fix "$FILE_PATH" 2>/dev/null

# 常に成功として返す（ブロックしない）
exit 0
