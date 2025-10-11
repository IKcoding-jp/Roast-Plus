import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart';
import '../../models/group_provider.dart';
import '../../models/theme_settings.dart';
import '../../services/qr_code_service.dart';
import '../../services/group_firestore_service.dart';
import '../../services/group_invitation_service.dart';
import '../../models/group_models.dart';
import '../../utils/web_ui_utils.dart';
import '../../widgets/web_responsive_widget.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:async';

class GroupQRGeneratePage extends StatefulWidget {
  const GroupQRGeneratePage({super.key});

  @override
  State<GroupQRGeneratePage> createState() => _GroupQRGeneratePageState();
}

class _GroupQRGeneratePageState extends State<GroupQRGeneratePage> {
  String? _qrData;
  bool _isGenerating = false;
  bool _hasPermission = true;
  bool _isCheckingPermission = true;
  StreamSubscription<GroupSettings?>? _permissionSubscription;

  @override
  void initState() {
    super.initState();
    _startPermissionListener();
  }

  void _startPermissionListener() {
    final groupProvider = context.read<GroupProvider>();
    final group = groupProvider.currentGroup;
    final user = FirebaseAuth.instance.currentUser;

    if (group == null || user == null) {
      setState(() {
        _hasPermission = false;
        _isCheckingPermission = false;
      });
      return;
    }

    // ユーザーのロールを取得
    final userRole = group.getMemberRole(user.uid);

    // 管理者またはリーダーは常に許可
    if (userRole == GroupRole.admin || userRole == GroupRole.leader) {
      setState(() {
        _hasPermission = true;
        _isCheckingPermission = false;
      });
      _generateQRCode();
      return;
    }

    // メンバーの場合は設定をリアルタイム監視
    _permissionSubscription?.cancel();
    _permissionSubscription = GroupFirestoreService.watchGroupSettings(group.id)
        .listen((settings) {
          if (settings != null) {
            final allowInvite = settings.allowMemberInvite;
            setState(() {
              _hasPermission = allowInvite;
              _isCheckingPermission = false;
            });

            if (allowInvite && _qrData == null) {
              _generateQRCode();
            }
          } else {
            setState(() {
              _hasPermission = false;
              _isCheckingPermission = false;
            });
          }
        });
  }

