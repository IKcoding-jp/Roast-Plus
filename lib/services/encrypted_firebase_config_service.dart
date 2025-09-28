import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';

import 'package:firebase_core/firebase_core.dart';
import '../firebase_options.dart';

/// Firebase設定を管理するサービス
/// 標準のfirebase_options.dartを使用してFirebaseを初期化する
class EncryptedFirebaseConfigService {
  static const String _logName = 'EncryptedFirebaseConfigService';
  static bool _isInitialized = false;

  /// Firebase設定を取得（標準のfirebase_options.dartを使用）
  static Future<FirebaseOptions> getFirebaseOptions() async {
    try {
      // 標準のfirebase_options.dartから設定を取得
      final options = DefaultFirebaseOptions.currentPlatform;
      developer.log('✅ Firebase設定を取得しました', name: _logName);
      return options;
    } catch (e) {
      developer.log('Firebase設定の取得に失敗: $e', name: _logName);
      return _getDefaultFirebaseOptions();
    }
  }

  /// デフォルトのFirebase設定（フォールバック用）
  /// 標準のfirebase_options.dartが使用できない場合のフォールバック
  static FirebaseOptions _getDefaultFirebaseOptions() {
    developer.log(
      '⚠️ 標準のFirebase設定を取得できませんでした。フォールバック設定を使用します。',
      name: _logName,
    );

    // フォールバック用のFirebase設定を返す
    return FirebaseOptions(
      apiKey: 'AIzaSyCvEoRO0iUbKLtaBhqUxJG7vic6CNjU-R4',
      appId: kIsWeb
          ? '1:330871937318:web:1f5c8d4e9b8a2c3d4e5f6a7'
          : '1:330871937318:android:f9f18c41f7aa541ad0c9e7',
      messagingSenderId: '330871937318',
      projectId: 'roastplus-app',
      authDomain: 'roastplus-app.firebaseapp.com',
      storageBucket: 'roastplus-app.firebasestorage.app',
      measurementId: 'G-XXXXXXXXXX',
    );
  }

  /// Firebaseを標準設定で初期化
  static Future<void> initializeFirebase() async {
    if (_isInitialized) {
      developer.log('Firebaseは既に初期化されています', name: _logName);
      return;
    }

    try {
      developer.log('標準のFirebase設定で初期化を開始', name: _logName);

      // Web版では既にindex.htmlで初期化されている可能性があるため、チェック
      if (kIsWeb) {
        try {
          // 既存のFirebaseアプリをチェック
          final apps = Firebase.apps;
          if (apps.isNotEmpty) {
            developer.log('Web版: 既存のFirebaseアプリを検出しました', name: _logName);
            _isInitialized = true;
            return;
          }
        } catch (e) {
          developer.log('Web版: Firebaseアプリチェック中にエラー: $e', name: _logName);
        }
      }

      // 標準の設定を取得
      final options = await getFirebaseOptions();

      // Firebaseを初期化
      await Firebase.initializeApp(options: options);

      _isInitialized = true;
      developer.log('Firebaseの初期化が完了しました', name: _logName);
    } catch (e) {
      // 重複初期化エラーの場合は成功として扱う
      if (e.toString().contains('duplicate-app') ||
          e.toString().contains('already exists')) {
        developer.log('Firebaseは既に初期化されています（重複エラーを無視）', name: _logName);
        _isInitialized = true;
        return;
      }
      developer.log('Firebaseの初期化に失敗: $e', name: _logName);
      rethrow;
    }
  }

  /// 初期化状態を確認
  static bool get isInitialized => _isInitialized;

  /// 設定の検証
  static Future<bool> validateConfiguration() async {
    try {
      // 標準のfirebase_options.dartから設定を取得して検証
      DefaultFirebaseOptions.currentPlatform;
      developer.log('✅ Firebase設定の検証が完了しました', name: _logName);
      return true;
    } catch (e) {
      developer.log('❌ 設定の検証に失敗: $e', name: _logName);
      return false;
    }
  }
}
