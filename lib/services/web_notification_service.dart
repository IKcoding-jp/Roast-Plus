import 'dart:html' as html;
import 'dart:developer' as developer;

class WebNotificationService {
  static const String _logName = 'WebNotificationService';
  static void _logInfo(String message) =>
      developer.log(message, name: _logName);
  static void _logError(String message, [Object? error]) =>
      developer.log(message, name: _logName, error: error);

  static bool _isSupported = false;
  static bool _isPermissionGranted = false;

  /// Web Notifications APIのサポート確認と初期化
  static Future<void> initialize() async {
    try {
      _isSupported = html.Notification.supported;
      _logInfo('Web Notifications APIサポート: $_isSupported');

      if (_isSupported) {
        _isPermissionGranted = html.Notification.permission == 'granted';
        _logInfo('通知権限状態: ${html.Notification.permission}');
      }
    } catch (e) {
      _logError('Web Notifications API初期化エラー: $e');
    }
  }

  /// 通知権限をリクエスト
  static Future<bool> requestPermission() async {
    if (!_isSupported) {
      _logError('Web Notifications APIがサポートされていません');
      return false;
    }

    try {
      final permission = await html.Notification.requestPermission();
      _isPermissionGranted = permission == 'granted';
      _logInfo('通知権限リクエスト結果: $permission');
      return _isPermissionGranted;
    } catch (e) {
      _logError('通知権限リクエストエラー: $e');
      return false;
    }
  }

  /// 通知を表示
  static Future<void> showNotification({
    required String title,
    required String body,
    String? icon,
    String? tag,
  }) async {
    if (!_isSupported || !_isPermissionGranted) {
      _logError('通知がサポートされていないか、権限がありません');
      return;
    }

    try {
      final notification = html.Notification(
        title,
        body: body,
        icon: icon,
        tag: tag,
      );

      // 通知クリック時の処理
      notification.onClick.listen((event) {
        _logInfo('通知がクリックされました: $title');
        // 必要に応じてアプリのフォーカス処理を追加
        // html.window.focus(); // Web版では利用できない
      });

      // 通知を自動で閉じる（5秒後）
      Future.delayed(Duration(seconds: 5), () {
        notification.close();
      });

      _logInfo('通知を表示しました: $title');
    } catch (e) {
      _logError('通知表示エラー: $e');
    }
  }

  /// 焙煎タイマー通知を表示
  static Future<void> showRoastTimerNotification({
    required String title,
    required String body,
  }) async {
    await showNotification(title: title, body: body, tag: 'roast_timer');
  }

  /// TODO通知を表示
  static Future<void> showTodoNotification({
    required String title,
    required String body,
  }) async {
    await showNotification(title: title, body: body, tag: 'todo');
  }

  /// 権限状態を取得
  static bool get isPermissionGranted => _isPermissionGranted;
  static bool get isSupported => _isSupported;
}
