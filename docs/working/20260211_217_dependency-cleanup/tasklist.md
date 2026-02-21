# タスクリスト

**Issue**: #217
**作成日**: 2026-02-11

## フェーズ1: 依存関係の現状確認

- [ ] `phosphor-react` を使用している39ファイルをリストアップ
- [ ] `react-icons` を使用している50+ファイルをリストアップ
- [ ] `@phosphor-icons/react` の最新版を確認（後継ライブラリ）
- [ ] アイコンライブラリの統一方針を決定（`react-icons` vs `@phosphor-icons/react`）
- [ ] `@types/uuid` の使用箇所を確認（本番実行時に必要か）
- [ ] CI/CDの Node.js バージョン設定箇所を特定

## フェーズ2: アイコンライブラリの統一

- [ ] 選定したライブラリ（仮: `react-icons`）のインストール確認
- [ ] `phosphor-react` 使用39ファイルのimport文を新ライブラリに変換
- [ ] アイコン名のマッピング表を作成（旧名→新名）
- [ ] 全ファイルのimport文を一括置換
- [ ] TypeScriptコンパイルエラーがないことを確認
- [ ] `npm uninstall phosphor-react` で旧ライブラリを削除

## フェーズ3: @types/uuid の移動

- [ ] `package.json` の dependencies から `@types/uuid` を削除
- [ ] `package.json` の devDependencies に `@types/uuid` を追加
- [ ] `npm install` で依存関係を再構築
- [ ] TypeScriptコンパイルエラーがないことを確認

## フェーズ4: Node.js LTS化

- [ ] `.github/workflows/ci.yml` の `node-version` を 22（LTS）に変更
- [ ] CI実行に影響する他のワークフローファイルがあれば同様に変更
- [ ] `package.json` の `engines.node` フィールドを確認・更新（あれば）

## フェーズ5: 検証

- [ ] `npm run build` でビルドが成功することを確認
- [ ] `npm run lint` でLintエラーがないことを確認
- [ ] `npm run test` で全テストが通ることを確認
- [ ] 開発サーバー起動後、アイコンが正常に表示されることを確認
- [ ] CI/CDパイプラインが Node.js 22 で正常に動作することを確認

## 依存関係

- フェーズ1 → フェーズ2（方針決定後にライブラリ統一）
- フェーズ2 → フェーズ3（アイコン統一完了後に@types/uuid移動）
- フェーズ3 → フェーズ4（依存関係整理後にNode.js LTS化）
- フェーズ4 → フェーズ5（全変更完了後に検証）
