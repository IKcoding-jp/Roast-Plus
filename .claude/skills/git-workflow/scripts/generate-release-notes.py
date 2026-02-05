#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "gitpython>=3.1.0",
# ]
# ///
"""
リリースノート自動生成スクリプト

git logから指定範囲のコミットを抽出し、コンベンショナルコミット形式でパースして
Markdown形式のリリースノートを生成します。

使用例:
    # 前回のタグから現在までの変更を抽出
    uv run generate-release-notes.py --from v0.10.0 --version v0.11.0 --output RELEASE_NOTES.md

    # package.jsonのversionも更新
    uv run generate-release-notes.py --from v0.10.0 --version v0.11.0 --update-package-json --output RELEASE_NOTES.md

    # 2つのタグ間の差分
    uv run generate-release-notes.py --from v0.9.0 --to v0.10.0 --output RELEASE_NOTES_0.10.0.md
"""

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    from git import Repo, GitCommandError
except ImportError:
    print("[ERROR] エラー: GitPythonがインストールされていません。", file=sys.stderr)
    print("", file=sys.stderr)
    print("以下のコマンドでインストールしてください:", file=sys.stderr)
    print("  pip install gitpython", file=sys.stderr)
    print("", file=sys.stderr)
    sys.exit(1)


# コンベンショナルコミットの正規表現
COMMIT_PATTERN = re.compile(
    r'^(?P<type>feat|fix|refactor|docs|style|perf|test|chore|ci|revert|build)'
    r'(?:\((?P<scope>[^)]+)\))?'
    r':\s*(?P<description>.+)',
    re.IGNORECASE
)

# タイプごとのカテゴリマッピング
TYPE_CATEGORIES = {
    'feat': '追加',
    'fix': '修正',
    'refactor': '変更',
    'docs': '変更',
    'style': '変更',
    'perf': '変更',
    'test': '変更',
    'chore': '変更',
    'ci': '変更',
    'revert': '変更',
    'build': '変更',
}


def parse_commit_message(message: str) -> Optional[Tuple[str, Optional[str], str]]:
    """
    コミットメッセージをパースしてtype、scope、descriptionを抽出

    Args:
        message: コミットメッセージの1行目

    Returns:
        (type, scope, description) のタプル、パースできない場合はNone
    """
    match = COMMIT_PATTERN.match(message)
    if match:
        return (
            match.group('type').lower(),
            match.group('scope'),
            match.group('description').strip()
        )
    return None


def get_commits_in_range(repo_path: Path, from_ref: str, to_ref: Optional[str] = None) -> List[Dict]:
    """
    指定範囲のコミットを取得

    Args:
        repo_path: リポジトリのパス
        from_ref: 開始リファレンス（タグ、ブランチ、コミットハッシュ）
        to_ref: 終了リファレンス（省略時はHEAD）

    Returns:
        コミット情報のリスト
    """
    try:
        repo = Repo(repo_path)
    except Exception as e:
        print(f"[ERROR] エラー: Gitリポジトリを開けませんでした: {e}", file=sys.stderr)
        sys.exit(1)

    # 範囲指定を構築
    if to_ref:
        commit_range = f"{from_ref}..{to_ref}"
    else:
        commit_range = f"{from_ref}..HEAD"

    # コミットを取得
    try:
        commits = list(repo.iter_commits(commit_range))
    except GitCommandError as e:
        print(f"[ERROR] エラー: コミット範囲が無効です: {commit_range}", file=sys.stderr)
        print(f"詳細: {e}", file=sys.stderr)
        sys.exit(1)

    if not commits:
        print(f"[WARN] 警告: 指定範囲にコミットが見つかりませんでした: {commit_range}", file=sys.stderr)

    # コミット情報を抽出
    commit_list = []
    for commit in commits:
        message_lines = commit.message.strip().split('\n')
        first_line = message_lines[0]

        commit_list.append({
            'hash': commit.hexsha[:7],
            'message': first_line,
            'full_message': commit.message.strip(),
            'author': commit.author.name,
            'date': datetime.fromtimestamp(commit.committed_date)
        })

    return commit_list


def categorize_commits(commits: List[Dict]) -> Dict[str, List[Dict]]:
    """
    コミットをカテゴリ別に分類

    Args:
        commits: コミット情報のリスト

    Returns:
        カテゴリ別のコミット辞書
    """
    categorized = defaultdict(list)

    for commit in commits:
        parsed = parse_commit_message(commit['message'])

        if parsed:
            commit_type, scope, description = parsed
            category = TYPE_CATEGORIES.get(commit_type, 'その他')

            categorized[category].append({
                'type': commit_type,
                'scope': scope,
                'description': description,
                'hash': commit['hash'],
                'full_message': commit['full_message']
            })
        else:
            # コンベンショナルコミット形式でない場合は「その他」に分類
            categorized['その他'].append({
                'type': 'other',
                'scope': None,
                'description': commit['message'],
                'hash': commit['hash'],
                'full_message': commit['full_message']
            })

    return categorized


