import 'dart:html' as html;
import 'dart:developer' as developer;
import 'dart:async';

class WebQRScannerService {
  static const String _logName = 'WebQRScannerService';
  static void _logInfo(String message) =>
      developer.log(message, name: _logName);
  static void _logError(String message, [Object? error]) =>
      developer.log(message, name: _logName, error: error);

  static html.VideoElement? _videoElement;
  static html.CanvasElement? _canvasElement;
  static html.CanvasRenderingContext2D? _context;
  static StreamController<String>? _qrCodeController;
  static Timer? _scanTimer;
  static bool _isScanning = false;

  /// QRコードスキャンを開始
  static Future<Stream<String>> startScanning() async {
    try {
      _logInfo('Web版QRコードスキャンを開始');

      // ストリームコントローラーを初期化
      _qrCodeController = StreamController<String>.broadcast();

      // カメラアクセスをリクエスト
      final stream = await html.window.navigator.mediaDevices!.getUserMedia({
        'video': {
          'facingMode': 'environment', // 背面カメラを優先
          'width': {'ideal': 1280},
          'height': {'ideal': 720},
        },
      });

      // ビデオ要素を作成
      _videoElement = html.VideoElement()
        ..srcObject = stream
        ..autoplay = true
        ..muted = true
        ..style.width = '100%'
        ..style.height = '100%';

      // キャンバス要素を作成
      _canvasElement = html.CanvasElement();
      _context =
          _canvasElement?.getContext('2d') as html.CanvasRenderingContext2D?;

      // ビデオをDOMに追加（実際の実装では適切なコンテナに追加）
      html.document.body?.append(_videoElement!);

      _isScanning = true;
      _startQRCodeDetection();

      return _qrCodeController!.stream;
    } catch (e) {
      _logError('QRコードスキャン開始エラー: $e');
      _qrCodeController?.addError(e);
      return Stream.error(e);
    }
  }

  /// QRコード検出を開始
  static void _startQRCodeDetection() {
    _scanTimer = Timer.periodic(Duration(milliseconds: 500), (timer) {
      if (!_isScanning || _videoElement == null || _canvasElement == null) {
        timer.cancel();
        return;
      }

      try {
        // ビデオフレームをキャンバスに描画
        if (_canvasElement != null &&
            _context != null &&
            _videoElement != null) {
          _canvasElement!.width = _videoElement!.videoWidth;
          _canvasElement!.height = _videoElement!.videoHeight;
          _context!.drawImage(_videoElement!, 0, 0);
        }

        // ここでQRコード検出ライブラリを使用
        // 実際の実装では、JavaScriptのQRコード検出ライブラリを呼び出す
        _detectQRCode();
      } catch (e) {
        _logError('QRコード検出エラー: $e');
      }
    });
  }

  /// QRコードを検出（簡易実装）
  static void _detectQRCode() {
    // 実際の実装では、JavaScriptのQRコード検出ライブラリを使用
    // 例: qr-scanner, jsQR, qrcode-reader等

    // 現在はダミーデータの送信を停止
    // 実際のプロダクションでは適切なQRコード検出ライブラリを統合
    // 例: jsQRライブラリを使用した実装
    /*
    if (_canvasElement != null && _context != null) {
      final imageData = _context!.getImageData(0, 0, _canvasElement!.width!, _canvasElement!.height!);
      final code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code != null) {
        _qrCodeController!.add(code.data);
      }
    }
    */
  }

  /// QRコードスキャンを停止
  static Future<void> stopScanning() async {
    try {
      _logInfo('Web版QRコードスキャンを停止');

      _isScanning = false;

      // タイマーを停止
      _scanTimer?.cancel();
      _scanTimer = null;

      // ビデオストリームを停止
      if (_videoElement != null) {
        final stream = _videoElement!.srcObject;
        if (stream != null) {
          stream.getTracks().forEach((track) => track.stop());
        }
        _videoElement!.remove();
        _videoElement = null;
      }

      // ストリームコントローラーを閉じる
      await _qrCodeController?.close();
      _qrCodeController = null;

      _logInfo('QRコードスキャンが停止されました');
    } catch (e) {
      _logError('QRコードスキャン停止エラー: $e');
    }
  }

