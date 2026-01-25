#!/bin/bash

# =============================================================================
# Git Worktree一括作成スクリプト
#
# 使用方法:
#   ./scripts/setup-worktrees.sh 16 17 18 19 20
#
# 説明:
#   複数のGitHub Issueを並列で処理するためのWorktreeを一括作成します。
#   各Worktreeは親ディレクトリに作成され、対応するブランチが自動生成されます。
# =============================================================================

set -e

# 色付け出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 使用方法表示
usage() {
    echo -e "${BLUE}使用方法:${NC}"
    echo "  ./scripts/setup-worktrees.sh <issue-number> [issue-number...]"
    echo ""
    echo -e "${BLUE}例:${NC}"
    echo "  ./scripts/setup-worktrees.sh 16 17 18 19 20"
    echo ""
    echo -e "${BLUE}説明:${NC}"
    echo "  指定したIssue番号ごとにWorktreeを作成します。"
    echo "  各Worktreeは親ディレクトリに 'roastplus-issue-N' として作成されます。"
    exit 1
}

# 引数チェック
if [ $# -eq 0 ]; then
    usage
fi

# リポジトリのルートディレクトリを取得
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
PARENT_DIR=$(dirname "$REPO_ROOT")

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Git Worktree 一括作成スクリプト${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "リポジトリ: ${GREEN}$REPO_NAME${NC}"
echo -e "親ディレクトリ: ${GREEN}$PARENT_DIR${NC}"
echo ""

# メインブランチを最新に更新
echo -e "${YELLOW}➜ メインブランチを更新中...${NC}"
git fetch origin main 2>/dev/null || git fetch origin master 2>/dev/null || true
echo ""

# 作成するWorktreeの一覧
created_worktrees=()

for ISSUE_NUM in "$@"; do
    echo -e "${BLUE}────────────────────────────────────────────${NC}"
    echo -e "${BLUE}Issue #$ISSUE_NUM の処理${NC}"
    echo -e "${BLUE}────────────────────────────────────────────${NC}"

    # Issue情報を取得
    echo -e "${YELLOW}➜ Issue情報を取得中...${NC}"

    ISSUE_JSON=$(gh issue view "$ISSUE_NUM" --json title,labels 2>/dev/null) || {
        echo -e "${RED}✗ Issue #$ISSUE_NUM が見つかりません${NC}"
        continue
    }

    ISSUE_TITLE=$(echo "$ISSUE_JSON" | jq -r '.title')
    ISSUE_LABELS=$(echo "$ISSUE_JSON" | jq -r '.labels[].name' 2>/dev/null | tr '\n' ',' | sed 's/,$//')

    echo -e "  タイトル: ${GREEN}$ISSUE_TITLE${NC}"
    echo -e "  ラベル: ${GREEN}$ISSUE_LABELS${NC}"

    # ブランチ名を決定
    if echo "$ISSUE_LABELS" | grep -qi "bug"; then
        BRANCH_PREFIX="fix"
    else
        BRANCH_PREFIX="feat"
    fi

    BRANCH_NAME="${BRANCH_PREFIX}/issue-${ISSUE_NUM}"
    WORKTREE_DIR="${PARENT_DIR}/${REPO_NAME}-issue-${ISSUE_NUM}"

    echo -e "  ブランチ: ${GREEN}$BRANCH_NAME${NC}"
    echo -e "  Worktree: ${GREEN}$WORKTREE_DIR${NC}"

    # 既存のWorktreeをチェック
    if [ -d "$WORKTREE_DIR" ]; then
        echo -e "${YELLOW}⚠ Worktreeが既に存在します。スキップします。${NC}"
        continue
    fi

    # 既存のブランチをチェック
    if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" 2>/dev/null; then
        echo -e "${YELLOW}⚠ ブランチが既に存在します。既存ブランチを使用します。${NC}"
        git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
    else
        # 新しいブランチでWorktreeを作成
        echo -e "${YELLOW}➜ Worktreeを作成中...${NC}"
        git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" origin/main 2>/dev/null || \
        git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" origin/master 2>/dev/null || \
        git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" main 2>/dev/null || \
        git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" master
    fi

    # 依存関係をインストール
    echo -e "${YELLOW}➜ 依存関係をインストール中...${NC}"
    (cd "$WORKTREE_DIR" && npm install --silent)

    echo -e "${GREEN}✓ Issue #$ISSUE_NUM のWorktreeが作成されました${NC}"
    created_worktrees+=("$ISSUE_NUM:$WORKTREE_DIR")
    echo ""
done

# 結果サマリー
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  作成完了${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

if [ ${#created_worktrees[@]} -eq 0 ]; then
    echo -e "${YELLOW}作成されたWorktreeはありません。${NC}"
    exit 0
fi

echo -e "${GREEN}作成されたWorktree:${NC}"
echo ""

for entry in "${created_worktrees[@]}"; do
    ISSUE_NUM="${entry%%:*}"
    WORKTREE_DIR="${entry##*:}"
    echo -e "  ${GREEN}Issue #$ISSUE_NUM${NC}"
    echo -e "    ディレクトリ: $WORKTREE_DIR"
    echo ""
done

echo -e "${BLUE}────────────────────────────────────────────${NC}"
echo -e "${BLUE}次のステップ:${NC}"
echo -e "${BLUE}────────────────────────────────────────────${NC}"
echo ""
echo "各ターミナルで以下のコマンドを実行してください:"
echo ""

for entry in "${created_worktrees[@]}"; do
    ISSUE_NUM="${entry%%:*}"
    WORKTREE_DIR="${entry##*:}"
    echo -e "${YELLOW}# ターミナル (Issue #$ISSUE_NUM)${NC}"
    echo "cd \"$WORKTREE_DIR\" && claude --rename issue-$ISSUE_NUM"
    echo "> /fix-issue $ISSUE_NUM"
    echo ""
done

echo -e "${BLUE}────────────────────────────────────────────${NC}"
echo -e "${GREEN}全て完了したら、以下でクリーンアップ:${NC}"
echo "./scripts/cleanup-worktrees.sh"
echo ""
