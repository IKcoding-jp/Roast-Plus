import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart';
import 'dart:developer' as developer;
import 'dart:async';
import '../../models/group_provider.dart';
import '../../models/theme_settings.dart';
import '../../services/qr_code_service.dart';
import '../../services/group_invitation_service.dart';
import '../../utils/web_ui_utils.dart';
import '../../widgets/web_responsive_widget.dart';

class GroupQRScannerPage extends StatefulWidget {
  const GroupQRScannerPage({super.key});

  @override
  State<GroupQRScannerPage> createState() => _GroupQRScannerPageState();
}

class _GroupQRScannerPageState extends State<GroupQRScannerPage> {
  StreamSubscription<String>? _qrCodeSubscription;
  bool _isScanning = true;
  bool _isJoining = false;

  @override
  void initState() {
    super.initState();
    _initializeScanner();
  }

  @override
  void dispose() {
    _qrCodeSubscription?.cancel();
    super.dispose();
  }

  Future<void> _initializeScanner() async {
    if (kIsWeb) {
      try {
        // カメラが利用可能かチェック
        if (!QRCodeService.isWebSuitableForQRScanning) {
          developer.log('カメラが利用できません。手動入力モードに切り替えます。');
          return;
        }

        // Web版でQRコードスキャンを開始
        final qrCodeStream = await QRCodeService.startWebScanning();
        _qrCodeSubscription = qrCodeStream.listen((qrData) {
          if (_isScanning) {
            _processQRCode(qrData);
          }
        });
      } catch (e) {
        developer.log('Web版QRスキャナー初期化エラー: $e');
        // エラーが発生した場合は手動入力モードに切り替え
        setState(() {
          _isScanning = false;
        });
      }
    }
  }

  Future<void> _processQRCode(String qrData) async {
    setState(() {
      _isScanning = false;
    });

    final parsedData = QRCodeService.parseQRData(qrData);
    if (parsedData == null) {
      _showError('無効なQRコードです');
      return;
    }

    if (!QRCodeService.isQRCodeValid(parsedData)) {
      _showError('QRコードの有効期限が切れています');
      return;
    }

    final groupId = parsedData['groupId'] as String?;
    final groupName = parsedData['groupName'] as String?;
    final inviteCode = parsedData['inviteCode'] as String?;

    if (groupId == null || groupName == null || inviteCode == null) {
      _showError('QRコードの情報が不完全です');
      return;
    }

    // グループ参加の確認ダイアログを表示
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('グループ参加'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('以下のグループに参加しますか？'),
            SizedBox(height: 16),
            Text(
              groupName,
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text('招待コード: $inviteCode'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('キャンセル'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('参加する'),
          ),
        ],
      ),
    );

    if (confirmed != true) {
      setState(() {
        _isScanning = true;
      });
      return;
    }

    // グループに参加
    await _joinGroup(groupId, inviteCode);
  }

  Future<void> _joinGroup(String groupId, String inviteCode) async {
    setState(() {
      _isJoining = true;
    });

    try {
      // GroupInvitationServiceを使用してグループに参加
      final success = await GroupInvitationService.joinGroupWithInvitationCode(
        inviteCode,
      );

      if (success && mounted) {
        // グループ参加状態を即座に更新
        final groupProvider = context.read<GroupProvider>();
        await groupProvider.loadUserGroups();
        // 成功メッセージを表示
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('グループに参加しました'),
              backgroundColor: Colors.green,
            ),
          );
        }

