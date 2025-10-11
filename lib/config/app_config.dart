/// アプリ全体の設定を管理するクラス
class AppConfig {
  // アプリのバージョン情報
  static const String appVersion = '0.7.10+23';

  // アプリの名前
  static const String appName = 'RoastPlus';

  // デバッグモードかどうか
  static const bool isDebug = false;

  // アプリの説明
  static const String appDescription = 'ローストプラス';

  // サポートメールアドレス
  static const String supportEmail = 'support@roastplus.com';

  // プライバシーポリシーのURL
  static const String privacyPolicyUrl = 'https://roastplus.com/privacy';

  // 利用規約のURL
  static const String termsOfServiceUrl = 'https://roastplus.com/terms';

  // アプリストアのURL
  static const String appStoreUrl = 'https://apps.apple.com/app/roastplus';
  static const String googlePlayUrl =
      'https://play.google.com/store/apps/details?id=com.ikcoding.roastplus';

  // 開発者メールアドレスかどうかをチェック
  static bool isDeveloperEmail(String? email) {
    if (email == null || email.isEmpty) return false;

    // 開発者として登録されたメールアドレス
    const developerEmails = ['kensaku.ikeda04@gmail.com'];

    return developerEmails.contains(email.toLowerCase());
  }

  // フィードバック受信メールアドレス
  static String get feedbackRecipientEmail => supportEmail;
}
