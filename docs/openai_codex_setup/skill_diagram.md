# プロジェクト・スキル図 (Skill Diagram)

この図は、プロジェクトに導入されているAIエージェントスキルの構成と、それぞれの役割・連携を示しています。

```mermaid
graph TD
    %% Base Skills
    S_Serena[serena: 高度な分析/解決]
    S_UI[roastplus-ui: UIデザインシステム]
    S_Next[nextjs-firestore: アプリ基盤]
    
    %% Support Skills
    S_Debug[debugging-helper: 問題解決]
    S_Review[code-review-assist: 品質管理]
    S_Git[git-workflow: 自動コミット/分岐]
    
    %% Domain Specific
    S_Flutter[flutter-dart-patterns: モバイル知識]
    S_Deploy[version-deploy: リリース管理]
    S_Creator[claude-skill-creator: スキル拡張]

    %% Relationships
    S_Serena --> S_Next
    S_Serena --> S_UI
    S_Next --> S_Debug
    S_UI --> S_Review
    S_Git --> S_Deploy
    S_Creator --> S_Serena

    %% Tooling Context
    subgraph "開発フロー"
        S_Git
        S_Deploy
    end

    subgraph "コアスタック"
        S_Next
        S_UI
    end

    subgraph "エキスパート機能"
        S_Serena
        S_Debug
        S_Review
    end
```

## スキル概要

| スキル名 | 役割 | 主な用途 |
| :--- | :--- | :--- |
| **serena** | 司令塔・高度分析 | 複雑な機能実装、アーキテクチャ設計 |
| **roastplus-ui** | UI/デザイン | Tailwind/Next.jsコンポーネント実装、一貫性チェック |
| **nextjs-firestore** | フロント/DB | Next.js App Router, Firebase連携の実装 |
| **debugging-helper** | 修正支援 | ランタイムエラー、ロジックミスの特定と修正 |
| **code-review-assist** | 品質向上 | PR前のコードチェック、リファクタリング提案 |
| **git-workflow** | バージョン管理 | コンベンショナルコミットに準拠したコミット |
| **version-deploy** | リリース | package.jsonの更新、デプロイ手順の実行 |
| **flutter-dart-patterns** | モバイル | 以前のFlutter資産の参照、リプレイス支援 |
| **claude-skill-creator** | 自己拡張 | 新しいスキルの作成、既存スキルのメンテナンス |

## OpenAI Codexでの利用

これらのスキルは Anthropic の Agent Skills 標準に準拠しているため、OpenAI Codex でも `.codex/skills` ディレクトリに配置することで、同様の `/命令` 形式や自動検知機能として利用可能です。
