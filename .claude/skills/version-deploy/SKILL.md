---
name: version-deploy
description: アプリのバージョン更新とデプロイ自動化。Next.js(Vercel/Firebase)、Flutter(Android/iOS/Web)のビルド・リリース手順、セマンティックバージョニング、リリースノート生成。deploy、release、version、build時に使用。
---

# バージョン管理・デプロイスキル

アプリケーションのバージョン更新とデプロイを効率化するスキル。

## セマンティックバージョニング

```
MAJOR.MINOR.PATCH

1.0.0 → 2.0.0  # 破壊的変更
1.0.0 → 1.1.0  # 新機能追加
1.0.0 → 1.0.1  # バグ修正
```

---

## Next.js

### バージョン更新

```json
// package.json
{ "version": "0.5.16" }
```

### デプロイ

**Vercel:**
```bash
git push origin main  # 自動デプロイ
```

**Firebase Hosting:**
```bash
npm run build
firebase deploy --only hosting
```

---

## Flutter

### バージョン更新

```yaml
# pubspec.yaml
version: 1.3.1+42  # バージョン+ビルド番号
```

形式: `MAJOR.MINOR.PATCH+BUILD_NUMBER`

### ビルド

**Android AAB:**
```bash
flutter build appbundle --release
```

**iOS:**
```bash
flutter build ios --release
open ios/Runner.xcworkspace
```

**Web:**
```bash
flutter build web --release
firebase deploy --only hosting
```

---

## リリースチェックリスト

デプロイ前の確認事項:

- [ ] **テスト完了** - すべてのテストが合格
- [ ] **Lintエラーなし** - コード品質チェック完了
- [ ] **バージョン番号更新** - package.json / pubspec.yaml
- [ ] **ビルド番号増加** - モバイルアプリの場合
- [ ] **CHANGELOG更新** - 変更内容を記録
- [ ] **環境変数確認** - 本番環境設定が正しいか
- [ ] **ビルド成功** - ローカルでビルドが通るか

---

## リリースノート形式

```markdown
# v1.3.1 (2026-01-31)

## 新機能
- 抽出タイマー機能を追加

## バグ修正
- タイマー停止問題を修正

## 改善
- パフォーマンス最適化
- UIデザイン更新

## 技術的な変更
- Next.js 16にアップグレード
- Firebase SDK最新版に更新
```

---

## デプロイワークフロー

### 1. バージョン番号の決定

変更内容に基づいてインクリメント:
- 破壊的変更 → MAJOR
- 新機能 → MINOR
- バグ修正 → PATCH

### 2. バージョン更新

```bash
# package.json
npm version patch  # 0.5.15 → 0.5.16
npm version minor  # 0.5.16 → 0.6.0
npm version major  # 0.6.0 → 1.0.0
```

### 3. リリースノート作成

CHANGELOGまたはGitHub Releaseに変更内容を記載

### 4. ビルド・テスト

```bash
npm run lint
npm run build
npm run test
```

### 5. デプロイ実行

プラットフォームに応じたデプロイコマンドを実行

### 6. 動作確認

本番環境で主要機能が正常に動作することを確認

---

## AI アシスタント指示

このスキルが有効な場合:

1. **現在のバージョンを確認** - package.json / pubspec.yaml
2. **変更内容に基づいてインクリメント** - git-workflowスキルと連携
3. **ビルド番号は常に増加** - モバイルアプリの場合
4. **デプロイ前にチェックリスト確認** - テスト、Lint、ビルド
5. **リリースノート作成** - 変更内容を明確に記載

### 必ず守ること

- バージョン番号はセマンティックバージョニングに従う
- モバイルアプリのビルド番号は単調増加
- デプロイ前に必ずテストを実行

### 避けること

- テスト未実施でのデプロイ
- バージョン番号の降格
- リリースノートの省略
