# 実装計画: OpenAI Codexへのスキル移行とスキル図の作成

## 概要
現在のプロジェクトで使用しているClaude Agent用スキル（`.claude/skills`）を、OpenAIの新しいAIコーディングエージェント「OpenAI Codex」でも利用できるようにセットアップします。また、スキル構成を可視化する「スキル図」を作成します。

## 背景
OpenAI Codex（2025年5月版）は、Anthropicが提唱した「Agent Skills」オープン仕様をサポートしています。これにより、Claude用に作成された `SKILL.md` 形式のスキルをそのまま、あるいは最小限の変更で利用可能です。

## 実装内容
1.  **スキル図の作成**:
    *   現在の `.claude/skills` にある各スキルの役割と関係性を整理したMermaid図を作成します。
    *   `docs/openai_codex_setup/skill_diagram.md` として保存。
2.  **OpenAI Codex用ディレクトリの作成**:
    *   プロジェクトルートに `.codex/skills` ディレクトリを作成します。
3.  **スキルの同期設定**:
    *   `.claude/skills` 内の各スキルを `.codex/skills` にシンボリックリンクまたはデプロイします。
    *   これにより、一方を編集すれば両方のツールで最新のスキルが利用可能になります。
4.  **移行ガイドの作成**:
    *   `docs/openai_codex_setup/how_to_use_in_codex.md` を作成し、Codexでのスキルの動作確認方法を記載します。

## 手順
1.  `docs/openai_codex_setup` ディレクトリの作成。
2.  `skill_diagram.md` の作成（Mermaid図を含む）。
3.  `.codex/skills` ディレクトリの作成。
4.  PowerShellを使用してシンボリックリンクを作成するスクリプトの実行（または手動作成）。
5.  移行完了の報告。

## 注意事項
*   シンボリックリンクの作成には、Windowsの「開発者モード」が有効であるか、管理者権限が必要です。
*   権限の問題でリンク作成が失敗した場合は、フォルダのコピー（ミラーリング）で対応します。