def generate_release_notes(version: str, categorized_commits: Dict[str, List[Dict]], date: Optional[datetime] = None) -> str:
    """
    Markdown形式のリリースノートを生成

    Args:
        version: バージョン番号（vプレフィックス付き）
        categorized_commits: カテゴリ別コミット辞書
        date: リリース日（省略時は今日）

    Returns:
        Markdown形式のリリースノート
    """
    if date is None:
        date = datetime.now()

    # バージョンからvプレフィックスを削除（あれば）
    version_str = version.lstrip('v')

    lines = [
        f"# v{version_str} ({date.strftime('%Y-%m-%d')})",
        ""
    ]

    # カテゴリの順序を定義
    category_order = ['追加', '修正', '変更', 'その他']

    for category in category_order:
        if category not in categorized_commits:
            continue

        commits = categorized_commits[category]
        if not commits:
            continue

        lines.append(f"## {category}")
        lines.append("")

        for commit in commits:
            # スコープがある場合は表示
            if commit['scope']:
                scope_str = f"**{commit['scope']}**: "
            else:
                scope_str = ""

            lines.append(f"- {scope_str}{commit['description']}")

        lines.append("")

    return '\n'.join(lines)


def update_package_json_version(repo_path: Path, version: str) -> bool:
    """
    package.jsonのversionフィールドを更新

    Args:
        repo_path: リポジトリのパス
        version: 新しいバージョン番号（vプレフィックス付きでもOK）

    Returns:
        更新が成功したかどうか
    """
    package_json_path = repo_path / 'package.json'

    if not package_json_path.exists():
        print(f"[ERROR] エラー: package.jsonが見つかりません: {package_json_path}", file=sys.stderr)
        return False

    try:
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"[ERROR] エラー: package.jsonのパースに失敗しました: {e}", file=sys.stderr)
        return False

    # バージョンからvプレフィックスを削除
    version_str = version.lstrip('v')

    # バージョンを更新
    old_version = package_data.get('version', '不明')
    package_data['version'] = version_str

    try:
        with open(package_json_path, 'w', encoding='utf-8') as f:
            json.dump(package_data, f, indent=2, ensure_ascii=False)
            f.write('\n')  # 末尾に改行を追加
    except Exception as e:
        print(f"[ERROR] エラー: package.jsonの書き込みに失敗しました: {e}", file=sys.stderr)
        return False

    print(f"[OK] package.jsonのバージョンを更新: {old_version} → {version_str}")
    return True


def main():
    parser = argparse.ArgumentParser(
        description='Git logからリリースノートを自動生成します。',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  # 前回のタグから現在までの変更を抽出
  uv run generate-release-notes.py --from v0.10.0 --version v0.11.0 --output RELEASE_NOTES.md

  # package.jsonのversionも更新
  uv run generate-release-notes.py --from v0.10.0 --version v0.11.0 --update-package-json --output RELEASE_NOTES.md

  # 2つのタグ間の差分
  uv run generate-release-notes.py --from v0.9.0 --to v0.10.0 --output RELEASE_NOTES_0.10.0.md
        """
    )

    parser.add_argument(
        '--from',
        dest='from_ref',
        required=True,
        help='開始リファレンス（タグ、ブランチ、コミットハッシュ）'
    )

    parser.add_argument(
        '--to',
        dest='to_ref',
        help='終了リファレンス（省略時はHEAD）'
    )

    parser.add_argument(
        '--version',
        help='リリースバージョン（vプレフィックス付きでもOK）'
    )

    parser.add_argument(
        '--output',
        default='RELEASE_NOTES.md',
        help='出力ファイル名（デフォルト: RELEASE_NOTES.md）'
    )

    parser.add_argument(
        '--update-package-json',
        action='store_true',
        help='package.jsonのversionフィールドを更新する'
    )

    args = parser.parse_args()

    # バージョンが指定されていない場合はto_refから推測
    if not args.version:
        if args.to_ref:
            args.version = args.to_ref
        else:
            print("[ERROR] エラー: --versionまたは--toを指定してください。", file=sys.stderr)
            sys.exit(1)

    # カレントディレクトリをリポジトリルートとする
    repo_path = Path.cwd()

    print(f"[INFO] リリースノート生成開始...")
    print(f"   バージョン: {args.version}")
    print(f"   範囲: {args.from_ref} → {args.to_ref or 'HEAD'}")
    print()

    # コミットを取得
    commits = get_commits_in_range(repo_path, args.from_ref, args.to_ref)

    if not commits:
        print("[WARN] 警告: コミットがないため、リリースノートは生成されません。", file=sys.stderr)
        sys.exit(0)

    print(f"[OK] {len(commits)}件のコミットを取得しました。")

    # コミットを分類
    categorized = categorize_commits(commits)

    # カテゴリごとのコミット数を表示
    for category, category_commits in categorized.items():
        print(f"   {category}: {len(category_commits)}件")

    print()

    # リリースノートを生成
    release_notes = generate_release_notes(args.version, categorized)

    # ファイルに出力
    output_path = Path(args.output)
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(release_notes)
        print(f"[OK] リリースノートを生成しました: {output_path}")
    except Exception as e:
        print(f"[ERROR] エラー: ファイルの書き込みに失敗しました: {e}", file=sys.stderr)
        sys.exit(1)

    # package.jsonを更新
    if args.update_package_json:
        print()
        if update_package_json_version(repo_path, args.version):
            print("[OK] package.jsonの更新が完了しました。")
        else:
            print("[WARN] 警告: package.jsonの更新に失敗しました。", file=sys.stderr)

    print()
    print("[SUCCESS] リリースノート生成が完了しました！")


if __name__ == '__main__':
    main()
