import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../utils/web_ui_utils.dart';

/// ハンドピックゲームページ
class HandpickGamePage extends StatefulWidget {
  const HandpickGamePage({super.key});

  @override
  State<HandpickGamePage> createState() => _HandpickGamePageState();
}

class _HandpickGamePageState extends State<HandpickGamePage>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    ));
    
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(
              Icons.casino,
              color: themeSettings.iconColor,
              size: 24,
            ),
            SizedBox(width: 8),
            Text(
              'ハンドピックゲーム',
              style: TextStyle(
                color: themeSettings.appBarTextColor,
                fontSize: 20 * themeSettings.fontSizeScale,
                fontWeight: FontWeight.bold,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ],
        ),
        backgroundColor: themeSettings.appBarColor,
        iconTheme: IconThemeData(color: themeSettings.iconColor),
        elevation: 0,
      ),
      body: WebUIUtils.isWeb
          ? _buildWebLayout(themeSettings)
          : _buildMobileLayout(themeSettings),
    );
  }

  /// WEB版レイアウト
  Widget _buildWebLayout(ThemeSettings themeSettings) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            themeSettings.backgroundColor,
            themeSettings.backgroundColor.withValues(alpha: 0.8),
          ],
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final screenWidth = constraints.maxWidth;
          final isMobile = screenWidth < 768;
          final isTablet = screenWidth >= 768 && screenWidth < 1024;

          return Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: isMobile ? double.infinity : (isTablet ? 800 : 1200),
              ),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: _buildContent(themeSettings),
              ),
            ),
          );
        },
      ),
    );
  }

  /// モバイル版レイアウト
  Widget _buildMobileLayout(ThemeSettings themeSettings) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            themeSettings.backgroundColor,
            themeSettings.backgroundColor.withValues(alpha: 0.8),
          ],
        ),
      ),
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: _buildContent(themeSettings),
      ),
    );
  }

  /// 共通コンテンツ
  Widget _buildContent(ThemeSettings themeSettings) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(height: 40),
          
          // メインアイコン
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: themeSettings.iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(
                color: themeSettings.iconColor.withValues(alpha: 0.3),
                width: 2,
              ),
            ),
            child: Icon(
              Icons.casino,
              size: 60,
              color: themeSettings.iconColor,
            ),
          ),
          
          SizedBox(height: 32),
          
          // タイトル
          Text(
            'ハンドピックゲーム',
            style: TextStyle(
              fontSize: 28 * themeSettings.fontSizeScale,
              fontWeight: FontWeight.bold,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 16),
          
          // 説明文
          Text(
            'コーヒー豆の手選別ゲーム\n（準備中）',
            style: TextStyle(
              fontSize: 16 * themeSettings.fontSizeScale,
              color: themeSettings.fontColor1.withValues(alpha: 0.7),
              fontFamily: themeSettings.fontFamily,
            ),
            textAlign: TextAlign.center,
          ),
          
          SizedBox(height: 48),
          
          // 準備中メッセージ
          Container(
            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: BoxDecoration(
              color: themeSettings.cardBackgroundColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: themeSettings.iconColor.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.info_outline,
                  color: themeSettings.iconColor,
                  size: 20,
                ),
                SizedBox(width: 12),
                Text(
                  'この機能は現在開発中です',
                  style: TextStyle(
                    fontSize: 14 * themeSettings.fontSizeScale,
                    color: themeSettings.fontColor1,
                    fontFamily: themeSettings.fontFamily,
                  ),
                ),
              ],
            ),
          ),
          
          SizedBox(height: 32),
          
          // 戻るボタン
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.arrow_back),
            label: Text('戻る'),
            style: ElevatedButton.styleFrom(
              backgroundColor: themeSettings.buttonColor,
              foregroundColor: themeSettings.fontColor2,
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
