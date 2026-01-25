#!/bin/bash

# =============================================================================
# Git Worktreeクリーンアップスクリプト
#
# 使用方法:
#   ./scripts/cleanup-worktrees.sh [--all] [--force]
#
# オプション:
#   --all    マージ済みでないWorktreeも削除
#   --force  確認なしで削除
#
# 説明:
#   マージ済みのIssue用Worktreeを一括削除します。
# =============================================================================

set -e

# 色付け出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# オプション解析
DELETE_ALL=false
FORCE=false

for arg in "$@"; do
    case $arg in
        --all)
            DELETE_ALL=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo -e "${BLUE}使用方法:${NC}"
            echo "  ./scripts/cleanup-worktrees.sh [--all] [--force]"
            echo ""
            echo -e "${BLUE}オプション:${NC}"
            echo "  --all    マージ済みでないWorktreeも削除"
            echo "  --force  確認なしで削除"
            echo ""
            echo -e "${BLUE}説明:${NC}"
            echo "  マージ済みのIssue用Worktreeを一括削除します。"
            exit 0
            ;;
    esac
done

# リポジトリのルートディレクトリを取得
REPO_ROOT=$(git rev-parse --show-toplevel)
REPO_NAME=$(basename "$REPO_ROOT")
PARENT_DIR=$(dirname "$REPO_ROOT")

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Git Worktree クリーンアップスクリプト${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Worktree一覧を取得
echo -e "${YELLOW}➜ Worktree一覧を取得中...${NC}"
echo ""

worktrees_to_delete=()
worktrees_not_merged=()

# メインブランチを更新
git fetch origin main 2>/dev/null || git fetch origin master 2>/dev/null || true

# Issue用Worktreeを検出
for dir in "$PARENT_DIR"/"$REPO_NAME"-issue-*; do
    if [ -d "$dir" ]; then
        ISSUE_NUM=$(basename "$dir" | sed 's/.*-issue-//')
        WORKTREE_DIR="$dir"

        # ブランチ名を取得
        BRANCH_NAME=$(git -C "$WORKTREE_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null) || continue

        echo -e "${BLUE}Issue #$ISSUE_NUM${NC}"
        echo -e "  ディレクトリ: $WORKTREE_DIR"
        echo -e "  ブランチ: $BRANCH_NAME"

        # マージ済みかチェック
        if git branch --merged origin/main 2>/dev/null | grep -q "$BRANCH_NAME" || \
           git branch --merged origin/master 2>/dev/null | grep -q "$BRANCH_NAME"; then
            echo -e "  状態: ${GREEN}マージ済み${NC}"
            worktrees_to_delete+=("$ISSUE_NUM:$WORKTREE_DIR:$BRANCH_NAME")
        else
            # PRがマージされているかチェック（ghの--jqオプションを使用）
            PR_STATE=$(gh pr view "$BRANCH_NAME" --json state --jq '.state' 2>/dev/null) || PR_STATE=""

            if [ "$PR_STATE" = "MERGED" ]; then
                echo -e "  状態: ${GREEN}PRマージ済み${NC}"
                worktrees_to_delete+=("$ISSUE_NUM:$WORKTREE_DIR:$BRANCH_NAME")
            elif [ "$DELETE_ALL" = true ]; then
                echo -e "  状態: ${YELLOW}未マージ (--allで削除対象)${NC}"
                worktrees_to_delete+=("$ISSUE_NUM:$WORKTREE_DIR:$BRANCH_NAME")
            else
                echo -e "  状態: ${YELLOW}未マージ (スキップ)${NC}"
                worktrees_not_merged+=("$ISSUE_NUM:$WORKTREE_DIR:$BRANCH_NAME")
            fi
        fi
        echo ""
    fi
done

# 削除対象がない場合
if [ ${#worktrees_to_delete[@]} -eq 0 ]; then
    echo -e "${YELLOW}削除対象のWorktreeがありません。${NC}"

    if [ ${#worktrees_not_merged[@]} -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}未マージのWorktree:${NC}"
        for entry in "${worktrees_not_merged[@]}"; do
            ISSUE_NUM="${entry%%:*}"
            echo -e "  - Issue #$ISSUE_NUM"
        done
        echo ""
        echo -e "全て削除するには ${BLUE}--all${NC} オプションを使用してください。"
    fi
    exit 0
fi

# 削除確認
echo -e "${BLUE}────────────────────────────────────────────${NC}"
echo -e "${BLUE}削除対象:${NC}"
echo -e "${BLUE}────────────────────────────────────────────${NC}"
echo ""

for entry in "${worktrees_to_delete[@]}"; do
    ISSUE_NUM="${entry%%:*}"
    REMAINING="${entry#*:}"
    WORKTREE_DIR="${REMAINING%%:*}"
    BRANCH_NAME="${REMAINING##*:}"
    echo -e "  ${RED}Issue #$ISSUE_NUM${NC}"
    echo -e "    ディレクトリ: $WORKTREE_DIR"
    echo -e "    ブランチ: $BRANCH_NAME"
    echo ""
done

if [ "$FORCE" != true ]; then
    echo -e "${YELLOW}これらのWorktreeとブランチを削除しますか？ (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}キャンセルしました。${NC}"
        exit 0
    fi
fi

# 削除実行
echo ""
echo -e "${YELLOW}➜ Worktreeを削除中...${NC}"
echo ""

for entry in "${worktrees_to_delete[@]}"; do
    ISSUE_NUM="${entry%%:*}"
    REMAINING="${entry#*:}"
    WORKTREE_DIR="${REMAINING%%:*}"
    BRANCH_NAME="${REMAINING##*:}"

    echo -e "${YELLOW}Issue #$ISSUE_NUM を削除中...${NC}"

    # Worktreeを削除
    git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || {
        echo -e "${YELLOW}  Worktreeディレクトリを手動で削除中...${NC}"
        rm -rf "$WORKTREE_DIR"
        git worktree prune
    }

    # ブランチを削除
    git branch -D "$BRANCH_NAME" 2>/dev/null || true

    echo -e "${GREEN}✓ Issue #$ISSUE_NUM の削除が完了しました${NC}"
    echo ""
done

# Worktreeの整合性を確認
echo -e "${YELLOW}➜ Worktreeを整理中...${NC}"
git worktree prune

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}  クリーンアップが完了しました${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# 残っているWorktreeを表示
remaining=$(git worktree list | grep -v "$(pwd)" | wc -l)
if [ "$remaining" -gt 0 ]; then
    echo -e "${YELLOW}残っているWorktree:${NC}"
    git worktree list | grep -v "$(pwd)"
fi
