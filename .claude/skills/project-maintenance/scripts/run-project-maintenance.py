#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "lizard>=1.18.0",
# ]
# ///
"""
RoastPlusプロジェクトメンテナンススクリプト（統合監査）

複雑度・セキュリティ・デッドコードの3つの監査を統合実行し、
リファクタリング対象を優先順位付けして特定します。

Usage:
    uv run run-project-maintenance.py [--all] [--complexity] [--security] [--deadcode] [--output FILE]
"""

import argparse
import subprocess
import sys
import json
import os
from pathlib import Path
from datetime import datetime
import shutil

# Windows環境でのUTF-8出力を有効化
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
    os.environ['PYTHONIOENCODING'] = 'utf-8'


# ============================================================================
# Complexity Audit (Lizard)
# ============================================================================

def check_lizard_installed() -> bool:
    """Lizardがインストールされているか確認"""
    return shutil.which("lizard") is not None


def run_complexity_audit(target_dirs: list[str], ccn_threshold: int, nloc_threshold: int) -> dict:
    """
    複雑度監査を実行

    Returns:
        {
            'success': bool,
            'critical': [...],
            'danger': [...],
            'warning': [...],
            'total_warnings': int
        }
    """
    if not check_lizard_installed():
        print("  ⚠ Lizardが見つかりません。複雑度監査をスキップします。", file=sys.stderr)
        return {'success': False, 'critical': [], 'danger': [], 'warning': [], 'total_warnings': 0}

    print("Phase 1: 複雑度解析（Lizard）を実行中...")

    cmd = [
        "lizard",
        *target_dirs,
        "-C", str(ccn_threshold),
        "-L", str(nloc_threshold),
        "-w"
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        output = result.stdout

        # パース
        critical, danger, warning = [], [], []
        for line in output.split('\n'):
            if ': warning:' in line and 'has' in line and 'CCN' in line:
                try:
                    parts = line.split(':')
                    if len(parts) < 3:
                        continue

                    file_path = parts[0].strip()
                    warning_msg = line.split('warning:')[1].strip()
                    func_name = warning_msg.split('has')[0].strip()
                    ccn_str = warning_msg.split('CCN')[1].split(',')[0].strip()
                    nloc_str = warning_msg.split('NLOC')[1].strip() if 'NLOC' in warning_msg else "0"

                    ccn = int(ccn_str)
                    nloc = int(nloc_str)
                    item = (file_path, func_name, ccn, nloc)

                    if ccn >= 51:
                        critical.append(item)
                    elif ccn >= 26:
                        danger.append(item)
                    else:
                        warning.append(item)
                except (ValueError, IndexError):
                    continue

        critical.sort(key=lambda x: x[2], reverse=True)
        danger.sort(key=lambda x: x[2], reverse=True)
        warning.sort(key=lambda x: x[2], reverse=True)

        total = len(critical) + len(danger) + len(warning)
        print(f"  検出: {total}件の警告")

        return {
            'success': True,
            'critical': critical,
            'danger': danger,
            'warning': warning,
            'total_warnings': total
        }
    except Exception as e:
        print(f"  ✗ エラー: {e}", file=sys.stderr)
        return {'success': False, 'critical': [], 'danger': [], 'warning': [], 'total_warnings': 0}


# ============================================================================
# Security Audit (Gitleaks + npm audit)
# ============================================================================

def check_gitleaks_installed() -> bool:
    """Gitleaksがインストールされているか確認"""
    return shutil.which("gitleaks") is not None or shutil.which("gitleaks.exe") is not None


def run_security_audit() -> dict:
    """
    セキュリティ監査を実行

    Returns:
        {
            'success': bool,
            'gitleaks_success': bool,
            'gitleaks_secrets': [...],
            'npm_audit_status': 'PASS'|'WARN'|'FAIL',
            'npm_audit_vulns': {...}
        }
    """
    print("Phase 2: セキュリティ監査（Gitleaks + npm audit）を実行中...")

    # Gitleaks
    gitleaks_success = True
    gitleaks_secrets = []

    if check_gitleaks_installed():
        cmd = ["gitleaks", "detect", "--source", ".", "-v", "--no-git"]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
            if result.returncode == 0:
                print("  ✓ シークレット検出: なし")
            else:
                gitleaks_success = False
                for line in result.stderr.split('\n') + result.stdout.split('\n'):
                    if 'Secret' in line or 'leak' in line.lower():
                        gitleaks_secrets.append({'description': line.strip()})
                print(f"  ✗ シークレット検出: {len(gitleaks_secrets)}件")
        except Exception:
            print("  ⚠ Gitleaks実行エラー", file=sys.stderr)
    else:
        print("  ⚠ Gitleaksが見つかりません。スキップします。", file=sys.stderr)

    # npm audit
    npm_audit_status = "PASS"
    npm_audit_vulns = {}

    cmd = ["npm", "audit", "--json"]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        data = json.loads(result.stdout)

        if 'vulnerabilities' in data:
            total = data.get('metadata', {}).get('vulnerabilities', {})
            critical = total.get('critical', 0)
            high = total.get('high', 0)
            moderate = total.get('moderate', 0)
            low = total.get('low', 0)

            print(f"  検出: Critical {critical}, High {high}, Moderate {moderate}, Low {low}")

            if critical > 0 or high > 0:
                npm_audit_status = "FAIL"
            elif moderate > 0:
                npm_audit_status = "WARN"

            npm_audit_vulns = {
                'critical': critical,
                'high': high,
                'moderate': moderate,
                'low': low
            }
    except Exception as e:
        print(f"  ⚠ npm audit実行エラー: {e}", file=sys.stderr)

    return {
        'success': gitleaks_success and npm_audit_status != "FAIL",
        'gitleaks_success': gitleaks_success,
        'gitleaks_secrets': gitleaks_secrets,
        'npm_audit_status': npm_audit_status,
        'npm_audit_vulns': npm_audit_vulns
    }


# ============================================================================
# Deadcode Audit (Knip)
# ============================================================================

def check_knip_installed() -> bool:
    """Knipがインストールされているか確認"""
    package_json = Path("package.json")
    if not package_json.exists():
        return False
    try:
        with open(package_json, encoding="utf-8") as f:
            data = json.load(f)
            return "knip" in data.get("devDependencies", {})
    except Exception:
        return False


def run_deadcode_audit() -> dict:
    """
    デッドコード監査を実行

    Returns:
        {
            'success': bool,
            'unused_files': [...],
            'unused_dependencies': [...],
            'unused_exports': [...],
            'total_issues': int
        }
    """
    if not check_knip_installed():
        print("  ⚠ Knipが見つかりません。デッドコード監査をスキップします。", file=sys.stderr)
        return {'success': False, 'unused_files': [], 'unused_dependencies': [], 'unused_exports': [], 'total_issues': 0}

    print("Phase 3: デッドコード検出（Knip）を実行中...")

    cmd = ["npm", "run", "deadcode"]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
        output = result.stdout

        # パース
        unused_files = []
        unused_dependencies = []
        unused_exports = []

        current_category = None
        for line in output.split('\n'):
            line = line.strip()

            if 'unused files' in line.lower():
                current_category = 'files'
            elif 'unused dependencies' in line.lower():
                current_category = 'dependencies'
            elif 'unused exports' in line.lower():
                current_category = 'exports'
            elif current_category and line and (line.startswith('  ') or line.startswith('\t')):
                item = line.strip()
                if current_category == 'files':
                    unused_files.append(item)
                elif current_category == 'dependencies':
                    unused_dependencies.append(item)
                elif current_category == 'exports':
                    unused_exports.append(item)

        total = len(unused_files) + len(unused_dependencies) + len(unused_exports)
        print(f"  検出: {total}件の問題")

        return {
            'success': True,
            'unused_files': unused_files,
            'unused_dependencies': unused_dependencies,
            'unused_exports': unused_exports,
            'total_issues': total
        }
    except Exception as e:
        print(f"  ✗ エラー: {e}", file=sys.stderr)
        return {'success': False, 'unused_files': [], 'unused_dependencies': [], 'unused_exports': [], 'total_issues': 0}


# ============================================================================
# Integrated Report Generation
# ============================================================================

def generate_integrated_report(complexity_result: dict, security_result: dict, deadcode_result: dict) -> str:
    """統合Markdown形式のレポートを生成"""

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 全体ステータス判定
    overall_status = "✅ PASS"
    if not security_result['success']:
        overall_status = "❌ FAIL"
    elif complexity_result['total_warnings'] > 0 or deadcode_result['total_issues'] > 0:
        overall_status = "⚠️ WARNING"

    report = f"""# プロジェクトメンテナンスレポート

**日時**: {timestamp}
**対象**: RoastPlus
**全体ステータス**: {overall_status}

---

## 📊 総合サマリー

| カテゴリ | ステータス | 重要度HIGH | 要対応 |
|---------|-----------|-----------|--------|
| 複雑度 | {"⚠️ WARNING" if complexity_result['total_warnings'] > 0 else "✅ PASS"} | {len(complexity_result['critical'])}件 | {len(complexity_result['critical']) + len(complexity_result['danger'])}件 |
| セキュリティ | {"❌ FAIL" if not security_result['success'] else "✅ PASS"} | {len(security_result['gitleaks_secrets'])}件 | {security_result['npm_audit_vulns'].get('critical', 0) + security_result['npm_audit_vulns'].get('high', 0)}件 |
| デッドコード | {"⚠️ WARNING" if deadcode_result['total_issues'] > 0 else "✅ PASS"} | 0件 | {len(deadcode_result['unused_files']) + len(deadcode_result['unused_dependencies'])}件 |

---

## 🎯 優先アクション（統合推奨順）

"""

    # 優先度付きアクションリストを生成
    actions = []

    # Critical複雑度（最優先）
    for file_path, func_name, ccn, nloc in complexity_result['critical'][:3]:
        short_path = '/'.join(Path(file_path).parts[-2:]) if len(Path(file_path).parts) > 1 else file_path
        actions.append(f"【最優先】`{short_path}:{func_name}` 複雑度削減 (CCN: {ccn})")

    # セキュリティ問題
    if not security_result['gitleaks_success']:
        actions.append(f"【最優先】シークレット漏洩の修正 ({len(security_result['gitleaks_secrets'])}件)")

    critical_vulns = security_result['npm_audit_vulns'].get('critical', 0)
    high_vulns = security_result['npm_audit_vulns'].get('high', 0)
    if critical_vulns > 0 or high_vulns > 0:
        actions.append(f"【高】依存関係の脆弱性修正 (Critical: {critical_vulns}, High: {high_vulns})")

    # Danger複雑度
    for file_path, func_name, ccn, nloc in complexity_result['danger'][:3]:
        short_path = '/'.join(Path(file_path).parts[-2:]) if len(Path(file_path).parts) > 1 else file_path
        actions.append(f"【高】`{short_path}:{func_name}` 複雑度削減 (CCN: {ccn})")

    # デッドコード
    if deadcode_result['unused_dependencies']:
        actions.append(f"【中】未使用依存関係削除 ({len(deadcode_result['unused_dependencies'])}件)")

    if deadcode_result['unused_files']:
        actions.append(f"【中】未使用ファイル削除 ({len(deadcode_result['unused_files'])}件)")

    if deadcode_result['unused_exports']:
        actions.append(f"【低】未使用エクスポート削除 ({len(deadcode_result['unused_exports'])}件)")

    for i, action in enumerate(actions, 1):
        report += f"{i}. {action}\n"

    if not actions:
        report += "なし - すべて正常です！\n"

    report += """
---

## 詳細レポート

### 1. 複雑度解析（Lizard）

"""

    if not complexity_result['success']:
        report += "⚠️ Lizardがインストールされていないため、スキップされました。\n\n"
    elif complexity_result['total_warnings'] == 0:
        report += "✅ 閾値を超える複雑な関数は検出されませんでした。\n\n"
    else:
        report += f"""**検出**: {complexity_result['total_warnings']}件の警告

| 重症度 | CCN範囲 | 件数 |
|--------|---------|------|
| 即対応（Critical） | 51+ | {len(complexity_result['critical'])}件 |
| 危険（Danger） | 26-50 | {len(complexity_result['danger'])}件 |
| 警告（Warning） | 16-25 | {len(complexity_result['warning'])}件 |

"""

        # Top 10
        all_functions = complexity_result['critical'] + complexity_result['danger'] + complexity_result['warning']
        top_10 = all_functions[:10]

        if top_10:
            report += "#### Top 10 複雑関数\n\n"
            report += "| ファイル | 関数名 | CCN | NLOC | 重症度 |\n"
            report += "|---------|--------|-----|------|--------|\n"

            for file_path, func_name, ccn, nloc in top_10:
                if ccn >= 51:
                    severity = "🔴 即対応"
                elif ccn >= 26:
                    severity = "🟠 危険"
                else:
                    severity = "🟡 警告"

                short_path = '/'.join(Path(file_path).parts[-2:]) if len(Path(file_path).parts) > 1 else file_path
                report += f"| `{short_path}` | `{func_name}` | {ccn} | {nloc} | {severity} |\n"

            report += "\n"

    report += """---

### 2. セキュリティ監査（Gitleaks + npm audit）

"""

    # Gitleaks
    if security_result['gitleaks_success']:
        report += "✅ **シークレット検出**: なし\n\n"
    else:
        report += f"❌ **シークレット検出**: {len(security_result['gitleaks_secrets'])}件\n\n"
        report += "⚠️ **即座に対応が必要です！** コミットする前にシークレットを削除してください。\n\n"

    # npm audit
    npm_status = security_result['npm_audit_status']
    vulns = security_result['npm_audit_vulns']

    if npm_status == "PASS":
        report += "✅ **依存関係スキャン**: 脆弱性なし\n\n"
    else:
        report += f"""{"❌" if npm_status == "FAIL" else "⚠️"} **依存関係スキャン**: 脆弱性検出

- Critical: {vulns.get('critical', 0)}件
- High: {vulns.get('high', 0)}件
- Moderate: {vulns.get('moderate', 0)}件
- Low: {vulns.get('low', 0)}件

**対応**: `npm audit fix` で修正可能か確認してください。

"""

    report += """---

### 3. デッドコード検出（Knip）

"""

    if not deadcode_result['success']:
        report += "⚠️ Knipがインストールされていないため、スキップされました。\n\n"
    elif deadcode_result['total_issues'] == 0:
        report += "✅ デッドコードは検出されませんでした。\n\n"
    else:
        report += f"""**検出**: {deadcode_result['total_issues']}件の問題

| カテゴリ | 件数 |
|---------|------|
| 未使用ファイル | {len(deadcode_result['unused_files'])}件 |
| 未使用依存関係 | {len(deadcode_result['unused_dependencies'])}件 |
| 未使用エクスポート | {len(deadcode_result['unused_exports'])}件 |

"""

        if deadcode_result['unused_dependencies']:
            report += "#### 未使用依存関係\n\n"
            for dep in deadcode_result['unused_dependencies'][:10]:
                report += f"- `{dep}` → `npm uninstall {dep}`\n"
            if len(deadcode_result['unused_dependencies']) > 10:
                report += f"\n... 他 {len(deadcode_result['unused_dependencies']) - 10}件\n"
            report += "\n"

    report += """---

## 📚 リファクタリング手法

### 複雑度削減のパターン

1. **ガード節の導入** - 早期リターンでネストを削減
2. **関数の抽出** - 一つの責務に分割
3. **ストラテジーパターン** - 条件分岐をポリモーフィズムで置換
4. **テーブル駆動** - switch/if-else チェーンをマップに変換
5. **コンポーネント分割** - 巨大なReactコンポーネントを子コンポーネントに分離

### 優先順位の判断基準

1. **CCNが最も高い関数**から着手（複雑度削減効果が最大）
2. **頻繁に変更されるファイル**を優先（`git log --follow <file> | wc -l`）
3. **テストカバレッジが低い箇所**を優先（リファクタ後の検証が難しい）
4. **セキュリティ問題**は最優先で対応

---

*このレポートは `/project-maintenance` スキルによって自動生成されました。*
"""

    return report


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="RoastPlusプロジェクトメンテナンススクリプト（統合監査）"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="すべての監査を実行（デフォルト）"
    )
    parser.add_argument(
        "--complexity",
        action="store_true",
        help="複雑度監査のみ実行"
    )
    parser.add_argument(
        "--security",
        action="store_true",
        help="セキュリティ監査のみ実行"
    )
    parser.add_argument(
        "--deadcode",
        action="store_true",
        help="デッドコード監査のみ実行"
    )
    parser.add_argument(
        "--ccn-threshold",
        type=int,
        default=15,
        help="CCN閾値（デフォルト: 15）"
    )
    parser.add_argument(
        "--nloc-threshold",
        type=int,
        default=50,
        help="論理行数（NLOC）閾値（デフォルト: 50）"
    )
    parser.add_argument(
        "--target",
        nargs="+",
        default=["app", "components", "hooks", "lib", "types", "scripts"],
        help="スキャン対象ディレクトリ（複雑度監査用）"
    )
    parser.add_argument(
        "--output",
        help="レポート出力先ファイルパス（指定しない場合は標準出力）"
    )

    args = parser.parse_args()

    # デフォルトは --all
    run_all = args.all or not (args.complexity or args.security or args.deadcode)

    print("=" * 60)
    print("RoastPlus プロジェクトメンテナンス")
    print("=" * 60)
    print()

    # 対象ディレクトリの存在確認
    existing_dirs = []
    for dir_name in args.target:
        if Path(dir_name).exists():
            existing_dirs.append(dir_name)

    # 各監査を実行
    complexity_result = {'success': False, 'critical': [], 'danger': [], 'warning': [], 'total_warnings': 0}
    security_result = {'success': True, 'gitleaks_success': True, 'gitleaks_secrets': [], 'npm_audit_status': 'PASS', 'npm_audit_vulns': {}}
    deadcode_result = {'success': False, 'unused_files': [], 'unused_dependencies': [], 'unused_exports': [], 'total_issues': 0}

    if run_all or args.complexity:
        complexity_result = run_complexity_audit(existing_dirs, args.ccn_threshold, args.nloc_threshold)
        print()

    if run_all or args.security:
        security_result = run_security_audit()
        print()

    if run_all or args.deadcode:
        deadcode_result = run_deadcode_audit()
        print()

    # 統合レポート生成
    report = generate_integrated_report(complexity_result, security_result, deadcode_result)

    # 出力
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(report, encoding="utf-8")
        print(f"レポートを保存しました: {output_path.resolve()}")
    else:
        print(report)

    print()
    print("=" * 60)

    # 全体ステータスに基づいて終了コード返す
    if not security_result['success']:
        print("❌ プロジェクトメンテナンス: FAIL")
        sys.exit(1)
    elif complexity_result['total_warnings'] > 0 or deadcode_result['total_issues'] > 0:
        print("⚠️ プロジェクトメンテナンス: WARNING")
    else:
        print("✅ プロジェクトメンテナンス: PASS")


if __name__ == "__main__":
    main()
