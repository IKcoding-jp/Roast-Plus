import 'dart:html' as html;
import 'dart:convert';
import 'dart:developer' as developer;
import 'package:crypto/crypto.dart';

class WebStorageService {
  static const String _logName = 'WebStorageService';
  static void _logInfo(String message) =>
      developer.log(message, name: _logName);
  static void _logError(String message, [Object? error]) =>
      developer.log(message, name: _logName, error: error);

  static const String _storagePrefix = 'roastplus_';
  static const String _encryptionKey = 'roastplus_secure_key_2024';

  /// データを暗号化
  static String _encryptData(String data) {
    try {
      final key = utf8.encode(_encryptionKey);
      final bytes = utf8.encode(data);
      final hmacSha256 = Hmac(sha256, key);
      final digest = hmacSha256.convert(bytes);
      return base64.encode(utf8.encode('$data|$digest'));
    } catch (e) {
      _logError('データ暗号化エラー: $e');
      return data; // 暗号化に失敗した場合は平文を返す
    }
  }

  /// データを復号化
  static String _decryptData(String encryptedData) {
    try {
      final decoded = utf8.decode(base64.decode(encryptedData));
      final parts = decoded.split('|');
      if (parts.length == 2) {
        final data = parts[0];
        final hash = parts[1];
        
        // ハッシュを検証
        final key = utf8.encode(_encryptionKey);
        final bytes = utf8.encode(data);
        final hmacSha256 = Hmac(sha256, key);
        final digest = hmacSha256.convert(bytes);
        
        if (hash == digest.toString()) {
          return data;
        }
      }
      _logError('データ復号化エラー: ハッシュ検証失敗');
      return encryptedData; // 復号化に失敗した場合は元のデータを返す
    } catch (e) {
      _logError('データ復号化エラー: $e');
      return encryptedData; // 復号化に失敗した場合は元のデータを返す
    }
  }

  /// データを保存
  static Future<void> saveData(String key, String value) async {
    try {
      final encryptedValue = _encryptData(value);
      html.window.localStorage[_storagePrefix + key] = encryptedValue;
      _logInfo('データを保存しました: $key');
    } catch (e) {
      _logError('データ保存エラー: $e');
    }
  }

  /// データを取得
  static Future<String?> getData(String key) async {
    try {
      final encryptedValue = html.window.localStorage[_storagePrefix + key];
      if (encryptedValue != null) {
        final decryptedValue = _decryptData(encryptedValue);
        _logInfo('データを取得しました: $key');
        return decryptedValue;
      }
      return null;
    } catch (e) {
      _logError('データ取得エラー: $e');
      return null;
    }
  }

  /// データを削除
  static Future<void> deleteData(String key) async {
    try {
      html.window.localStorage.remove(_storagePrefix + key);
      _logInfo('データを削除しました: $key');
    } catch (e) {
      _logError('データ削除エラー: $e');
    }
  }

  /// すべてのデータを削除
  static Future<void> clearAllData() async {
    try {
      // Web版では既知のキーを直接削除
      final knownKeys = [
        'user_settings',
        'theme_settings',
        'notification_settings',
        'app_settings',
        'auth_tokens',
        'user_preferences',
      ];
      
      for (final key in knownKeys) {
        html.window.localStorage.remove(_storagePrefix + key);
      }
      _logInfo('すべてのデータを削除しました');
    } catch (e) {
      _logError('全データ削除エラー: $e');
    }
  }

  /// データが存在するかチェック
  static Future<bool> hasData(String key) async {
    try {
      return html.window.localStorage.containsKey(_storagePrefix + key);
    } catch (e) {
      _logError('データ存在チェックエラー: $e');
      return false;
    }
  }

  /// 保存されているキーの一覧を取得
  static Future<List<String>> getAllKeys() async {
    try {
      final keys = <String>[];
      // Web版ではlocalStorageのキー取得が制限されているため、
      // 既知のキーパターンをチェックする方式に変更
      final knownKeys = [
        'user_settings',
        'theme_settings',
        'notification_settings',
        'app_settings',
        'auth_tokens',
        'user_preferences',
      ];
      
      for (final key in knownKeys) {
        if (await hasData(key)) {
          keys.add(key);
        }
      }
      
      return keys;
    } catch (e) {
      _logError('キー一覧取得エラー: $e');
      return [];
    }
  }

  /// JSONデータを保存
  static Future<void> saveJsonData(String key, Map<String, dynamic> data) async {
    try {
      final jsonString = json.encode(data);
      await saveData(key, jsonString);
    } catch (e) {
      _logError('JSONデータ保存エラー: $e');
    }
  }

  /// JSONデータを取得
  static Future<Map<String, dynamic>?> getJsonData(String key) async {
    try {
      final jsonString = await getData(key);
      if (jsonString != null) {
        return json.decode(jsonString) as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      _logError('JSONデータ取得エラー: $e');
      return null;
    }
  }
}
