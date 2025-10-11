import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import '../utils/security_config.dart';
import '../utils/app_logger.dart';
import 'secure_storage_service.dart';
import 'user_settings_firestore_service.dart';

/// パスコードリカバリーサービス
/// パスワードを忘れた場合の復旧機能を提供
class PasscodeRecoveryService {
  static const String _logName = 'PasscodeRecoveryService';

  // セキュリティ質問のキー
  static const String _keySecurityQuestions = 'security_questions';
  static const String _keyRecoveryToken = 'recovery_token';
  static const String _keyRecoveryAttempts = 'recovery_attempts';
  static const String _keyLastRecoveryAttempt = 'last_recovery_attempt';

  // 最大試行回数
  static const int _maxRecoveryAttempts = 3;
  static const int _lockoutDurationMinutes = 30;

  /// セキュリティ質問を設定
  static Future<void> setSecurityQuestions({
    required String question,
    required String answer,
  }) async {
    try {
      final questions = {
        'question': question,
        'answer': _hashAnswer(answer),
        'setAt': DateTime.now().toIso8601String(),
      };

      await SecureStorageService.saveSecureData(
        _keySecurityQuestions,
        jsonEncode(questions),
      );
      AppLogger.info('セキュリティ質問を設定しました', name: _logName);
    } catch (e) {
      AppLogger.error('セキュリティ質問の設定に失敗しました', name: _logName, error: e);
      rethrow;
    }
  }

  /// セキュリティ質問を取得
  static Future<Map<String, String>?> getSecurityQuestions() async {
    try {
      final questionsJson = await SecureStorageService.getSecureData(
        _keySecurityQuestions,
      );
      if (questionsJson == null) return null;

      final questions = jsonDecode(questionsJson) as Map<String, dynamic>;
      return {'question': questions['question'] as String};
    } catch (e) {
      AppLogger.error('セキュリティ質問の取得に失敗しました', name: _logName, error: e);
      return null;
    }
  }

  /// セキュリティ質問による認証
  static Future<bool> verifySecurityAnswers({required String answer}) async {
    try {
      // 試行回数チェック
      if (await _isRecoveryLocked()) {
        AppLogger.warn('リカバリー試行回数が上限に達しています', name: _logName);
        return false;
      }

      final questionsJson = await SecureStorageService.getSecureData(
        _keySecurityQuestions,
      );
      if (questionsJson == null) {
        AppLogger.warn('セキュリティ質問が設定されていません', name: _logName);
        return false;
      }

      final questions = jsonDecode(questionsJson) as Map<String, dynamic>;

      final correctAnswer = questions['answer'] as String;
      final isAnswerCorrect = _verifyAnswer(answer, correctAnswer);

      // 試行回数を記録
      await _recordRecoveryAttempt(isAnswerCorrect);

      if (isAnswerCorrect) {
        AppLogger.info('セキュリティ質問による認証が成功しました', name: _logName);
        // リカバリートークンを生成
        await _generateRecoveryToken();
      } else {
        AppLogger.warn('セキュリティ質問による認証が失敗しました', name: _logName);
      }

      return isAnswerCorrect;
    } catch (e) {
      AppLogger.error('セキュリティ質問による認証に失敗しました', name: _logName, error: e);
      return false;
    }
  }

  /// リカバリートークンによる認証
  static Future<bool> verifyRecoveryToken(String token) async {
    try {
      final storedToken = await SecureStorageService.getSecureData(
        _keyRecoveryToken,
      );
      if (storedToken == null) return false;

      final isValid = token == storedToken;
      if (isValid) {
        // トークンを削除（ワンタイム使用）
        await SecureStorageService.deleteSecureData(_keyRecoveryToken);
        AppLogger.info('リカバリートークンによる認証が成功しました', name: _logName);
      }

      return isValid;
    } catch (e) {
      AppLogger.error('リカバリートークンの検証に失敗しました', name: _logName, error: e);
      return false;
    }
  }

  /// パスコードをリセット
  static Future<bool> resetPasscode({
    required String newPasscode,
    required String recoveryMethod,
    String? recoveryToken,
  }) async {
    try {
      bool isAuthorized = false;

      // リカバリートークンによる認証
      if (recoveryMethod == 'token' && recoveryToken != null) {
        isAuthorized = await verifyRecoveryToken(recoveryToken);
      }
      // セキュリティ質問による認証
      else if (recoveryMethod == 'questions') {
        // セキュリティ質問による認証は事前に完了している必要がある
        isAuthorized = await _hasValidRecoveryToken();
      }

      if (!isAuthorized) {
        AppLogger.warn('パスコードリセットの認証が失敗しました', name: _logName);
        return false;
      }

      // パスコードを更新
      await SecureStorageService.savePasscode(newPasscode);

      // Firestoreの設定も更新
      await UserSettingsFirestoreService.saveMultipleSettings({
        'passcode': newPasscode,
        'isLockEnabled': true,
      });

      // リカバリー試行回数をリセット
      await _resetRecoveryAttempts();

      AppLogger.info('パスコードがリセットされました', name: _logName);
      return true;
    } catch (e) {
      AppLogger.error('パスコードのリセットに失敗しました', name: _logName, error: e);
      return false;
    }
  }

