# RoastPlus ☕

**全国のBYSNで働く皆さんのための非公式記録アプリ**

RoastPlusは、コーヒー焙煎業務に従事する従業員のモチベーション向上と業務効率化を目的として開発されたFlutterアプリです。実際にBYSNで働いている従業員が、仕事の質向上のために開発しました。

## 🌟 主要機能

### 📱 焙煎管理

- **焙煎タイマー**: 精密な焙煎時間管理とアラーム機能
- **焙煎記録**: 豆の種類、重さ、焙煎度合い、時間、メモの記録
- **焙煎分析**: 過去の記録データから傾向を分析
- **焙煎スケジュール**: 作業スケジュールの自動作成と管理

### 📊 業務管理

- **TODOリスト**: タスク管理と通知機能
- **ドリップカウンター**: ドリップパックのカウントと統計
- **テイスティング記録**: コーヒーの試飲評価と感想記録
- **作業進捗管理**: 作業状況の記録と進捗率の可視化

### 👥 グループ機能

- **チーム共有**: 仲間とデータを共有して業務を効率化
- **リアルタイム同期**: メンバー間でのリアルタイムデータ同期
- **権限管理**: 管理者・メンバー権限による適切なアクセス制御
- **招待システム**: 簡単なグループ参加と招待

### 🎮 ゲーミフィケーション

- **バッジシステム**: 達成度に応じたバッジ獲得
- **統計ダッシュボード**: 個人・グループの活動統計
- **成長記録**: スキル向上の可視化

## 🚀 技術仕様

### プラットフォーム対応

- **Web**: プログレッシブウェブアプリ（PWA）

### 主要技術スタック

- **フレームワーク**: Flutter 3.8.1+
- **データベース**: Firebase Firestore（リアルタイムデータベース）
- **バックエンド**: Firebase（Authentication、Storage、Hosting）
- **状態管理**: Provider
- **UI/UX**: Material Design 3
- **認証**: Google Sign-In、Firebase Auth
- **通知**: Web Notifications API
- **データ同期**: リアルタイム同期、オフライン対応

## 📱 インストール方法

### Web版（PWA）

1. ブラウザで https://roastplus-site.web.app/ にアクセス
2. 「ホーム画面に追加」でPWAとしてインストール可能
3. アプリを起動してGoogleアカウントでログイン

## 🎯 対象ユーザー

- **BYSN従業員**: コーヒー焙煎業務に従事するスタッフ

## 🔧 開発者向け情報

### 開発環境セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/IKcoding-jp/Roast-Plus.git
cd roastplus

# 依存関係をインストール
flutter pub get

# アプリを実行
flutter run
```

### ビルド方法

```bash
# Web版のみ
flutter build web --release
```

### 主要ディレクトリ構成

```
lib/
├── pages/           # 画面コンポーネント
│   ├── roast/      # 焙煎関連画面
│   ├── business/   # 業務管理画面
│   ├── group/      # グループ機能画面
│   └── settings/   # 設定画面
├── services/        # ビジネスロジック
├── models/          # データモデル
├── widgets/         # 再利用可能なUIコンポーネント
└── utils/           # ユーティリティ関数
```

## 📄 ライセンス

このプロジェクトは非公式アプリです。BYSNとは一切関係ありません。

## 🤝 貢献

バグ報告や機能要望は、GitHubのIssuesページでお知らせください。

## 📞 サポート

- **アプリ内ヘルプ**: 設定 > 使い方ガイド
- **Webサイト**: https://roastplus-site.web.app/
- **プライバシーポリシー**: アプリ内で確認可能

---

**RoastPlus** - コーヒー焙煎業務を、もっと楽しく、もっと効率的に ☕✨

## 🔧 トラブルシューティング

### Web版での描画エラー修正

**エラー**: `"Trying to render a disposed EngineFlutterView"`

このエラーは Web 版で複数の非同期操作がビューの破棄後も続行されるときに発生します。

#### 実施した修正:

1. **状態管理の改善**
   - GroupProvider に `_disposed` フラグを追加し、破棄後の操作を防止
   - `_safeNotifyListeners()` に mounted チェックを2段階実装

2. **リスナー管理の強化**
   - AuthGate の authStateChanges リスナーを StreamSubscription として管理
   - リスナーの購読を dispose() で確実にキャンセル

3. **非同期操作のガード強化**
   - addPostFrameCallback 内で mounted チェックを実施
   - コールバック実行時に再度 mounted 確認

4. **リソースクリーンアップの改善**
   - バックグラウンドサービスの停止にエラーハンドリングを追加
   - AutoSyncService 等のタイマーを確実にキャンセル

5. **Provider の dispose メソッド追加**
   - ThemeSettings に dispose() メソッドを追加
   - StreamSubscription の適切なキャンセル処理を実装

#### 推奨事項:

- 定期的に linter と analysis_options.yaml を確認
- StatefulWidget と Provider の mounted / disposed 状態を常に意識
- Web 版では特に非同期操作のライフサイクル管理に注意