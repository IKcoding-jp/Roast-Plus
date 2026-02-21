# タスクリスト

**Issue**: #220
**作成日**: 2026-02-11

## フェーズ1: Firebase Preview Channel 設定

- [ ] Firebase Hosting Preview Channel のドキュメントを確認
- [ ] `.github/workflows/preview.yml` を新規作成
- [ ] PR作成時にビルド→プレビューデプロイするワークフローを実装
- [ ] `firebase.json` に Preview Channel 設定を追加（必要に応じて）
- [ ] プレビューURL をPRコメントに自動投稿する設定を追加
- [ ] テストPRを作成してプレビューデプロイが動作することを確認

## フェーズ2: commitlint 導入

- [ ] `npm install --save-dev @commitlint/cli @commitlint/config-conventional` を実行
- [ ] `commitlint.config.js` を作成
- [ ] 日本語コミットメッセージに対応した設定を追加（`header-max-length` 調整等）
- [ ] Conventional Commits規約のルールを確認（feat/fix/chore/docs等）
- [ ] `.husky/commit-msg` を作成
- [ ] commit-msgフックに `npx --no -- commitlint --edit $1` を追加
- [ ] テストコミットで規約外メッセージが拒否されることを確認

## フェーズ3: smoke test 実装

- [ ] デプロイ後のヘルスチェックスクリプトを作成（`scripts/smoke-test.js`）
- [ ] デプロイURLに対して200レスポンスを確認
- [ ] 主要エンドポイント（`/`, `/login`, `/tasting` 等）をテスト
- [ ] `.github/workflows/deploy.yml` にsmoke testステップを追加
- [ ] smoke test失敗時にデプロイをロールバックする設定（必要に応じて）
- [ ] CIでsmoke testが正常に動作することを確認

## フェーズ4: 検証

- [ ] テストPRを作成し、プレビューURLが正しく生成されることを確認
- [ ] 規約外のコミットメッセージを試し、commitlintが拒否することを確認
- [ ] デプロイ後にsmoke testが実行されることを確認
- [ ] CI/CDパイプライン全体が正常に動作することを確認
- [ ] `docs/steering/TECH_SPEC.md` にCI/CD改善内容を記載

## 依存関係

- フェーズ1〜3は並行実行可能（各実装が独立）
- フェーズ4は全フェーズ完了後に検証