  /// 管理者によるパスコードリセット
  static Future<bool> adminResetPasscode({
    required String adminPassword,
    required String newPasscode,
  }) async {
    try {
      // 管理者パスワードの検証（実際の実装では適切な管理者認証を使用）
      const adminPasswordHash = 'admin_password_hash'; // 実際の実装では適切なハッシュを使用

      if (!SecurityConfig.verifyPassword(adminPassword, adminPasswordHash)) {
        AppLogger.warn('管理者パスワードが正しくありません', name: _logName);
        return false;
      }

      // パスコードをリセット
      await SecureStorageService.savePasscode(newPasscode);

      // Firestoreの設定も更新
      await UserSettingsFirestoreService.saveMultipleSettings({
        'passcode': newPasscode,
        'isLockEnabled': true,
      });

      // リカバリー試行回数をリセット
      await _resetRecoveryAttempts();

      AppLogger.info('管理者によるパスコードリセットが完了しました', name: _logName);
      return true;
    } catch (e) {
      AppLogger.error('管理者によるパスコードリセットに失敗しました', name: _logName, error: e);
      return false;
    }
  }

  /// セキュリティ質問が設定されているかチェック
  static Future<bool> hasSecurityQuestions() async {
    try {
      final questions = await getSecurityQuestions();
      return questions != null;
    } catch (e) {
      AppLogger.error('セキュリティ質問の存在確認に失敗しました', name: _logName, error: e);
      return false;
    }
  }

  /// リカバリー試行回数を取得
  static Future<int> getRecoveryAttempts() async {
    try {
      final attemptsJson = await SecureStorageService.getSecureData(
        _keyRecoveryAttempts,
      );
      if (attemptsJson == null) return 0;

      final attempts = jsonDecode(attemptsJson) as Map<String, dynamic>;
      return attempts['count'] as int? ?? 0;
    } catch (e) {
      AppLogger.error('リカバリー試行回数の取得に失敗しました', name: _logName, error: e);
      return 0;
    }
  }

  /// リカバリー試行回数をリセット
  static Future<void> _resetRecoveryAttempts() async {
    try {
      await SecureStorageService.deleteSecureData(_keyRecoveryAttempts);
      await SecureStorageService.deleteSecureData(_keyLastRecoveryAttempt);
      await SecureStorageService.deleteSecureData(_keyRecoveryToken);
      AppLogger.info('リカバリー試行回数をリセットしました', name: _logName);
    } catch (e) {
      AppLogger.error('リカバリー試行回数のリセットに失敗しました', name: _logName, error: e);
    }
  }

  /// リカバリー試行回数を記録
  static Future<void> _recordRecoveryAttempt(bool isSuccess) async {
    try {
      final attemptsJson = await SecureStorageService.getSecureData(
        _keyRecoveryAttempts,
      );
      int attempts = 0;

      if (attemptsJson != null) {
        final attemptsData = jsonDecode(attemptsJson) as Map<String, dynamic>;
        attempts = attemptsData['count'] as int? ?? 0;
      }

      if (!isSuccess) {
        attempts++;
      } else {
        attempts = 0; // 成功時はリセット
      }

      final attemptsData = {
        'count': attempts,
        'lastAttempt': DateTime.now().toIso8601String(),
      };

      await SecureStorageService.saveSecureData(
        _keyRecoveryAttempts,
        jsonEncode(attemptsData),
      );
      await SecureStorageService.saveSecureData(
        _keyLastRecoveryAttempt,
        DateTime.now().toIso8601String(),
      );
    } catch (e) {
      AppLogger.error('リカバリー試行回数の記録に失敗しました', name: _logName, error: e);
    }
  }

  /// リカバリーがロックされているかチェック
  static Future<bool> _isRecoveryLocked() async {
    try {
      final attempts = await getRecoveryAttempts();
      if (attempts < _maxRecoveryAttempts) return false;

      final lastAttemptJson = await SecureStorageService.getSecureData(
        _keyLastRecoveryAttempt,
      );
      if (lastAttemptJson == null) return false;

      final lastAttempt = DateTime.parse(lastAttemptJson);
      final now = DateTime.now();
      final difference = now.difference(lastAttempt).inMinutes;

      return difference < _lockoutDurationMinutes;
    } catch (e) {
      AppLogger.error('リカバリーロック状態の確認に失敗しました', name: _logName, error: e);
      return false;
    }
  }

  /// リカバリートークンを生成
  static Future<String> _generateRecoveryToken() async {
    try {
      final token = _generateSecureToken();
      await SecureStorageService.saveSecureData(_keyRecoveryToken, token);
      AppLogger.info('リカバリートークンを生成しました', name: _logName);
      return token;
    } catch (e) {
      AppLogger.error('リカバリートークンの生成に失敗しました', name: _logName, error: e);
      rethrow;
    }
  }

  /// 有効なリカバリートークンが存在するかチェック
  static Future<bool> _hasValidRecoveryToken() async {
    try {
      final token = await SecureStorageService.getSecureData(_keyRecoveryToken);
      return token != null;
    } catch (e) {
      AppLogger.error('リカバリートークンの存在確認に失敗しました', name: _logName, error: e);
      return false;
    }
  }

  /// セキュアなトークンを生成
  static String _generateSecureToken() {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    final random = Random.secure();
    return String.fromCharCodes(
      Iterable.generate(
        32,
        (_) => chars.codeUnitAt(random.nextInt(chars.length)),
      ),
    );
  }

  /// 回答をハッシュ化
  static String _hashAnswer(String answer) {
    final bytes = utf8.encode(answer.toLowerCase().trim());
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  /// 回答を検証
  static bool _verifyAnswer(String answer, String hashedAnswer) {
    final hashedInput = _hashAnswer(answer);
    return hashedInput == hashedAnswer;
  }
}
