import 'package:flutter/material.dart';
import '../../models/theme_settings.dart';
import '../../services/attendance_firestore_service.dart';
import '../../models/attendance_models.dart';
import '../../utils/web_ui_utils.dart';
import 'home_header.dart';
import 'home_feature_section.dart';
import 'home_feature_card.dart';
import '../roast/roast_timer_page.dart';
import '../business/assignment_board_page.dart';
import '../schedule/schedule_page.dart';

/// ホーム画面のメインコンテンツ
class HomeBody extends StatefulWidget {
  final ThemeSettings themeSettings;

  const HomeBody({super.key, required this.themeSettings});

  @override
  State<HomeBody> createState() => _HomeBodyState();
}

class _HomeBodyState extends State<HomeBody> {
  // 折りたたみ状態を管理
  final Map<String, bool> _expandedSections = {
    'business': false, // デフォルトで何も開かない
    'record': false,
    'growth': false,
    'support': false,
  };

  @override
  Widget build(BuildContext context) {
    // WEB版とモバイル版で異なるレイアウトを適用
    if (WebUIUtils.isWeb) {
      return _buildWebLayout();
    } else {
      return _buildMobileLayout();
    }
  }

  /// WEB版用のレイアウトを構築
  Widget _buildWebLayout() {
    final isDesktop = WebUIUtils.isDesktop(context);
    final isLargeTablet = WebUIUtils.isLargeTablet(context);
    final isTablet = WebUIUtils.isTablet(context);
    final isMobile = WebUIUtils.isMobile(context);
    final isSmallMobile = WebUIUtils.isSmallMobile(context);
    final isMediumMobile = WebUIUtils.isMediumMobile(context);

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isDesktop || isLargeTablet || isTablet) ...[
            // デスクトップ・タブレット: 2列2行レイアウト
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  // 上段: 業務と記録
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _buildTabletSection(
                          title: '業務',
                          subtitle: '焙煎とスケジュール管理',
                          icon: Icons.work,
                          accentColor: _getThemeBasedColor('business'),
                          children: _buildBusinessFeatures(),
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: _buildTabletSection(
                          title: '記録',
                          subtitle: '作業記録',
                          icon: Icons.assignment,
                          accentColor: _getThemeBasedColor('record'),
                          children: _buildRecordFeatures(),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),

                  // 下段: 功績と成長とサポート・設定
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _buildTabletSection(
                          title: '功績と成長',
                          subtitle: 'バッジとグループ情報',
                          icon: Icons.emoji_events,
                          accentColor: _getThemeBasedColor('growth'),
                          children: _buildGrowthFeatures(),
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: _buildTabletSection(
                          title: 'サポート・設定',
                          subtitle: '設定とヘルプ',
                          icon: Icons.settings,
                          accentColor: _getThemeBasedColor('support'),
                          children: _buildSupportFeatures(),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ] else if (isMobile) ...[
            // スマホ: 画面サイズに応じた最適化されたレイアウト
            Padding(
              padding: WebUIUtils.getResponsivePadding(context),
              child: Column(
                children: [
                  // ヘッダーメッセージ
                  HomeHeader(themeSettings: widget.themeSettings),
                  SizedBox(
                    height: isSmallMobile ? 16 : (isMediumMobile ? 20 : 24),
                  ),
                  // 業務セクション（スマホでは折りたたみ）
                  HomeFeatureSection(
                    themeSettings: widget.themeSettings,
                    title: '業務',
                    icon: Icons.work,
                    accentColor: _getThemeBasedColor('business'),
                    isExpanded: _expandedSections['business']!,
                    onToggle: () => _toggleSection('business'),
                    children: _buildBusinessFeatures(),
                  ),
                  SizedBox(
                    height: isSmallMobile ? 8 : (isMediumMobile ? 12 : 16),
                  ),

                  // 記録セクション（スマホでは折りたたみ）
                  HomeFeatureSection(
                    themeSettings: widget.themeSettings,
                    title: '記録',
                    icon: Icons.assignment,
                    accentColor: _getThemeBasedColor('record'),
                    isExpanded: _expandedSections['record']!,
                    onToggle: () => _toggleSection('record'),
                    children: _buildRecordFeatures(),
                  ),
                  SizedBox(
                    height: isSmallMobile ? 8 : (isMediumMobile ? 12 : 16),
                  ),

                  // 功績と成長セクション（スマホでは折りたたみ）
                  HomeFeatureSection(
                    themeSettings: widget.themeSettings,
                    title: '功績と成長',
                    icon: Icons.emoji_events,
                    accentColor: _getThemeBasedColor('growth'),
                    isExpanded: _expandedSections['growth']!,
                    onToggle: () => _toggleSection('growth'),
                    children: _buildGrowthFeatures(),
                  ),
                  SizedBox(
                    height: isSmallMobile ? 8 : (isMediumMobile ? 12 : 16),
                  ),

                  // サポート・設定セクション（スマホでは折りたたみ）
                  HomeFeatureSection(
                    themeSettings: widget.themeSettings,
                    title: 'サポート・設定',
                    icon: Icons.settings,
                    accentColor: _getThemeBasedColor('support'),
                    isExpanded: _expandedSections['support']!,
                    onToggle: () => _toggleSection('support'),
                    children: _buildSupportFeatures(),
                  ),
                ],
              ),
            ),
          ] else ...[
            // その他のサイズ（フォールバック）
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                children: [
                  _buildWebSection(
                    title: '業務',
                    subtitle: '焙煎とスケジュール管理',
                    icon: Icons.work,
                    accentColor: _getThemeBasedColor('business'),
                    children: _buildBusinessFeatures(),
                  ),
                  SizedBox(height: 20),
                  _buildWebSection(
                    title: '記録',
                    subtitle: '作業記録',
                    icon: Icons.assignment,
                    accentColor: _getThemeBasedColor('record'),
                    children: _buildRecordFeatures(),
                  ),
                  SizedBox(height: 20),
                  _buildWebSection(
                    title: '功績と成長',
                    subtitle: 'バッジとグループ情報',
                    icon: Icons.emoji_events,
                    accentColor: _getThemeBasedColor('growth'),
                    children: _buildGrowthFeatures(),
                  ),
                  SizedBox(height: 20),
                  _buildWebSection(
                    title: 'サポート・設定',
                    subtitle: '設定とヘルプ',
                    icon: Icons.settings,
                    accentColor: _getThemeBasedColor('support'),
                    children: _buildSupportFeatures(),
                  ),
                ],
              ),
            ),
          ],
          SizedBox(height: isSmallMobile ? 12 : (isMediumMobile ? 16 : 20)),
        ],
      ),
    );
  }

  /// WEB版用のセクションを構築
  Widget _buildWebSection({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
    required List<HomeFeatureCard> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // セクションヘッダー
        SizedBox(
          width: double.infinity,
          child: Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: accentColor.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16 * WebUIUtils.getFontSizeScale(context),
                    fontWeight: FontWeight.bold,
                    color: widget.themeSettings.fontColor1,
                    fontFamily: widget.themeSettings.fontFamily,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  subtitle,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12 * WebUIUtils.getFontSizeScale(context),
                    color: widget.themeSettings.fontColor1.withValues(
                      alpha: 0.7,
                    ),
                    fontFamily: widget.themeSettings.fontFamily,
                  ),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 12),
        // グリッドレイアウトでカードを表示
        GridView.count(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          childAspectRatio: 1.1,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: children,
        ),
      ],
    );
  }

  /// タブレット用のセクションを構築（オーバーフロー対策付き）
  Widget _buildTabletSection({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color accentColor,
    required List<HomeFeatureCard> children,
  }) {
    // iPad Miniなどの小さいタブレット向けの調整
    final isSmallTablet = WebUIUtils.isTablet(context);
    final cardAspectRatio = isSmallTablet ? 0.9 : 1.2;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // セクションヘッダー
        SizedBox(
          width: double.infinity,
          child: Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: accentColor.withValues(alpha: 0.2),
                width: 1,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13 * WebUIUtils.getFontSizeScale(context),
                    fontWeight: FontWeight.bold,
                    color: widget.themeSettings.fontColor1,
                    fontFamily: widget.themeSettings.fontFamily,
                  ),
                ),
                SizedBox(height: 1),
                Text(
                  subtitle,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 10 * WebUIUtils.getFontSizeScale(context),
                    color: widget.themeSettings.fontColor1.withValues(
                      alpha: 0.7,
                    ),
                    fontFamily: widget.themeSettings.fontFamily,
                  ),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 8),
        // グリッドレイアウトでカードを表示（3列2行）
        GridView.count(
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          crossAxisCount: 3,
          childAspectRatio: cardAspectRatio,
          crossAxisSpacing: 6,
          mainAxisSpacing: 6,
          children: children,
        ),
      ],
    );
  }

  /// モバイル版用のレイアウトを構築（従来の実装）
  Widget _buildMobileLayout() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ヘッダー
          HomeHeader(themeSettings: widget.themeSettings),
          SizedBox(height: 24),

          // 業務セクション
          HomeFeatureSection(
            themeSettings: widget.themeSettings,
            title: '業務',
            icon: Icons.work,
            accentColor: _getThemeBasedColor('business'),
            isExpanded: _expandedSections['business']!,
            onToggle: () => _toggleSection('business'),
            children: _buildBusinessFeatures(),
          ),
          SizedBox(height: 24),

          // 記録セクション
          HomeFeatureSection(
            themeSettings: widget.themeSettings,
            title: '記録',
            icon: Icons.assessment,
            accentColor: _getThemeBasedColor('record'),
            isExpanded: _expandedSections['record']!,
            onToggle: () => _toggleSection('record'),
            children: _buildRecordFeatures(),
          ),
          SizedBox(height: 24),

          // 功績と成長セクション
          HomeFeatureSection(
            themeSettings: widget.themeSettings,
            title: '功績と成長',
            icon: Icons.emoji_events,
            accentColor: _getThemeBasedColor('growth'),
            isExpanded: _expandedSections['growth']!,
            onToggle: () => _toggleSection('growth'),
            children: _buildGrowthFeatures(),
          ),
          SizedBox(height: 24),

          // サポート・設定セクション
          HomeFeatureSection(
            themeSettings: widget.themeSettings,
            title: 'サポート・設定',
            icon: Icons.settings,
            accentColor: _getThemeBasedColor('support'),
            isExpanded: _expandedSections['support']!,
            onToggle: () => _toggleSection('support'),
            children: _buildSupportFeatures(),
          ),
          SizedBox(height: 32),
        ],
      ),
    );
  }

  /// セクションの折りたたみ状態を切り替え
  void _toggleSection(String sectionKey) {
    setState(() {
      _expandedSections[sectionKey] = !_expandedSections[sectionKey]!;
    });
  }

  /// 業務機能カードを構築
  List<HomeFeatureCard> _buildBusinessFeatures() {
    // 基本テーマ以外ではテーマ色を使用
    final businessColor = _getThemeBasedColor('business');

    return [
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '焙煎タイマー',
        icon: Icons.timer,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => RoastTimerPage()),
        ),
        isImportant: true, // 重要機能
        customColor: businessColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '焙煎記録入力',
        icon: Icons.edit_note,
        onTap: () => Navigator.pushNamed(context, '/roast_record'),
        isImportant: true, // 重要機能
        customColor: businessColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '焙煎分析',
        icon: Icons.insights,
        onTap: () => Navigator.pushNamed(context, '/roast_analysis'),
        customColor: businessColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '焙煎記録一覧',
        icon: Icons.analytics,
        onTap: () => Navigator.pushNamed(context, '/roast_record_list'),
        customColor: businessColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '担当表',
        icon: Icons.group,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => AssignmentBoard()),
        ),
        badge: _buildAttendanceBadge(),
        customColor: businessColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: 'スケジュール',
        icon: Icons.schedule,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => SchedulePage()),
        ),
        customColor: businessColor,
      ),
    ];
  }

  /// 記録機能カードを構築
  List<HomeFeatureCard> _buildRecordFeatures() {
    // 基本テーマ以外ではテーマ色を使用
    final recordColor = _getThemeBasedColor('record');

    return [
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: 'カウンター',
        icon: Icons.add_circle_outline,
        onTap: () => Navigator.pushNamed(context, '/drip'),
        isImportant: true, // 重要機能
        customColor: recordColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '試飲感想記録',
        icon: Icons.coffee,
        onTap: () => Navigator.pushNamed(context, '/tasting'),
        customColor: recordColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '作業進捗',
        icon: Icons.trending_up,
        onTap: () => Navigator.pushNamed(context, '/work_progress'),
        customColor: recordColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: 'カレンダー',
        icon: Icons.calendar_today,
        onTap: () => Navigator.pushNamed(context, '/calendar'),
        customColor: recordColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '計算機',
        icon: Icons.calculate,
        onTap: () => Navigator.pushNamed(context, '/calculator'),
        customColor: recordColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: 'メモ・TODO',
        icon: Icons.checklist,
        onTap: () => Navigator.pushNamed(context, '/todo'),
        customColor: recordColor,
      ),
    ];
  }

  /// 功績と成長カードを構築
  List<HomeFeatureCard> _buildGrowthFeatures() {
    // 基本テーマ以外ではテーマ色を使用
    final growthColor = _getThemeBasedColor('growth');

    return [
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: 'グループ情報',
        icon: Icons.group_work,
        onTap: () => Navigator.pushNamed(context, '/group_info'),
        customColor: growthColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: 'バッジ一覧',
        icon: Icons.emoji_events,
        onTap: () => Navigator.pushNamed(context, '/badges'),
        customColor: growthColor,
      ),
    ];
  }

  /// サポート・設定カードを構築
  List<HomeFeatureCard> _buildSupportFeatures() {
    // 基本テーマ以外ではテーマ色を使用
    final supportColor = _getThemeBasedColor('support');

    return [
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '使い方ガイド',
        icon: Icons.help_outline,
        onTap: () => Navigator.pushNamed(context, '/help'),
        customColor: supportColor,
      ),
      HomeFeatureCard(
        themeSettings: widget.themeSettings,
        title: '設定',
        icon: Icons.settings,
        onTap: () => Navigator.pushNamed(context, '/settings'),
        customColor: supportColor,
      ),
    ];
  }

  /// 出勤状態バッジを構築
  Widget _buildAttendanceBadge() {
    return FutureBuilder<bool>(
      future: _checkTodayAttendance(),
      builder: (context, snapshot) {
        final isAttended = snapshot.data ?? false;

        if (!isAttended) return SizedBox.shrink();

        return Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: widget.themeSettings.iconColor,
            shape: BoxShape.circle,
            border: Border.all(
              color: widget.themeSettings.cardBackgroundColor,
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: widget.themeSettings.iconColor.withValues(alpha: 0.3),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Icon(
            Icons.check,
            color: widget.themeSettings.cardBackgroundColor,
            size: 10,
          ),
        );
      },
    );
  }

  /// 今日の出勤記録をチェック
  Future<bool> _checkTodayAttendance() async {
    if (!mounted) return false;

    try {
      final records = await AttendanceFirestoreService.getTodayAttendance();
      return records.isNotEmpty &&
          records.any((record) => record.status == AttendanceStatus.present);
    } catch (e) {
      return false;
    }
  }

  /// テーマに基づいた色を取得
  Color _getThemeBasedColor(String sectionType) {
    // すべてのテーマでデフォルトテーマと同じ色を使用
    switch (sectionType) {
      case 'business':
        return Color(0xFFE65100); // 焙煎をイメージした暖色のオレンジ（火・熱を表現）
      case 'record':
        return Colors.blue.shade700;
      case 'growth':
        return Color(0xFFD4AF37); // ゴールド
      case 'support':
        return Color(0xFF757575); // グレー
      default:
        return widget.themeSettings.iconColor;
    }
  }
}
