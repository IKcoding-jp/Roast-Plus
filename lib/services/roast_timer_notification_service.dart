
import 'dart:developer' as developer;
import 'web_notification_service.dart';

class RoastTimerNotificationService {
  static const String _logName = 'RoastTimerNotificationService';
  static void _logInfo(String message) =>
      developer.log(message, name: _logName);

  static Future<void> initialize() async {
    _logInfo('焙煎タイマー通知サービス初期化');
    await WebNotificationService.initialize();
  }

  static Future<void> scheduleRoastTimerNotification({
    required int id,
    required Duration duration,
    required String title,
    required String body,
  }) async {
    _logInfo('焙煎タイマー通知をスケジュール: $title (${duration.inSeconds}秒)');
    
    // 指定時間後に通知を表示
    Future.delayed(duration, () async {
      await WebNotificationService.showRoastTimerNotification(
        title: title,
        body: body,
      );
    });
  }

  static Future<void> cancelRoastTimerNotification(int id) async {
    _logInfo('焙煎タイマー通知をキャンセル: $id');
    // Web版では個別キャンセルは制限があるため、ログのみ
  }

  static Future<void> cancelAllRoastTimerNotifications() async {
    _logInfo('すべての焙煎タイマー通知をキャンセル');
    // Web版では個別キャンセルは制限があるため、ログのみ
  }

  static Future<bool> requestPermissions() async {
    _logInfo('焙煎タイマー通知権限をリクエスト');
    return await WebNotificationService.requestPermission();
  }

  static Future<bool> areNotificationsEnabled() async {
    return WebNotificationService.isPermissionGranted;
  }
}
