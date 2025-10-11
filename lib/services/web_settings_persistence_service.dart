import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:html' as html;
import 'package:flutter/foundation.dart';

/// Web版専用の設定永続化サービス
/// サイトを閉じても設定が保持されるように、ブラウザのlocalStorageを使用して設定を保存
class WebSettingsPersistenceService {
  static const String _logName = 'WebSettingsPersistenceService';

  /// 初期化
  static Future<void> initialize() async {
    if (!kIsWeb) return;

    try {
      // Web版ではブラウザのlocalStorageを直接使用
      developer.log('Web版設定永続化サービスを初期化しました（localStorage使用）', name: _logName);
    } catch (e) {
      developer.log('Web版設定永続化サービスの初期化に失敗しました: $e', name: _logName);
      rethrow;
    }
  }

  /// 設定を保存
  static Future<bool> saveSetting(String key, dynamic value) async {
    if (!kIsWeb) return false;

    try {
      String valueString;
      if (value is String) {
        valueString = value;
      } else if (value is Map || value is List) {
        valueString = json.encode(value);
      } else {
        valueString = value.toString();
      }

      // ブラウザのlocalStorageに直接保存
      html.window.localStorage['web_setting_$key'] = valueString;
      developer.log(
        'Web版設定をlocalStorageに保存しました: $key = $value',
        name: _logName,
      );
      return true;
    } catch (e) {
      developer.log('Web版設定保存エラー: $key, $e', name: _logName);
      return false;
    }
  }

  /// 設定を取得
  static Future<dynamic> getSetting(String key, {dynamic defaultValue}) async {
    if (!kIsWeb) return defaultValue;

    try {
      // ブラウザのlocalStorageから直接取得
      final valueString = html.window.localStorage['web_setting_$key'];
      if (valueString == null) return defaultValue;

      // JSONとして解析を試行
      try {
        return json.decode(valueString);
      } catch (e) {
        // JSONでない場合は文字列として返す
        return valueString;
      }
    } catch (e) {
      developer.log('Web版設定取得エラー: $key, $e', name: _logName);
      return defaultValue;
    }
  }

  /// 複数の設定を一括保存
  static Future<bool> saveMultipleSettings(
    Map<String, dynamic> settings,
  ) async {
    if (!kIsWeb) return false;

    try {
      bool allSuccess = true;
      for (final entry in settings.entries) {
        final success = await saveSetting(entry.key, entry.value);
        if (!success) allSuccess = false;
      }

      developer.log(
        'Web版複数設定をlocalStorageに保存しました: ${settings.keys.join(', ')}',
        name: _logName,
      );
      return allSuccess;
    } catch (e) {
      developer.log('Web版複数設定保存エラー: $e', name: _logName);
      return false;
    }
  }

  /// 複数の設定を一括取得
  static Future<Map<String, dynamic>> getMultipleSettings(
    List<String> keys,
  ) async {
    if (!kIsWeb) return {};

    try {
      final Map<String, dynamic> result = {};

      for (final key in keys) {
        result[key] = await getSetting(key);
      }

      return result;
    } catch (e) {
      developer.log('Web版複数設定取得エラー: $e', name: _logName);
      return {};
    }
  }

  /// 設定を削除
  static Future<bool> deleteSetting(String key) async {
    if (!kIsWeb) return false;

    try {
      // ブラウザのlocalStorageから直接削除
      html.window.localStorage.remove('web_setting_$key');
      developer.log('Web版設定をlocalStorageから削除しました: $key', name: _logName);
      return true;
    } catch (e) {
      developer.log('Web版設定削除エラー: $key, $e', name: _logName);
      return false;
    }
  }

  /// すべての設定を取得
  static Future<Map<String, dynamic>> getAllSettings() async {
    if (!kIsWeb) return {};

    try {
      final Map<String, dynamic> result = {};

      // ブラウザのlocalStorageからすべてのキーを取得
      final keys = html.window.localStorage.keys;
      for (final key in keys) {
        if (key.startsWith('web_setting_')) {
          final settingKey = key.substring('web_setting_'.length);
          result[settingKey] = await getSetting(settingKey);
        }
      }

      return result;
    } catch (e) {
      developer.log('Web版全設定取得エラー: $e', name: _logName);
      return {};
    }
  }

  /// すべての設定をクリア
  static Future<bool> clearAllSettings() async {
    if (!kIsWeb) return false;

    try {
      // ブラウザのlocalStorageからweb_setting_で始まるキーをすべて削除
      final keysToRemove = <String>[];
      final keys = html.window.localStorage.keys;
      for (final key in keys) {
        if (key.startsWith('web_setting_')) {
          keysToRemove.add(key);
        }
      }

      for (final key in keysToRemove) {
        html.window.localStorage.remove(key);
      }

      developer.log('Web版全設定をlocalStorageからクリアしました', name: _logName);
      return true;
    } catch (e) {
      developer.log('Web版全設定クリアエラー: $e', name: _logName);
      return false;
    }
  }

  /// テーマ設定を保存
  static Future<bool> saveThemeSettings(
    Map<String, dynamic> themeSettings,
  ) async {
    return await saveSetting('theme_settings', themeSettings);
  }

  /// テーマ設定を取得
  static Future<Map<String, dynamic>> getThemeSettings() async {
    final result = await getSetting('theme_settings', defaultValue: {});
    if (result is Map<String, dynamic>) {
      return result;
    }
    return {};
  }

  /// フォント設定を保存
  static Future<bool> saveFontSettings({
    required double fontSizeScale,
    required String fontFamily,
  }) async {
    return await saveMultipleSettings({
      'fontSizeScale': fontSizeScale,
      'fontFamily': fontFamily,
    });
  }

  /// フォント設定を取得
  static Future<Map<String, dynamic>> getFontSettings() async {
    return await getMultipleSettings(['fontSizeScale', 'fontFamily']);
  }
}