  /// カメラ権限をリクエスト
  static Future<bool> requestCameraPermission() async {
    try {
      _logInfo('カメラ権限をリクエスト');

      final stream = await html.window.navigator.mediaDevices!.getUserMedia({
        'video': true,
      });

      // 権限が取得できたらストリームを停止
      stream.getTracks().forEach((track) => track.stop());

      _logInfo('カメラ権限が取得されました');
      return true;
    } catch (e) {
      _logError('カメラ権限リクエストエラー: $e');
      return false;
    }
  }

  /// カメラが利用可能かチェック
  static bool get isCameraAvailable {
    try {
      return html.window.navigator.mediaDevices != null;
    } catch (e) {
      _logError('カメラ利用可能性チェックエラー: $e');
      return false;
    }
  }

  /// デバイスがカメラをサポートしているかチェック
  static bool get isCameraSupported {
    try {
      // 基本的なメディアデバイスAPIのサポートをチェック
      if (html.window.navigator.mediaDevices == null) {
        return false;
      }

      // getUserMediaのサポートをチェック
      return true;
    } catch (e) {
      _logError('カメラサポートチェックエラー: $e');
      return false;
    }
  }

  /// 利用可能なカメラデバイスを取得
  static Future<List<Map<String, dynamic>>> getAvailableCameras() async {
    try {
      final devices = await html.window.navigator.mediaDevices!
          .enumerateDevices();
      final cameras = devices
          .where((device) => device.kind == 'videoinput')
          .map(
            (device) => {
              'deviceId': device.deviceId,
              'label': device.label,
              'groupId': device.groupId,
            },
          )
          .toList();

      _logInfo('利用可能なカメラ数: ${cameras.length}');
      return cameras;
    } catch (e) {
      _logError('カメラデバイス取得エラー: $e');
      return [];
    }
  }

  /// デバイスがモバイルかどうかを判定
  static bool get isMobileDevice {
    try {
      final userAgent = html.window.navigator.userAgent.toLowerCase();
      final isMobile =
          userAgent.contains('mobile') ||
          userAgent.contains('android') ||
          userAgent.contains('iphone') ||
          userAgent.contains('ipad');

      _logInfo('UserAgent: $userAgent');
      _logInfo('isMobileDevice: $isMobile');

      return isMobile;
    } catch (e) {
      _logError('モバイルデバイス判定エラー: $e');
      return false;
    }
  }

  /// デバイスがタブレットかどうかを判定
  static bool get isTabletDevice {
    try {
      final userAgent = html.window.navigator.userAgent.toLowerCase();
      final isTablet =
          userAgent.contains('ipad') ||
          userAgent.contains('tablet') ||
          (userAgent.contains('android') && !userAgent.contains('mobile')) ||
          userAgent.contains('kindle') ||
          userAgent.contains('silk') ||
          userAgent.contains('playbook') ||
          userAgent.contains('bb10') ||
          // iPadの追加判定条件
          userAgent.contains('macintosh') &&
              userAgent.contains('safari') &&
              !userAgent.contains('mobile');

      _logInfo('isTabletDevice: $isTablet');

      return isTablet;
    } catch (e) {
      _logError('タブレットデバイス判定エラー: $e');
      return false;
    }
  }

  /// QRコードスキャンに適したデバイスかどうかを判定
  static bool get isSuitableForQRScanning {
    // モバイルデバイスまたはタブレットで、カメラがサポートされている場合
    // PC（デスクトップ）以外のデバイスでカメラがサポートされている場合
    final isSuitable = (isMobileDevice || isTabletDevice) && isCameraSupported;

    _logInfo(
      'isSuitableForQRScanning: $isSuitable (isMobileDevice: $isMobileDevice, isTabletDevice: $isTabletDevice, isCameraSupported: $isCameraSupported)',
    );

    return isSuitable;
  }

  /// スキャン中かどうか
  static bool get isScanning => _isScanning;
}
