# プロジェクトメモリ（ADR: Architecture Decision Records）

> **このファイルは `docs/steering/` に統合されました。**
> 詳細は以下を参照してください。

---

## 移行先

### ADR-001〜003: 技術スタック
→ **`docs/steering/TECH_SPEC.md`** に移行

### ADR-004〜005: AI機能
→ **`docs/steering/FEATURES.md`** の関連機能セクション（焙煎タイマー、テイスティング、スケジュール管理）に移行

### ADR-006: 型定義方針
→ **`docs/steering/GUIDELINES.md`** のコーディング規約セクションに移行

### ADR-007〜008: UI設計
→ **`docs/steering/FEATURES.md`** の共通UIセクション、および **`docs/steering/GUIDELINES.md`** に移行

### ADR-009〜010: 実装パターン
→ **`docs/steering/GUIDELINES.md`** の開発フローセクションに移行

---

## 過去のADR一覧（参照用）

### ADR-001: Next.js + Firebase による PWA 構成を採用
- **日付**: 2025-01 （プロジェクト開始時）
- **状態**: 承認
- **決定**: Next.js (App Router) + Firebase (Auth, Firestore, Storage, Hosting) で構築
- **理由**: PWA対応、リアルタイム同期、オフラインサポート、サーバーレス運用が可能
- **影響**: NoSQLスキーマ設計が必要、Firestoreのトランザクション制約を考慮した設計

### ADR-002: Tailwind CSS v4 をスタイリング基盤として採用
- **日付**: 2025-01
- **状態**: 承認
- **決定**: Tailwind CSS v4 のユーティリティクラスを直接使用（CSS Modules不使用）
- **理由**: 高速なプロトタイピング、コンポーネントとスタイルの密結合による可読性
- **影響**: 繰り返しパターンは定数化（`DIFFICULTY_STYLES`等）、ブランドカラー `#211714`（深茶色）を基調

### ADR-003: Vitest をテストフレームワークとして採用
- **日付**: 2025-12
- **状態**: 承認
- **決定**: Jest ではなく Vitest を使用（jsdom環境、@testing-library/react 併用）
- **理由**: Vite互換の高速実行、ESM ネイティブサポート、Next.js との親和性
- **影響**: `vitest.config.ts` でパスエイリアス `@` を設定、coverage は text/html 形式

### ADR-004: OCR処理を OpenAI GPT-4o Vision に統一
- **日付**: 2025年中期
- **状態**: 承認（Google Vision API から移行）
- **決定**: スケジュールOCR処理を Google Vision API から OpenAI GPT-4o Vision に置き換え
- **理由**: Google Vision APIキーエラー問題の解消、OpenAI一本化によるコード簡潔化
- **影響**: Firebase Functions から Google Vision 依存（import, secret, client生成）を削除

### ADR-005: AI分析を自動実行パターンに変更
- **日付**: 2025年中期
- **状態**: 承認
- **決定**: TastingSession の AI分析をボタン式から自動実行に変更
- **理由**: UX改善 — 分析結果がない場合に自動的に分析を開始することでユーザー操作を削減
- **影響**: `aiAnalysis` フィールドを TastingSession に追加、UIボタン廃止

### ADR-006: 型定義は interface 優先、ユニオン型は type
- **日付**: 2025-01
- **状態**: 承認
- **決定**: オブジェクト構造定義には `interface`、ユニオン型・マッピング型には `type` を使用
- **理由**: `interface` は extends による拡張性が高く、エラーメッセージが読みやすい
- **影響**: `docs/steering/GUIDELINES.md` に詳細ルールを記載

### ADR-007: レスポンシブレイアウトはモバイルファースト + md以上で分岐
- **日付**: 2025年中期
- **状態**: 承認
- **決定**: モバイル表示は変更せず、md（768px）以上でタブレット/PC向け横長カード・左右分割レイアウトを採用
- **理由**: 主要ユーザーはモバイルだが、タブレットでの店舗利用も想定
- **影響**: テイスティング画面で「みんなの感想（左）+ レーダーチャート（右）」の固定レイアウト

### ADR-008: ロゴを画像からテキストベースに変更
- **日付**: 2025年中期
- **状態**: 承認
- **決定**: ロゴを画像ファイルからテキストベース（フォント + スタイリング）に移行
- **理由**: フォント統一、表示速度向上、メンテナンス性向上
- **影響**: 画像アセット不要、Tailwind でスタイリング管理

### ADR-009: コンポーネント実装の標準フロー
- **日付**: 2025-01
- **状態**: 承認
- **決定**: 型定義 → Firestore操作（CRUD） → UIコンポーネント の順で実装
- **理由**: データ構造を先に固めることで手戻りを防止
- **影響**: `types/` → `lib/` → `components/` の依存方向が一方向に統一

### ADR-010: 機能別モジュール分割パターン
- **日付**: 2026-01（リファクタリングPR #101〜#103）
- **状態**: 承認
- **決定**: 大きなコンポーネント（500行超）は機能別サブモジュールに分割
- **理由**: 可読性・テスタビリティの向上、AI生成コードの複雑度抑制
- **影響**: `components/roast-timer/`、`components/shared/` 等のサブフォルダ構成

---

## 新しいADRの追加方法

新しい意思決定が必要な場合は、以下の手順を実施：

1. **調査**: 複数の選択肢を比較
2. **ドラフト作成**: 以下のフォーマットで記述

```markdown
### ADR-XXX: [タイトル]
- **日付**: YYYY-MM-DD
- **状態**: 提案 | 承認 | 廃止
- **決定**: [何を決定したか]
- **理由**: [なぜその選択をしたか]
- **影響**: [どのような影響があるか]
```

3. **承認**: ユーザー（または開発チーム）の承認
4. **反映**: 以下のいずれかに追記
   - **技術選定**: `docs/steering/TECH_SPEC.md`
   - **機能設計**: `docs/steering/FEATURES.md`
   - **実装パターン**: `docs/steering/GUIDELINES.md`

---

## 参照

- **技術仕様**: `docs/steering/TECH_SPEC.md`
- **機能一覧**: `docs/steering/FEATURES.md`
- **実装ガイドライン**: `docs/steering/GUIDELINES.md`
- **Steering Documents一覧**: `docs/steering/`
