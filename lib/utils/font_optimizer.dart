import 'dart:async';
import 'package:flutter/foundation.dart';

/// フォント読み込み最適化クラス
class FontOptimizer {
  static final Map<String, String> _fontCache = {};
  static bool _isInitialized = false;
  static bool _isInitializing = false;
  static Completer<void>? _initializationCompleter;
  static bool _googleFontsAvailable = true;

  /// フォントファミリーを動的に設定する関数（キャッシュ付き）
  static String getFontFamilyWithFallback(String fontFamily) {
    if (!_isInitialized && !_isInitializing) {
      _initializeFontCache();
    }

    return _fontCache[fontFamily] ??
        _fontCache['Noto Sans JP'] ??
        'Noto Sans JP';
  }

  /// 非同期でフォントファミリーを取得
  static Future<String> getFontFamilyWithFallbackAsync(
    String fontFamily,
  ) async {
    if (!_isInitialized) {
      await _initializeFontCacheAsync();
    }

    return _fontCache[fontFamily] ??
        _fontCache['Noto Sans JP'] ??
        'Noto Sans JP';
  }

  /// GoogleFontsが利用可能かチェック
  static bool get isGoogleFontsAvailable => _googleFontsAvailable;

  /// フォントキャッシュを初期化（同期版）
  static void _initializeFontCache() {
    if (_isInitialized || _isInitializing) return;

    _isInitializing = true;
    try {
      // Web環境でのGoogleFonts読み込み問題を回避
      if (kIsWeb) {
        // Web環境ではシステムフォントを使用
        _fontCache['Noto Sans JP'] = 'Noto Sans JP, sans-serif';
        _fontCache['ZenMaruGothic'] = 'ZenMaruGothic, sans-serif';
        _fontCache['utsukushiFONT'] = 'utsukushiFONT, serif';
        _fontCache['KiwiMaru'] = 'KiwiMaru, serif';
        _fontCache['HannariMincho'] = 'HannariMincho, serif';
        _fontCache['Harenosora'] = 'Harenosora, sans-serif';
        _googleFontsAvailable = false;
      } else {
        // モバイル環境では通常のフォント名を使用
        _fontCache['Noto Sans JP'] = 'Noto Sans JP';
        _fontCache['ZenMaruGothic'] = 'ZenMaruGothic';
        _fontCache['utsukushiFONT'] = 'utsukushiFONT';
        _fontCache['KiwiMaru'] = 'KiwiMaru';
        _fontCache['HannariMincho'] = 'HannariMincho';
        _fontCache['Harenosora'] = 'Harenosora';
      }
      _isInitialized = true;
    } catch (e) {
      // エラーが発生した場合はデフォルトフォントを設定
      _fontCache['Noto Sans JP'] = kIsWeb
          ? 'Noto Sans JP, sans-serif'
          : 'Noto Sans JP';
      _googleFontsAvailable = false;
      _isInitialized = true;
    } finally {
      _isInitializing = false;
    }
  }

  /// フォントキャッシュを非同期で初期化
  static Future<void> _initializeFontCacheAsync() async {
    if (_isInitialized) return;
    if (_isInitializing && _initializationCompleter != null) {
      return _initializationCompleter!.future;
    }

    _isInitializing = true;
    _initializationCompleter = Completer<void>();

    try {
      // UIスレッドを解放
      await Future.delayed(Duration.zero);

      // Web環境でのGoogleFonts読み込み問題を回避
      if (kIsWeb) {
        // Web環境ではシステムフォントを使用
        _fontCache['Noto Sans JP'] = 'Noto Sans JP, sans-serif';
        _fontCache['ZenMaruGothic'] = 'ZenMaruGothic, sans-serif';
        _fontCache['utsukushiFONT'] = 'utsukushiFONT, serif';
        _fontCache['KiwiMaru'] = 'KiwiMaru, serif';
        _fontCache['HannariMincho'] = 'HannariMincho, serif';
        _fontCache['Harenosora'] = 'Harenosora, sans-serif';
        _googleFontsAvailable = false;
      } else {
        // モバイル環境では通常のフォント名を使用
        _fontCache['Noto Sans JP'] = 'Noto Sans JP';
        _fontCache['ZenMaruGothic'] = 'ZenMaruGothic';
        _fontCache['utsukushiFONT'] = 'utsukushiFONT';
        _fontCache['KiwiMaru'] = 'KiwiMaru';
        _fontCache['HannariMincho'] = 'HannariMincho';
        _fontCache['Harenosora'] = 'Harenosora';
      }

      _isInitialized = true;
      _initializationCompleter!.complete();
    } catch (e) {
      // エラーが発生した場合はデフォルトフォントを設定
      _fontCache['Noto Sans JP'] = kIsWeb
          ? 'Noto Sans JP, sans-serif'
          : 'Noto Sans JP';
      _googleFontsAvailable = false;
      _isInitialized = true;
      _initializationCompleter!.complete();
    } finally {
      _isInitializing = false;
    }
  }

  /// フォントキャッシュをクリア
  static void clearCache() {
    _fontCache.clear();
    _isInitialized = false;
    _isInitializing = false;
    _initializationCompleter = null;
    _googleFontsAvailable = true;
  }

  /// デバッグ情報を取得
  static Map<String, dynamic> getDebugInfo() {
    return {
      'isInitialized': _isInitialized,
      'isInitializing': _isInitializing,
      'googleFontsAvailable': _googleFontsAvailable,
      'fontCache': Map.from(_fontCache),
      'isWeb': kIsWeb,
    };
  }
}