        if (mounted) {
          // 状態更新を確実にするため、少し待機
          await Future.delayed(Duration(milliseconds: 800));

          // グループ参加状態を再確認してから遷移
          final hasGroup = groupProvider.hasGroup;
          developer.log(
            'グループ参加後状態確認 - hasGroup: $hasGroup',
            name: 'GroupQRScannerPage',
          );

          if (hasGroup) {
            // ホームページに自動遷移
            if (mounted) {
              Navigator.of(context).pushNamedAndRemoveUntil(
                '/',
                (route) => false, // すべてのページをクリア
              );
            }
          } else {
            // 状態が更新されていない場合はエラーメッセージを表示
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('グループ参加状態の更新に失敗しました。再試行してください'),
                  backgroundColor: Colors.orange,
                ),
              );
            }
            setState(() {
              _isScanning = true;
            });
          }
        }
      }
    } catch (e) {
      // グループ参加エラー
      if (mounted) {
        _showError('グループの参加に失敗しました: $e');
      }
    }

    if (mounted) {
      setState(() {
        _isJoining = false;
      });
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message), backgroundColor: Colors.red),
      );
      setState(() {
        _isScanning = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'QRコード読み取り',
          style: TextStyle(
            color: themeSettings.appBarTextColor,
            fontSize: 20 * themeSettings.fontSizeScale,
            fontWeight: FontWeight.bold,
            fontFamily: themeSettings.fontFamily,
          ),
        ),
        backgroundColor: themeSettings.appBarColor,
        iconTheme: IconThemeData(color: themeSettings.iconColor),
      ),
      body: WebResponsiveBuilder(
        builder: (context, isMobile, isTablet, isDesktop) {
          return _buildResponsiveContent(
            context,
            themeSettings,
            isMobile,
            isTablet,
            isDesktop,
          );
        },
      ),
    );
  }

  Widget _buildResponsiveContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    // デバイス判定とカメラ利用可能性の確認
    final canUseCamera = _canUseCameraForQRScanning();

    return Stack(
      children: [
        // メインコンテンツ
        _buildMainContent(
          context,
          themeSettings,
          isMobile,
          isTablet,
          isDesktop,
          canUseCamera,
        ),

        // ローディングオーバーレイ
        if (_isJoining)
          Container(
            color: Colors.black54,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      themeSettings.buttonColor,
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'グループに参加中...',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16 * themeSettings.fontSizeScale,
                      fontFamily: themeSettings.fontFamily,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildMainContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
    bool canUseCamera,
  ) {
    if (kIsWeb) {
      return _buildWebContent(
        context,
        themeSettings,
        isMobile,
        isTablet,
        isDesktop,
        canUseCamera,
      );
    } else {
      return Container(
        color: Colors.black,
        child: Center(
          child: Text(
            'ネイティブ版はサポートされていません',
            style: TextStyle(color: Colors.white),
          ),
        ),
      );
    }
  }

  Widget _buildWebContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
    bool canUseCamera,
  ) {
    return WebUIUtils.responsiveContainer(
      context: context,
      child: Column(
        children: [
          // ヘッダー部分
          _buildHeader(context, themeSettings, isMobile, isTablet, isDesktop),

          // メインコンテンツ
          Expanded(
            child: _buildMainContentArea(
              context,
              themeSettings,
              isMobile,
              isTablet,
              isDesktop,
              canUseCamera,
            ),
          ),

          // フッター部分
          _buildFooter(
            context,
            themeSettings,
            isMobile,
            isTablet,
            isDesktop,
            canUseCamera,
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    final iconSize = isMobile ? 48.0 : (isTablet ? 64.0 : 80.0);
    final titleSize = isMobile ? 18.0 : (isTablet ? 20.0 : 24.0);

    return Container(
      padding: EdgeInsets.all(isMobile ? 16.0 : 24.0),
      child: Column(
        children: [
          Icon(
            Icons.qr_code_scanner,
            size: iconSize,
            color: themeSettings.iconColor,
          ),
          SizedBox(height: 16),
          Text(
            'QRコード読み取り',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: titleSize * themeSettings.fontSizeScale,
              fontFamily: themeSettings.fontFamily,
              color: themeSettings.fontColor1,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainContentArea(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
    bool canUseCamera,
  ) {
    if (canUseCamera) {
      return _buildCameraContent(
        context,
        themeSettings,
        isMobile,
        isTablet,
        isDesktop,
      );
    } else {
      return _buildAlternativeContent(
        context,
        themeSettings,
        isMobile,
        isTablet,
        isDesktop,
      );
    }
  }

  Widget _buildCameraContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16.0 : 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // カメラプレビューエリア（実際の実装ではカメラビューを表示）
          Container(
            width: double.infinity,
            height: isMobile ? 200.0 : (isTablet ? 300.0 : 400.0),
            decoration: BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: themeSettings.buttonColor, width: 2),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.camera_alt,
                    size: isMobile ? 48.0 : 64.0,
                    color: Colors.white70,
                  ),
                  SizedBox(height: 8),
                  Text(
                    'QRコードをカメラで読み取ってください',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14 * themeSettings.fontSizeScale,
                      fontFamily: themeSettings.fontFamily,
                    ),
                  ),
                ],
              ),
            ),
          ),

          SizedBox(height: 24),

          // カメラ権限ボタン
          ElevatedButton.icon(
            onPressed: () async {
              try {
                final hasPermission =
                    await QRCodeService.requestWebCameraPermission();
                if (hasPermission) {
                  // 権限が取得できた場合はスキャンを開始
                  await _initializeScanner();
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('カメラが起動しました'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  }
                } else {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('カメラの権限が取得できませんでした'),
                        backgroundColor: Colors.orange,
                      ),
                    );
                  }
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('カメラの起動に失敗しました: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            icon: Icon(Icons.camera_alt),
            label: Text('カメラを起動'),
            style: ElevatedButton.styleFrom(
              backgroundColor: themeSettings.buttonColor,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 24.0 : 32.0,
                vertical: isMobile ? 12.0 : 16.0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlternativeContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16.0 : 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.qr_code,
            size: isMobile ? 64.0 : (isTablet ? 80.0 : 96.0),
            color: themeSettings.iconColor,
          ),

          SizedBox(height: 24),

          Text(
            'QRコード読み取りが利用できません',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: (isMobile ? 16.0 : 18.0) * themeSettings.fontSizeScale,
              fontFamily: themeSettings.fontFamily,
              color: themeSettings.fontColor1,
              fontWeight: FontWeight.bold,
            ),
          ),

          SizedBox(height: 16),

          Text(
            'デスクトップPCではカメラが利用できません。\n招待コードを手動で入力してください。',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14 * themeSettings.fontSizeScale,
              fontFamily: themeSettings.fontFamily,
              color: themeSettings.fontColor1.withValues(alpha: 0.7),
            ),
          ),

          SizedBox(height: 32),

          // 手動入力ボタン
          ElevatedButton.icon(
            onPressed: () {
              _showManualInputDialog(context, themeSettings);
            },
            icon: Icon(Icons.edit),
            label: Text('招待コードを手動入力'),
            style: ElevatedButton.styleFrom(
              backgroundColor: themeSettings.buttonColor,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 24.0 : 32.0,
                vertical: isMobile ? 12.0 : 16.0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
    bool canUseCamera,
  ) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16.0 : 24.0),
      decoration: BoxDecoration(
        color: Colors.black54,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          Text(
            canUseCamera
                ? 'QRコードをカメラで読み取って\nグループに参加しましょう'
                : 'デスクトップPCではカメラが利用できません\n招待コードを手動で入力してください',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 14 * themeSettings.fontSizeScale,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '※ グループ参加用のQRコードのみ読み取り可能です',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12 * themeSettings.fontSizeScale,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
        ],
      ),
    );
  }

  bool _canUseCameraForQRScanning() {
    if (!kIsWeb) return false;

    // 画面サイズとデバイス判定を組み合わせて判定
    final screenSize = MediaQuery.of(context).size;
    final isMobileSize = screenSize.width < 768;
    final isTabletSize = screenSize.width >= 768 && screenSize.width < 1400;
    final isDesktopSize = screenSize.width >= 1400;

    // UserAgentベースのデバイス判定も考慮
    final isMobileDevice = QRCodeService.isWebMobileDevice;
    final isTabletDevice = QRCodeService.isWebTabletDevice;
    final isSuitableForScanning = QRCodeService.isWebSuitableForQRScanning;

    // デバッグ情報をログに出力
    developer.log('QRコードカメラ判定デバッグ:', name: 'GroupQRScannerPage');
    developer.log(
      '画面サイズ: ${screenSize.width}x${screenSize.height}',
      name: 'GroupQRScannerPage',
    );
    developer.log(
      'isMobileSize: $isMobileSize, isTabletSize: $isTabletSize, isDesktopSize: $isDesktopSize',
      name: 'GroupQRScannerPage',
    );
    developer.log(
      'isMobileDevice: $isMobileDevice, isTabletDevice: $isTabletDevice',
      name: 'GroupQRScannerPage',
    );
    developer.log(
      'isSuitableForScanning: $isSuitableForScanning',
      name: 'GroupQRScannerPage',
    );

    // iPadやタブレットの場合は画面サイズに関係なくカメラ利用可能
    if (isMobileDevice || isTabletDevice) {
      developer.log('モバイル/タブレットデバイスとして判定: カメラ利用可能', name: 'GroupQRScannerPage');
      return isSuitableForScanning && !_isJoining;
    }

    // デスクトップサイズ（1400px以上）の場合はカメラ利用不可
    if (isDesktopSize) {
      developer.log('デスクトップサイズとして判定: カメラ利用不可', name: 'GroupQRScannerPage');
      return false;
    }

    // モバイルまたはタブレットサイズの場合
    if (isMobileSize || isTabletSize) {
      developer.log('モバイル/タブレットサイズとして判定: カメラ利用可能', name: 'GroupQRScannerPage');
      return isSuitableForScanning && !_isJoining;
    }

    // その他の場合はカメラ利用不可
    developer.log('その他のデバイスとして判定: カメラ利用不可', name: 'GroupQRScannerPage');
    return false;
  }

  void _showManualInputDialog(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    final TextEditingController controller = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('招待コード入力'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('グループの招待コードを入力してください'),
            SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: InputDecoration(
                labelText: '招待コード',
                border: OutlineInputBorder(),
                hintText: '例: ABC123',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('キャンセル'),
          ),
          ElevatedButton(
            onPressed: () async {
              final inviteCode = controller.text.trim();
              if (inviteCode.isNotEmpty) {
                Navigator.pop(context);
                await _joinGroup('', inviteCode);
              }
            },
            child: Text('参加する'),
          ),
        ],
      ),
    );
  }
}
