import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter/foundation.dart';
import 'web_qr_scanner_service.dart';

class QRCodeService {
  // グループ参加用のQRコードデータを生成
  static String generateGroupJoinData({
    required String groupId,
    required String groupName,
    required String inviteCode,
  }) {
    final data = {
      'type': 'group_join',
      'groupId': groupId,
      'groupName': groupName,
      'inviteCode': inviteCode,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
    return jsonEncode(data);
  }

  // QRコードデータを解析
  static Map<String, dynamic>? parseQRData(String data) {
    try {
      final decoded = jsonDecode(data);
      if (decoded['type'] == 'group_join') {
        return decoded;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // QRコードウィジェットを生成
  static Widget generateQRCode({
    required String data,
    required double size,
    Color? backgroundColor,
    Color? foregroundColor,
  }) {
    final fg = foregroundColor ?? Colors.black;
    return QrImageView(
      data: data,
      version: QrVersions.auto,
      size: size,
      backgroundColor: backgroundColor ?? Colors.white,
      eyeStyle: QrEyeStyle(eyeShape: QrEyeShape.square, color: fg),
      dataModuleStyle: QrDataModuleStyle(
        dataModuleShape: QrDataModuleShape.square,
        color: fg,
      ),
      errorCorrectionLevel: QrErrorCorrectLevel.M,
    );
  }

  // QRコードが有効かチェック（24時間以内）
  static bool isQRCodeValid(Map<String, dynamic> qrData) {
    final timestamp = qrData['timestamp'] as int?;
    if (timestamp == null) return false;

    final qrTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
    final now = DateTime.now();
    final difference = now.difference(qrTime);

    // 24時間以内のQRコードのみ有効
    return difference.inHours < 24;
  }

  /// Web版でQRコードスキャンを開始
  static Future<Stream<String>> startWebScanning() async {
    if (!kIsWeb) {
      throw UnsupportedError('Web版でのみ利用可能です');
    }

    return await WebQRScannerService.startScanning();
  }

  /// Web版でQRコードスキャンを停止
  static Future<void> stopWebScanning() async {
    if (!kIsWeb) {
      return;
    }

    await WebQRScannerService.stopScanning();
  }

  /// Web版でカメラ権限をリクエスト
  static Future<bool> requestWebCameraPermission() async {
    if (!kIsWeb) {
      return false;
    }

    return await WebQRScannerService.requestCameraPermission();
  }

  /// Web版でカメラが利用可能かチェック
  static bool get isWebCameraAvailable {
    if (!kIsWeb) {
      return false;
    }

    return WebQRScannerService.isCameraAvailable;
  }

  /// Web版でカメラがサポートされているかチェック
  static bool get isWebCameraSupported {
    if (!kIsWeb) {
      return false;
    }

    return WebQRScannerService.isCameraSupported;
  }

  /// Web版でQRコードスキャンに適したデバイスかチェック
  static bool get isWebSuitableForQRScanning {
    if (!kIsWeb) {
      return false;
    }

    return WebQRScannerService.isSuitableForQRScanning;
  }

  /// デバイスがモバイルかどうかを判定
  static bool get isWebMobileDevice {
    if (!kIsWeb) {
      return false;
    }

    return WebQRScannerService.isMobileDevice;
  }

  /// デバイスがタブレットかどうかを判定
  static bool get isWebTabletDevice {
    if (!kIsWeb) {
      return false;
    }

    return WebQRScannerService.isTabletDevice;
  }

  /// Web版でスキャン中かどうか
  static bool get isWebScanning {
    if (!kIsWeb) {
      return false;
    }

    return WebQRScannerService.isScanning;
  }
}
