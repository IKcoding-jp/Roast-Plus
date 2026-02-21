# requirement.md — Issue #251: changelog自動化

## 概要
更新履歴ページの表示内容をユーザー向けに最適化し、GitHub Actionsによるchangelog自動生成・バージョン管理の仕組みを構築する。

## 背景
- `data/dev-stories/detailed-changelog.ts` に技術用語が混在（非エンジニア向け不適切）
- 3ファイル（package.json / detailed-changelog.ts / version-history.ts）を毎PR手動更新する運用コストが高い
- `.github/PULL_REQUEST_TEMPLATE.md` に「ユーザー向け更新内容」セクションが既存だが未活用

## 受け入れ基準

### 機能要件
1. **AIドラフト提案**: PR作成時、「ユーザー向け更新内容」が空("-"のみ)なら、AIがユーザー向け説明文のドラフトをPRコメントに投稿する
2. **changelog自動更新**: PRマージ時、「ユーザー向け更新内容」に内容があれば自動でchangelog・バージョンを更新する
3. **内部変更の除外**: ユーザー向け内容が空("-")のPRはバージョンバンプなし・changelog追加なし
4. **バージョン自動インクリメント**:
   - `feat/*` → minor バンプ
   - `fix/*`, `style/*` → patch バンプ
   - `chore/*`, `docs/*`, `refactor/*`, `test/*` → バンプなし

### 非機能要件
- 既存changelogエントリは変更しない（新規エントリから適用）
- 技術用語を含まないユーザー向け表現のみchangelogに掲載
- `[skip ci]` でコミットループを防止

## スコープ外
- 既存changelogエントリのユーザー向け表現への書き換え（別Issue）
- changelog UIの変更（別Issue）
- セマンティックバージョニング（major）の自動化（v1.0.0移行時に検討）

## 参照ドキュメント
- 設計書: `docs/plans/2026-02-22-changelog-automation-design.md`