  Future<void> _generateQRCode() async {
    setState(() {
      _isGenerating = true;
    });

    final groupProvider = context.read<GroupProvider>();
    final group = groupProvider.currentGroup;

    if (group != null) {
      try {
        // GroupInvitationServiceを使用して招待コードを作成または取得
        final invitationCode =
            await GroupInvitationService.createGroupInvitationCode(
              group.id,
              expiresIn: Duration(days: 30), // 30日間有効
            );

        final qrData = QRCodeService.generateGroupJoinData(
          groupId: group.id,
          groupName: group.name,
          inviteCode: invitationCode,
        );

        setState(() {
          _qrData = qrData;
          _isGenerating = false;
        });
      } catch (e) {
        setState(() {
          _isGenerating = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('QRコードの生成に失敗しました: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } else {
      setState(() {
        _isGenerating = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('グループ情報の取得に失敗しました'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final groupProvider = Provider.of<GroupProvider>(context);
    final group = groupProvider.currentGroup;

    if (group == null) {
      return _buildErrorScaffold(context, themeSettings, 'グループ情報が見つかりません');
    }

    // 権限チェック中
    if (_isCheckingPermission) {
      return _buildLoadingScaffold(context, themeSettings);
    }

    // 権限がない場合
    if (!_hasPermission) {
      return _buildPermissionDeniedScaffold(context, themeSettings);
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'QRコード生成',
          style: TextStyle(
            color: themeSettings.appBarTextColor,
            fontSize: 20 * themeSettings.fontSizeScale,
            fontWeight: FontWeight.bold,
            fontFamily: themeSettings.fontFamily,
          ),
        ),
        backgroundColor: themeSettings.appBarColor,
        iconTheme: IconThemeData(color: themeSettings.iconColor),
        actions: [
          IconButton(
            onPressed: _isGenerating ? null : _generateQRCode,
            icon: Icon(Icons.refresh),
            tooltip: '再生成',
          ),
        ],
      ),
      body: WebResponsiveBuilder(
        builder: (context, isMobile, isTablet, isDesktop) {
          return _buildResponsiveContent(
            context,
            themeSettings,
            group,
            isMobile,
            isTablet,
            isDesktop,
          );
        },
      ),
    );
  }

  Widget _buildErrorScaffold(
    BuildContext context,
    ThemeSettings themeSettings,
    String message,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'QRコード生成',
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
      body: Center(
        child: Text(
          message,
          style: TextStyle(
            color: themeSettings.fontColor1,
            fontSize: 16 * themeSettings.fontSizeScale,
            fontFamily: themeSettings.fontFamily,
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingScaffold(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'QRコード生成',
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
      body: Center(
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
              'Loading...',
              style: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 16 * themeSettings.fontSizeScale,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPermissionDeniedScaffold(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'QRコード生成',
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
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.lock,
                size: 80,
                color: themeSettings.fontColor1.withValues(alpha: 0.5),
              ),
              SizedBox(height: 24),
              Text(
                '権限がありません',
                style: TextStyle(
                  color: themeSettings.fontColor1,
                  fontSize: 20 * themeSettings.fontSizeScale,
                  fontWeight: FontWeight.bold,
                  fontFamily: themeSettings.fontFamily,
                ),
              ),
              SizedBox(height: 16),
              Text(
                'QRコードの生成には管理者またはリーダーの権限が必要です。\n\nメンバーが招待できる設定が有効になっている場合は、管理者またはリーダーに設定の確認を依頼してください。',
                style: TextStyle(
                  color: themeSettings.fontColor1.withValues(alpha: 0.7),
                  fontSize: 14 * themeSettings.fontSizeScale,
                  fontFamily: themeSettings.fontFamily,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: themeSettings.buttonColor,
                  foregroundColor: themeSettings.fontColor2,
                  padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                ),
                child: Text(
                  '戻る',
                  style: TextStyle(
                    fontSize: 16 * themeSettings.fontSizeScale,
                    fontWeight: FontWeight.bold,
                    fontFamily: themeSettings.fontFamily,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResponsiveContent(
    BuildContext context,
    ThemeSettings themeSettings,
    Group group,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    if (kIsWeb) {
      return WebUIUtils.responsiveContainer(
        context: context,
        child: Column(
          children: [
            // ヘッダーカード
            _buildHeaderCard(
              context,
              themeSettings,
              group,
              isMobile,
              isTablet,
              isDesktop,
            ),

            SizedBox(height: isMobile ? 16 : 24),

            // QRコード表示エリア
            Expanded(
              child: _buildQRCodeArea(
                context,
                themeSettings,
                isMobile,
                isTablet,
                isDesktop,
              ),
            ),

            SizedBox(height: isMobile ? 16 : 24),

            // 情報カード
            _buildInfoCard(
              context,
              themeSettings,
              isMobile,
              isTablet,
              isDesktop,
            ),
          ],
        ),
      );
    } else {
      return SafeArea(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              // ヘッダーカード
              _buildHeaderCard(
                context,
                themeSettings,
                group,
                isMobile,
                isTablet,
                isDesktop,
              ),

              SizedBox(height: 24),

              // QRコード表示エリア
              Expanded(
                child: _buildQRCodeArea(
                  context,
                  themeSettings,
                  isMobile,
                  isTablet,
                  isDesktop,
                ),
              ),

              SizedBox(height: 16),

              // 情報カード
              _buildInfoCard(
                context,
                themeSettings,
                isMobile,
                isTablet,
                isDesktop,
              ),
            ],
          ),
        ),
      );
    }
  }

  Widget _buildHeaderCard(
    BuildContext context,
    ThemeSettings themeSettings,
    Group group,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    final padding = isMobile ? 16.0 : (isTablet ? 20.0 : 24.0);
    final titleSize = isMobile ? 16.0 : (isTablet ? 18.0 : 20.0);
    final subtitleSize = isMobile ? 14.0 : (isTablet ? 16.0 : 18.0);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: themeSettings.cardBackgroundColor,
      child: Padding(
        padding: EdgeInsets.all(padding),
        child: Column(
          children: [
            Text(
              'グループ参加用QRコード',
              style: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: titleSize * themeSettings.fontSizeScale,
                fontWeight: FontWeight.bold,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
            SizedBox(height: 8),
            Text(
              group.name,
              style: TextStyle(
                color: themeSettings.fontColor2,
                fontSize: subtitleSize * themeSettings.fontSizeScale,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRCodeArea(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    if (_isGenerating) {
      return _buildGeneratingContent(
        context,
        themeSettings,
        isMobile,
        isTablet,
        isDesktop,
      );
    } else if (_qrData != null) {
      return _buildQRCodeContent(
        context,
        themeSettings,
        isMobile,
        isTablet,
        isDesktop,
      );
    } else {
      return _buildEmptyContent(
        context,
        themeSettings,
        isMobile,
        isTablet,
        isDesktop,
      );
    }
  }

  Widget _buildGeneratingContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    return Center(
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
            'QRコードを生成中...',
            style: TextStyle(
              color: themeSettings.fontColor1,
              fontSize: 16 * themeSettings.fontSizeScale,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQRCodeContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    final screenSize = MediaQuery.of(context).size;
    final qrSize = _calculateQRCodeSize(
      screenSize,
      isMobile,
      isTablet,
      isDesktop,
    );
    final padding = isMobile ? 12.0 : (isTablet ? 16.0 : 20.0);

    return SingleChildScrollView(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(padding),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: QRCodeService.generateQRCode(
                data: _qrData!,
                size: qrSize,
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
              ),
            ),
            SizedBox(height: 24),
            Text(
              'このQRコードを他のメンバーに\n見せてグループに参加してもらいましょう',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 14 * themeSettings.fontSizeScale,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
            SizedBox(height: 8),
            Text(
              '※ QRコードは24時間で無効になります',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.orange,
                fontSize: 12 * themeSettings.fontSizeScale,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyContent(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.qr_code,
            size: isMobile ? 64.0 : (isTablet ? 80.0 : 96.0),
            color: themeSettings.iconColor,
          ),
          SizedBox(height: 16),
          Text(
            'QRコードを生成してください',
            style: TextStyle(
              color: themeSettings.fontColor1,
              fontSize: 16 * themeSettings.fontSizeScale,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context,
    ThemeSettings themeSettings,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    final padding = isMobile ? 16.0 : (isTablet ? 20.0 : 24.0);
    final iconSize = isMobile ? 18.0 : 20.0;
    final titleSize = isMobile ? 14.0 : (isTablet ? 16.0 : 18.0);
    final contentSize = isMobile ? 12.0 : (isTablet ? 14.0 : 16.0);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: themeSettings.cardBackgroundColor,
      child: Padding(
        padding: EdgeInsets.all(padding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.info_outline,
                  color: themeSettings.iconColor,
                  size: iconSize,
                ),
                SizedBox(width: 8),
                Text(
                  'QRコードについて',
                  style: TextStyle(
                    color: themeSettings.fontColor1,
                    fontSize: titleSize * themeSettings.fontSizeScale,
                    fontWeight: FontWeight.bold,
                    fontFamily: themeSettings.fontFamily,
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Text(
              '• QRコードを読み取ることでグループに参加できます\n'
              '• 24時間で自動的に無効になります\n'
              '• 再生成ボタンで新しいQRコードを作成できます\n'
              '• 他のメンバーにQRコードを見せて参加してもらいましょう',
              style: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: contentSize * themeSettings.fontSizeScale,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _calculateQRCodeSize(
    Size screenSize,
    bool isMobile,
    bool isTablet,
    bool isDesktop,
  ) {
    if (isMobile) {
      // スマホ: 画面幅の60-70%
      return (screenSize.width * 0.6).clamp(200.0, 300.0);
    } else if (isTablet) {
      // タブレット: 画面幅の40-50%
      return (screenSize.width * 0.4).clamp(300.0, 400.0);
    } else {
      // PC: 固定サイズ
      return 400.0;
    }
  }

  @override
  void dispose() {
    _permissionSubscription?.cancel();
    super.dispose();
  }
}
