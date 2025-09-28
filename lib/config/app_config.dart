import 'package:flutter/services.dart' show rootBundle;

/// アプリ全体の設定を管理するクラス
class AppConfig {
  // 寄付者として登録されたメールアドレス
  static Future<List<String>> get donorEmails async {
    try {
      // 環境変数ファイルから寄付者メールアドレスを取得
      final envContent = await rootBundle.loadString('assets/app_config.env');
      final lines = envContent.split('\n');

      final donorEmails = <String>[];

      for (var line in lines) {
        line = line.trim();
        if (line.isEmpty || line.startsWith('#')) continue;

        final parts = line.split('=');
        if (parts.length == 2) {
          final key = parts[0].trim();
          final value = parts[1].trim();

          if (key == 'DONOR_EMAILS') {
            // カンマ区切りで複数のメールアドレスをサポート
            donorEmails.addAll(value.split(',').map((email) => email.trim()));
          }
        }
      }

      return donorEmails;
    } catch (e) {
      // エラーが発生した場合は空のリストを返す
      // デバッグログとして出力（本番環境では無効化される）
      // ignore: avoid_print
      print('寄付者メールアドレスの読み込みに失敗しました: $e');
      return [];
    }
  }

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
    const developerEmails = [
      'developer@roastplus.com',
      'admin@roastplus.com',
      'support@roastplus.com',
    ];

    return developerEmails.contains(email.toLowerCase());
  }

  // フィードバック受信メールアドレス
  static String get feedbackRecipientEmail => supportEmail;
}
