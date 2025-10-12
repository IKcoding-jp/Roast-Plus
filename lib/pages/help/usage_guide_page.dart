import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../utils/web_ui_utils.dart';

class UsageGuidePage extends StatefulWidget {
  const UsageGuidePage({super.key});

  @override
  State<UsageGuidePage> createState() => _UsageGuidePageState();
}

class _DetailPage extends StatelessWidget {
  final String title;
  final List<String> content;
  final ThemeSettings themeSettings;

  const _DetailPage({
    required this.title,
    required this.content,
    required this.themeSettings,
  });

  @override
  Widget build(BuildContext context) {
    return DefaultTextStyle.merge(
      style: TextStyle(fontFamily: themeSettings.fontFamily),
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            title,
            style: TextStyle(
              fontFamily: themeSettings.fontFamily,
              fontSize: (20 * themeSettings.fontSizeScale).clamp(16.0, 28.0),
            ),
          ),
          backgroundColor: themeSettings.appBarColor,
          foregroundColor: themeSettings.appBarTextColor,
        ),
        body: Container(
          color: themeSettings.backgroundColor,
          child: WebUIUtils.isWeb
              ? Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: 800),
                    child: SingleChildScrollView(
                      padding: EdgeInsets.all(24),
                      child: Card(
                        elevation: 4,
                        color: themeSettings.cardBackgroundColor,
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: content.map((item) {
                              final headingStyle = TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.fontColor1,
                                fontFamily: themeSettings.fontFamily,
                              );
                              final bodyStyle = TextStyle(
                                fontSize: 18,
                                color: themeSettings.fontColor1.withValues(
                                  alpha: 0.85,
                                ),
                                fontFamily: themeSettings.fontFamily,
                              );

                              if (item.isEmpty) {
                                return SizedBox(height: 16);
                              } else if (item.startsWith('【') &&
                                  item.endsWith('】')) {
                                return Padding(
                                  padding: EdgeInsets.only(bottom: 12),
                                  child: Text(item, style: headingStyle),
                                );
                              } else {
                                return Padding(
                                  padding: EdgeInsets.only(bottom: 6),
                                  child: Text(item, style: bodyStyle),
                                );
                              }
                            }).toList(),
                          ),
                        ),
                      ),
                    ),
                  ),
                )
              : SingleChildScrollView(
                  padding: EdgeInsets.all(16),
                  child: Card(
                    elevation: 4,
                    color: themeSettings.cardBackgroundColor,
                    child: Padding(
                      padding: EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: content.map((item) {
                          final headingStyle = TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: themeSettings.fontColor1,
                            fontFamily: themeSettings.fontFamily,
                          );
                          final bodyStyle = TextStyle(
                            fontSize: 18,
                            color: themeSettings.fontColor1.withValues(
                              alpha: 0.85,
                            ),
                            fontFamily: themeSettings.fontFamily,
                          );

                          if (item.isEmpty) {
                            return SizedBox(height: 16);
                          } else if (item.startsWith('【') &&
                              item.endsWith('】')) {
                            return Padding(
                              padding: EdgeInsets.only(bottom: 12),
                              child: Text(item, style: headingStyle),
                            );
                          } else {
                            return Padding(
                              padding: EdgeInsets.only(bottom: 6),
                              child: Text(item, style: bodyStyle),
                            );
                          }
                        }).toList(),
                      ),
                    ),
                  ),
                ),
        ),
      ),
    );
  }
}

class _UsageGuidePageState extends State<UsageGuidePage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);

    final tabLabelStyle = TextStyle(
      fontFamily: themeSettings.fontFamily,
      fontSize: (14 * themeSettings.fontSizeScale).clamp(12.0, 18.0),
      fontWeight: FontWeight.w600,
    );

    return DefaultTextStyle.merge(
      style: TextStyle(fontFamily: themeSettings.fontFamily),
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            '使い方ガイド',
            style: TextStyle(
              fontFamily: themeSettings.fontFamily,
              fontSize: (20 * themeSettings.fontSizeScale).clamp(16.0, 28.0),
            ),
          ),
          backgroundColor: themeSettings.appBarColor,
          foregroundColor: themeSettings.appBarTextColor,
          bottom: WebUIUtils.isWeb
              ? null
              : TabBar(
                  controller: _tabController,
                  indicatorColor: themeSettings.buttonColor,
                  labelColor: themeSettings.appBarTextColor,
                  unselectedLabelColor: themeSettings.appBarTextColor
                      .withValues(alpha: 0.7),
                  labelStyle: tabLabelStyle,
                  unselectedLabelStyle: tabLabelStyle.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                  tabs: [
                    Tab(text: '基本'),
                    Tab(text: '焙煎'),
                    Tab(text: '管理'),
                    Tab(text: 'グループ'),
                    Tab(text: 'ゲーム'),
                    Tab(text: '設定'),
                  ],
                ),
        ),
        body: WebUIUtils.isWeb
            ? _buildWebLayout(themeSettings)
            : TabBarView(
                controller: _tabController,
                children: [
                  _buildBasicTab(themeSettings),
                  _buildRoastingTab(themeSettings),
                  _buildManagementTab(themeSettings),
                  _buildGroupTab(themeSettings),
                  _buildGamificationTab(themeSettings),
                  _buildSettingsTab(themeSettings),
                ],
              ),
      ),
    );
  }

  Widget _buildWebLayout(ThemeSettings themeSettings) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final screenWidth = constraints.maxWidth;
        final isMobile = screenWidth < 768;
        final isTablet = screenWidth >= 768 && screenWidth < 1024;

        if (isMobile) {
          // スマホ解像度: 縦並びレイアウト
          return _buildMobileWebLayout(themeSettings);
        } else if (isTablet) {
          // タブレット解像度: サイドバーを狭く
          return _buildTabletWebLayout(themeSettings);
        } else {
          // デスクトップ解像度: 通常のレイアウト
          return _buildDesktopWebLayout(themeSettings);
        }
      },
    );
  }

  Widget _buildMobileWebLayout(ThemeSettings themeSettings) {
    return Container(
      color: themeSettings.backgroundColor,
      child: Column(
        children: [
          // カテゴリ選択タブ（横スクロール）
          SizedBox(
            height: 60,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              children: [
                _buildMobileCategoryTab(
                  themeSettings,
                  '基本',
                  Icons.play_arrow,
                  0,
                ),
                _buildMobileCategoryTab(themeSettings, '焙煎', Icons.timer, 1),
                _buildMobileCategoryTab(themeSettings, '管理', Icons.schedule, 2),
                _buildMobileCategoryTab(themeSettings, 'グループ', Icons.group, 3),
                _buildMobileCategoryTab(
                  themeSettings,
                  'ゲーム',
                  Icons.emoji_events,
                  4,
                ),
                _buildMobileCategoryTab(themeSettings, '設定', Icons.settings, 5),
              ],
            ),
          ),
          // コンテンツエリア
          Expanded(
            child: IndexedStack(
              index: _tabController.index,
              children: [
                _buildBasicTab(themeSettings, isMobile: true),
                _buildRoastingTab(themeSettings, isMobile: true),
                _buildManagementTab(themeSettings, isMobile: true),
                _buildGroupTab(themeSettings, isMobile: true),
                _buildGamificationTab(themeSettings, isMobile: true),
                _buildSettingsTab(themeSettings, isMobile: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabletWebLayout(ThemeSettings themeSettings) {
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 1200),
        child: Container(
          color: themeSettings.backgroundColor,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 左側のカテゴリナビゲーション（狭く）
              Container(
                width: 180,
                decoration: BoxDecoration(
                  color: themeSettings.cardBackgroundColor,
                  border: Border(
                    right: BorderSide(
                      color: themeSettings.borderColor,
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  children: [
                    // カテゴリヘッダー
                    Container(
                      padding: EdgeInsets.all(12),
                      child: Text(
                        'カテゴリ',
                        style: TextStyle(
                          fontSize: 16 * themeSettings.fontSizeScale,
                          fontWeight: FontWeight.bold,
                          color: themeSettings.fontColor1,
                          fontFamily: themeSettings.fontFamily,
                        ),
                      ),
                    ),
                    // カテゴリリスト
                    Expanded(
                      child: ListView(
                        children: [
                          _buildWebCategoryItem(
                            themeSettings,
                            '基本',
                            Icons.play_arrow,
                            0,
                            isTablet: true,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            '焙煎',
                            Icons.timer,
                            1,
                            isTablet: true,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            '管理',
                            Icons.schedule,
                            2,
                            isTablet: true,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            'グループ',
                            Icons.group,
                            3,
                            isTablet: true,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            'ゲーム',
                            Icons.emoji_events,
                            4,
                            isTablet: true,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            '設定',
                            Icons.settings,
                            5,
                            isTablet: true,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // 右側のコンテンツエリア
              Expanded(
                child: SizedBox(
                  height: MediaQuery.of(context).size.height - 120,
                  child: IndexedStack(
                    index: _tabController.index,
                    children: [
                      _buildBasicTab(themeSettings, isTablet: true),
                      _buildRoastingTab(themeSettings, isTablet: true),
                      _buildManagementTab(themeSettings, isTablet: true),
                      _buildGroupTab(themeSettings, isTablet: true),
                      _buildGamificationTab(themeSettings, isTablet: true),
                      _buildSettingsTab(themeSettings, isTablet: true),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDesktopWebLayout(ThemeSettings themeSettings) {
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 1400),
        child: Container(
          color: themeSettings.backgroundColor,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 左側のカテゴリナビゲーション
              Container(
                width: 250,
                decoration: BoxDecoration(
                  color: themeSettings.cardBackgroundColor,
                  border: Border(
                    right: BorderSide(
                      color: themeSettings.borderColor,
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  children: [
                    // カテゴリヘッダー
                    Container(
                      padding: EdgeInsets.all(16),
                      child: Text(
                        'カテゴリ',
                        style: TextStyle(
                          fontSize: 18 * themeSettings.fontSizeScale,
                          fontWeight: FontWeight.bold,
                          color: themeSettings.fontColor1,
                          fontFamily: themeSettings.fontFamily,
                        ),
                      ),
                    ),
                    // カテゴリリスト
                    Expanded(
                      child: ListView(
                        children: [
                          _buildWebCategoryItem(
                            themeSettings,
                            '基本',
                            Icons.play_arrow,
                            0,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            '焙煎',
                            Icons.timer,
                            1,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            '管理',
                            Icons.schedule,
                            2,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            'グループ',
                            Icons.group,
                            3,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            'ゲーム',
                            Icons.emoji_events,
                            4,
                          ),
                          _buildWebCategoryItem(
                            themeSettings,
                            '設定',
                            Icons.settings,
                            5,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // 右側のコンテンツエリア
              Expanded(
                child: SizedBox(
                  height: MediaQuery.of(context).size.height - 120,
                  child: IndexedStack(
                    index: _tabController.index,
                    children: [
                      _buildBasicTab(themeSettings),
                      _buildRoastingTab(themeSettings),
                      _buildManagementTab(themeSettings),
                      _buildGroupTab(themeSettings),
                      _buildGamificationTab(themeSettings),
                      _buildSettingsTab(themeSettings),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMobileCategoryTab(
    ThemeSettings themeSettings,
    String title,
    IconData icon,
    int index,
  ) {
    final isSelected = _tabController.index == index;

    return Container(
      margin: EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () {
          setState(() {
            _tabController.animateTo(index);
          });
        },
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? themeSettings.buttonColor
                : themeSettings.cardBackgroundColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected
                  ? themeSettings.buttonColor
                  : themeSettings.borderColor.withValues(alpha: 0.3),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: isSelected
                    ? themeSettings.fontColor2
                    : themeSettings.iconColor,
              ),
              SizedBox(width: 6),
              Text(
                title,
                style: TextStyle(
                  fontSize: 12 * themeSettings.fontSizeScale,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected
                      ? themeSettings.fontColor2
                      : themeSettings.fontColor1,
                  fontFamily: themeSettings.fontFamily,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWebCategoryItem(
    ThemeSettings themeSettings,
    String title,
    IconData icon,
    int index, {
    bool isTablet = false,
  }) {
    final isSelected = _tabController.index == index;

    return Container(
      margin: EdgeInsets.symmetric(horizontal: isTablet ? 4 : 8, vertical: 2),
      child: Card(
        elevation: isSelected ? 4 : 1,
        color: isSelected
            ? themeSettings.buttonColor
            : themeSettings.cardBackgroundColor,
        child: ListTile(
          leading: Icon(
            icon,
            color: isSelected
                ? themeSettings.fontColor2
                : themeSettings.iconColor,
            size: isTablet ? 20 : 24,
          ),
          title: Text(
            title,
            style: TextStyle(
              fontSize: (isTablet ? 14 : 16) * themeSettings.fontSizeScale,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected
                  ? themeSettings.fontColor2
                  : themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
          onTap: () {
            setState(() {
              _tabController.animateTo(index);
            });
          },
        ),
      ),
    );
  }

  Widget _buildBasicTab(
    ThemeSettings themeSettings, {
    bool isMobile = false,
    bool isTablet = false,
  }) {
    return Container(
      color: themeSettings.backgroundColor,
      child: WebUIUtils.isWeb
          ? _buildWebTabContent(
              themeSettings,
              [
                _buildListItem(
                  themeSettings,
                  'アプリについて',
                  'アプリの基本的な使い方を説明',
                  Icons.play_arrow,
                  () => _showBasicOperationDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'データの保存と同期',
                  'データの自動保存とクラウド同期',
                  Icons.sync,
                  () => _showDataSyncDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
              ],
              '基本',
              'アプリの基本的な使い方について説明します',
              isMobile,
              isTablet,
            )
          : ListView(
              padding: EdgeInsets.all(16),
              children: [
                _buildListItem(
                  themeSettings,
                  'アプリについて',
                  'アプリの基本的な使い方を説明',
                  Icons.play_arrow,
                  () => _showBasicOperationDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'データの保存と同期',
                  'データの自動保存とクラウド同期',
                  Icons.sync,
                  () => _showDataSyncDetail(context, themeSettings),
                ),
              ],
            ),
    );
  }

  Widget _buildWebTabContent(
    ThemeSettings themeSettings,
    List<Widget> items, [
    String title = '基本',
    String description = 'アプリの基本的な使い方について説明します',
    bool isMobile = false,
    bool isTablet = false,
  ]) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(
        isMobile
            ? 12
            : isTablet
            ? 16
            : 24,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // アイテムグリッド
          isMobile
              ? Column(children: items)
              : Wrap(
                  spacing: isTablet ? 12 : 16,
                  runSpacing: isTablet ? 12 : 16,
                  children: items
                      .map(
                        (item) =>
                            SizedBox(width: isTablet ? 300 : 360, child: item),
                      )
                      .toList(),
                ),
        ],
      ),
    );
  }

  Widget _buildRoastingTab(
    ThemeSettings themeSettings, {
    bool isMobile = false,
    bool isTablet = false,
  }) {
    return Container(
      color: themeSettings.backgroundColor,
      child: WebUIUtils.isWeb
          ? _buildWebTabContent(
              themeSettings,
              [
                _buildListItem(
                  themeSettings,
                  '焙煎タイマーとは',
                  '焙煎作業の時間管理をサポート',
                  Icons.timer,
                  () => _showRoastingTimerDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  '焙煎記録の作成',
                  '焙煎作業の詳細を記録',
                  Icons.note_add,
                  () => _showRoastingRecordDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  '焙煎分析の使い方',
                  '豆の種類ごとの平均焙煎時間を確認',
                  Icons.query_stats,
                  () => _showRoastingAnalysisDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
              ],
              '焙煎',
              '焙煎作業に関する機能の使い方を説明します',
              isMobile,
              isTablet,
            )
          : ListView(
              padding: EdgeInsets.all(16),
              children: [
                _buildListItem(
                  themeSettings,
                  '焙煎タイマーとは',
                  '焙煎作業の時間管理をサポート',
                  Icons.timer,
                  () => _showRoastingTimerDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  '焙煎記録の作成',
                  '焙煎作業の詳細を記録',
                  Icons.note_add,
                  () => _showRoastingRecordDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  '焙煎分析の使い方',
                  '豆の種類ごとの平均焙煎時間を確認',
                  Icons.query_stats,
                  () => _showRoastingAnalysisDetail(context, themeSettings),
                ),
              ],
            ),
    );
  }

  Widget _buildManagementTab(
    ThemeSettings themeSettings, {
    bool isMobile = false,
    bool isTablet = false,
  }) {
    return Container(
      color: themeSettings.backgroundColor,
      child: WebUIUtils.isWeb
          ? _buildWebTabContent(
              themeSettings,
              [
                _buildListItem(
                  themeSettings,
                  'スケジュールの作成',
                  '作業スケジュールの管理と自動作成',
                  Icons.schedule,
                  () => _showScheduleDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'TODOリストの使い方',
                  'タスク管理と通知機能',
                  Icons.checklist,
                  () => _showTodoDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'ドリップカウンターの使い方',
                  'ドリップパックのカウントと記録',
                  Icons.filter_list,
                  () => _showDripCounterDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  '試飲感想記録について',
                  'コーヒーの試飲評価と記録',
                  Icons.local_cafe,
                  () => _showTastingDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  '作業状況記録の使い方',
                  '作業の進捗管理と記録',
                  Icons.work,
                  () => _showWorkProgressDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'カレンダー機能の使い方',
                  '日付別のデータ表示と管理',
                  Icons.calendar_today,
                  () => _showCalendarDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
              ],
              '管理',
              'スケジュール、TODO、記録などの管理機能について説明します',
              isMobile,
              isTablet,
            )
          : ListView(
              padding: EdgeInsets.all(16),
              children: [
                _buildListItem(
                  themeSettings,
                  'スケジュールの作成',
                  '作業スケジュールの管理と自動作成',
                  Icons.schedule,
                  () => _showScheduleDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'TODOリストの使い方',
                  'タスク管理と通知機能',
                  Icons.checklist,
                  () => _showTodoDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'ドリップカウンターの使い方',
                  'ドリップパックのカウントと記録',
                  Icons.filter_list,
                  () => _showDripCounterDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'テイスティング記録の作成',
                  'コーヒーの試飲評価と記録',
                  Icons.local_cafe,
                  () => _showTastingDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  '作業状況記録の使い方',
                  '作業の進捗管理と記録',
                  Icons.work,
                  () => _showWorkProgressDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'カレンダー機能の使い方',
                  '日付別のデータ表示と管理',
                  Icons.calendar_today,
                  () => _showCalendarDetail(context, themeSettings),
                ),
              ],
            ),
    );
  }

  Widget _buildGroupTab(
    ThemeSettings themeSettings, {
    bool isMobile = false,
    bool isTablet = false,
  }) {
    return Container(
      color: themeSettings.backgroundColor,
      child: WebUIUtils.isWeb
          ? _buildWebTabContent(
              themeSettings,
              [
                _buildListItem(
                  themeSettings,
                  'グループについて',
                  'グループ利用の基本とメリット',
                  Icons.groups,
                  () => _showGroupOverviewDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'メンバーの招待',
                  'グループにメンバーを招待する方法',
                  Icons.person_add,
                  () => _showMemberInviteDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'グループ内での共有',
                  'データをグループ内で共有する方法',
                  Icons.share,
                  () => _showGroupShareDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  '出勤退勤機能の使い方',
                  'メンバーの出勤退勤状態を管理',
                  Icons.access_time,
                  () => _showAttendanceDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  '担当表の使い方',
                  'チームの担当を自動で決める機能',
                  Icons.assignment,
                  () => _showAssignmentDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
              ],
              'グループ',
              'チームでの協力作業とデータ共有について説明します',
              isMobile,
              isTablet,
            )
          : ListView(
              padding: EdgeInsets.all(16),
              children: [
                _buildListItem(
                  themeSettings,
                  'グループについて',
                  'グループ利用の基本とメリット',
                  Icons.groups,
                  () => _showGroupOverviewDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'メンバーの招待',
                  'グループにメンバーを招待する方法',
                  Icons.person_add,
                  () => _showMemberInviteDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'グループ内での共有',
                  'データをグループ内で共有する方法',
                  Icons.share,
                  () => _showGroupShareDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  '出勤退勤機能の使い方',
                  'メンバーの出勤退勤状態を管理',
                  Icons.access_time,
                  () => _showAttendanceDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  '担当表の使い方',
                  'チームの担当を自動で決める機能',
                  Icons.assignment,
                  () => _showAssignmentDetail(context, themeSettings),
                ),
              ],
            ),
    );
  }

  Widget _buildGamificationTab(
    ThemeSettings themeSettings, {
    bool isMobile = false,
    bool isTablet = false,
  }) {
    return Container(
      color: themeSettings.backgroundColor,
      child: WebUIUtils.isWeb
          ? _buildWebTabContent(
              themeSettings,
              [
                _buildListItem(
                  themeSettings,
                  'バッジシステムとは',
                  'バッジの獲得条件と種類について',
                  Icons.emoji_events,
                  () => _showBadgeSystemDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'レベルアップシステム',
                  '経験値とレベルアップの仕組み',
                  Icons.trending_up,
                  () => _showLevelSystemDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
              ],
              'ゲーミフィケーション',
              'バッジシステムとレベルアップ機能について説明します',
              isMobile,
              isTablet,
            )
          : ListView(
              padding: EdgeInsets.all(16),
              children: [
                _buildListItem(
                  themeSettings,
                  'バッジシステムとは',
                  'バッジの獲得条件と種類について',
                  Icons.emoji_events,
                  () => _showBadgeSystemDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'レベルアップシステム',
                  '経験値とレベルアップの仕組み',
                  Icons.trending_up,
                  () => _showLevelSystemDetail(context, themeSettings),
                ),
              ],
            ),
    );
  }

  Widget _buildSettingsTab(
    ThemeSettings themeSettings, {
    bool isMobile = false,
    bool isTablet = false,
  }) {
    return Container(
      color: themeSettings.backgroundColor,
      child: WebUIUtils.isWeb
          ? _buildWebTabContent(
              themeSettings,
              [
                _buildListItem(
                  themeSettings,
                  'テーマ設定の変更',
                  'アプリの見た目をカスタマイズ',
                  Icons.palette,
                  () => _showThemeSettingsDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'サウンド設定',
                  'アラーム音と音量の調整',
                  Icons.volume_up,
                  () => _showSoundSettingsDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'セキュリティ設定',
                  'パスコードロックと生体認証',
                  Icons.security,
                  () => _showSecuritySettingsDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
                _buildListItem(
                  themeSettings,
                  'フィードバック送信',
                  '要望やバグ報告を送信',
                  Icons.feedback,
                  () => _showFeedbackDetail(context, themeSettings),
                  isMobile: isMobile,
                  isTablet: isTablet,
                ),
              ],
              '設定',
              'アプリの設定とカスタマイズについて説明します',
              isMobile,
              isTablet,
            )
          : ListView(
              padding: EdgeInsets.all(16),
              children: [
                _buildListItem(
                  themeSettings,
                  'テーマ設定の変更',
                  'アプリの見た目をカスタマイズ',
                  Icons.palette,
                  () => _showThemeSettingsDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'サウンド設定',
                  'アラーム音と音量の調整',
                  Icons.volume_up,
                  () => _showSoundSettingsDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'セキュリティ設定',
                  'パスコードロックと生体認証',
                  Icons.security,
                  () => _showSecuritySettingsDetail(context, themeSettings),
                ),
                SizedBox(height: 12),
                _buildListItem(
                  themeSettings,
                  'フィードバック送信',
                  '要望やバグ報告を送信',
                  Icons.feedback,
                  () => _showFeedbackDetail(context, themeSettings),
                ),
              ],
            ),
    );
  }

  Widget _buildListItem(
    ThemeSettings themeSettings,
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap, {
    bool isMobile = false,
    bool isTablet = false,
  }) {
    return Card(
      elevation: 2,
      color: themeSettings.cardBackgroundColor,
      child: ListTile(
        leading: Icon(
          icon,
          color: themeSettings.iconColor,
          size: isMobile
              ? 24
              : isTablet
              ? 26
              : 28,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize:
                (isMobile
                    ? 16
                    : isTablet
                    ? 17
                    : 18) *
                themeSettings.fontSizeScale,
            fontWeight: FontWeight.bold,
            color: themeSettings.fontColor1,
            fontFamily: themeSettings.fontFamily,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize:
                (isMobile
                    ? 12
                    : isTablet
                    ? 13
                    : 14) *
                themeSettings.fontSizeScale,
            color: themeSettings.fontColor1.withValues(alpha: 0.6),
            fontFamily: themeSettings.fontFamily,
          ),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios,
          color: themeSettings.fontColor1.withValues(alpha: 0.4),
          size: isMobile
              ? 16
              : isTablet
              ? 18
              : 20,
        ),
        onTap: onTap,
      ),
    );
  }

  void _showRoastingTimerDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: '焙煎タイマーとは',
          content: [
            '焙煎に慣れていなくても、適切なタイミングで作業できるよう時間の管理をサポートするのが焙煎タイマーです。',
            '',
            '【予熱タイマー】',
            '• 焙煎機の予熱開始から完了までをカウントします',
            '• 30分の標準設定からスタートし、必要に応じて時間を調整できます',
            '• アラームと通知で「そろそろ豆を入れに行こう」というタイミングをお知らせします',
            '',
            '【焙煎タイマー】',
            '• 焙煎をスタートしたら、画面の開始ボタンを押すだけでタイマーがスタートします',
            '• 一時停止や再開も1タップで操作できるため、ハンドピックなどの別作業とも両立できます',
            '',
            '【おすすめ時間の活用】',
            '• 過去に同じ豆の焙煎記録があれば、自動でおすすめの時間設定が表示されます',
            '• まずは提案された時間で試し、慣れてきたら自分の好みに微調整しましょう',
            '',
            '【最初にやってみること】',
            '• まずは触れてみて、タイマーの流れを体験しておくといいでしょう',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showSoundSettingsDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'サウンド設定',
          content: [
            'サウンド設定では、焙煎タイマーや通知が鳴るタイミングをまとめて管理できます。',
            '',
            '【画面の開き方】',
            '1. ドロワーメニュー → 設定',
            '2. 「サウンド設定」を開きます',
            '',
            '【タイマー音の設定】',
            '• 「タイマー音」をオンにすると、タイマー終了時に選択した音が鳴ります',
            '• 下のリストから「デジタル時計1」など好みの音を選ぶと即時に適用されます',
            '• ▶ ボタンを押すとその音を試聴できます',
            '',
            '【通知音の設定】',
            '• 「通知音」をオンにすると、アラート通知時に音が鳴ります',
            '• リストから通知音1〜4を選んで切り替えます',
            '• ▶ ボタンで再生し、音量は端末のメディア音量に連動します',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showRoastingRecordDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: '焙煎記録の作成',
          content: [
            '焙煎のたびに情報を記録しておくと、次の焙煎がもっとスムーズに進められます。',
            '',
            '【記録の手順】',
            '1. 焙煎記録入力を開くか、アフターパージ後に入力画面を開きます',
            '2. 入力欄に[豆の種類、重さ、煎り度、焙煎時間]を入力してください',
            '3. 入力が終わったら保存を押すだけでOKです',
            '',
            '【活用のコツ】',
            '• 過去の記録を開くと、同じ豆でのおすすめ時間がタイマーに反映されます',
            '• フィルター機能で豆の種類や焙煎度ごとに履歴を振り返ることができます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showRoastingAnalysisDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: '焙煎分析の使い方',
          content: [
            '焙煎分析では、これまでに保存した焙煎記録をもとに豆の種類ごとの平均焙煎時間を一覧で確認できます。',
            '',
            '【画面の開き方】',
            '1. 焙煎タブから「焙煎分析」を選択します',
            '2. 調べたい豆の種類を選ぶと、平均焙煎時間の表が表示されます',
            '',
            '【表示される内容】',
            '• 豆の種類ごとの平均焙煎時間と件数',
            '• 最後に保存した焙煎記録の基本情報（重さ・焙煎度など）',
            '',
            '【活用のヒント】',
            '• 過去にどのくらいの時間で焙煎してきたかを振り返り、次回の設定時間の目安にできます',
            '• まだ記録が少ない豆は、焙煎記録を増やして平均時間の精度を高めましょう',
            '',
            '【注意点】',
            '• 平均時間は保存済みの焙煎記録をもとに計算されます。記録がない豆は一覧に表示されません',
            '• 1件だけの豆は平均値が固定となるため、複数回焙煎して比較することをおすすめします',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showBasicOperationDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'アプリについて',
          content: [
            'ローストプラスへようこそ。\nこのアプリは、BYSNの業務をサポートするため個人で開発された非公式アプリです。ここでは基本的なアプリの使い方をまとめています。',
            '',
            '【ローストプラスでできること】',
            '• 焙煎タイマーや、焙煎記録などを活用して、焙煎作業の効率化と記録管理ができます',
            '• 作業状況や、TODO、スケジュールをまとめて管理し、日々の業務の抜け漏れを防ぎます',
            '• グループ機能でメンバーと進捗・メモを共有し、引き継ぎや情報共有を円滑にします',
            '• ゲーム要素やバッジで習熟度を可視化し、チーム内の仕事におけるモチベーションを高められます',
            '',
            '【非公式アプリとしての注意点】',
            '• BYSNとは連携していないため、社内ポリシーに沿って利用範囲を調整してください',
            '• データは端末に自動保存され、Googleログインを行うとクラウドにもバックアップされます',
            '• アプリは継続改善中のため、更新内容はお知らせやコミュニティ告知を確認してください',
            '',
            '【アプリを起動したら】',
            '1. Googleアカウントでサインインすると、チーム共有やバックアップが有効になります',
            '2. ホーム画面のセクションから、必要な機能を選択して使い始めましょう',
            '',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showDataSyncDetail(BuildContext context, ThemeSettings themeSettings) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'データの保存と同期',
          content: [
            'ローストプラスでは、手動保存を意識しなくてもデータが守られる仕組みになっています。',
            '',
            '【自動保存の仕組み】',
            '• 記録やTODOを入力すると、その場で端末に保存されます',
            '• 入力途中でアプリを閉じても、再度開けば内容を継続できます',
            '',
            '【クラウド同期】',
            '• Googleログインを済ませると、Firebaseにバックアップが取られます',
            '• 同じアカウントで複数端末からアクセスしても同じデータを閲覧できます',
            '• 接続が不安定でも、安定したタイミングで自動的に同期されます',
            '',
            '【グループ共有】',
            '• グループに参加すると、メンバーと焙煎記録やTODOをリアルタイムで共有できます',
            '• 権限が分かれているので、誤って消してしまう心配も最小限です',
            '',
            '【覚えておきたいこと】',
            '• オフラインでも記録は残り、オンラインに戻った時点で同期されます',
            '• もし同期に失敗した場合は通知でお知らせするので、指示に従って再試行してください',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showScheduleDetail(BuildContext context, ThemeSettings themeSettings) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'スケジュールの作成',
          content: [
            'スケジュールでは、今日の業務の流れをまとめて管理できます。特に「本日のスケジュール」では、時間ごとの行動予定を手早く作成できます。',
            '',
            '【本日のスケジュールの使い方】',
            '1. 「管理」タブを開き、スケジュールを選びます',
            '2. 左側の「本日のスケジュール」で、時間ラベルと内容を自由に入力します',
            '3. 追加したいときは＋ボタンから新しい時間帯を挿入できます',
            '',
            '【ポイント】',
            '• 予定の時間ラベルは手入力で調整できるので、細かい時間割も柔軟に組めます',
            '• 各行のメモ欄には、担当作業や注意事項など自由に記入できます',
            '• 入力した内容はグループに参加しているメンバーの端末すべてに共有され、全員が同じスケジュールを確認できます',
            '',
            '【ローストスケジュール】',
            '• 右側の「ローストスケジュール」では、焙煎機を使うべき時間帯を一覧で確認できます',
            '• 各行に豆の種類や焙煎量、ロースト開始・終了の目安などを記録し、ロースト担当の作業をわかりやすくします',
            '• 本日のスケジュールと同様に、登録した内容はグループメンバー全員に共有されます',
            '',
            '【ローストスケジュールを追加する】',
            '1. 画面右下の＋ボタンを押すと、ローストスケジュール追加のダイアログが開きます',
            '2. 「時間」を設定し、必要に応じて「焙煎機オン」「アフターパージ」などのチェックを付けます',
            '3. 豆の名前や重さ、袋数、焙煎度合いなどを入力し、担当者へ共有したい情報をまとめましょう',
            '4. 入力が完了したら「保存」を押すと一覧に追加され、グループ全員の端末に反映されます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showTodoDetail(BuildContext context, ThemeSettings themeSettings) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'TODOリストの使い方',
          content: [
            'タスク管理に慣れていなくても、今日やることを忘れないようにするための機能です。',
            '',
            '【タスクを追加する】',
            '1. 「管理」タブのTODOを開きます',
            '2. 画面右上の＋をタップし、やることを入力します',
            '3. 期日や担当者が決まっていれば合わせて設定しておきましょう',
            '',
            '【完了チェック】',
            '• 作業が終わったらタスク横のチェックボックスをタップするだけです',
            '• 長押しメニューから編集や削除も簡単に行えます',
            '',
            '【通知の使い方】',
            '• 期日を入れるとリマインド通知が届きます（設定で時間調整可能）',
            '• 初期設定のままでも必要なタイミングでお知らせするので、まずはそのまま使ってみてください',
            '',
            '【最初に試す操作】',
            '• 「今日やること」を1つ登録してみて、通知が届く流れを確認しましょう',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showDripCounterDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'ドリップカウンターの使い方',
          content: [
            '作業中に梱包するドリップパックの数を数えたり、記録したいときに使います。',
            '',
            '【カウントの取り方】',
            '• 画面中央の＋ボタンをタップすると数が増え、−で減らせます',
            '• 新しい作業を始める前に一度リセットしておくと集計がしやすくなります',
            '',
            '【記録に残す】',
            '• ある程度進んだら「記録保存」を押し、豆や煎り度合いを入力して保存します',
            '• 保存した内容は記録からいつでも確認できます',
            '',
            '【集計】',
            '• 履歴画面では日付や豆の種類、煎り度合いでフィルターが可能です',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showTastingDetail(BuildContext context, ThemeSettings themeSettings) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: '試飲感想記録について',
          content: [
            '自分たちで作ったコーヒーを試飲し、その感想を残すための機能です。飲んだ味わいをグループ全体で共有できます。',
            '',
            '【一覧画面でできること】',
            '• カード形式で豆の名前と焙煎度が表示され、参加人数や総合スコアがひと目で確認できます',
            '• 各評価項目（苦味・酸味・ボディ・甘み・香り・総合）の平均値が並び、どの味が強かったかを瞬時に把握できます',
            '• 右上の削除ボタンで不要な記録を整理できます',
            '',
            '【詳細画面のポイント】',
            '• 上部に平均総合と星評価、参加件数が表示され、全体の傾向がわかります',
            '• 「みんなの感想」では共有コメントを確認でき、印象的だったポイントをチームで振り返れます',
            '• 「自分のエントリ」ではスライダーを使って苦味・酸味・ボディ・甘み・香り・総合をそれぞれ0.0〜5.0の範囲で調整し、感じた味わいを細かく記録できます',
            '',
            '【セッションを始める手順】',
            '1. 画面右下の＋ボタンを押すと新しい試飲セッションを作成できます',
            '2. 「豆の名前」を入力し、焙煎度合い（浅煎り〜深煎りなど）を選択して開始をタップします',
            '3. 参加者それぞれが詳細画面からスライダーとコメントを更新すると、平均値と感想が即座に反映されます',
            '',
            '【活用のヒント】',
            '• 試飲した日の状況や抽出レシピをメモ欄に残すと、後から同じ味を再現しやすくなります',
            '• グループで共有すれば、他メンバーの評価を参考に焙煎や抽出の改善点を見つけられます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showWorkProgressDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: '作業状況記録の使い方',
          content: [
            '豆ごとに作業段階を記録し、カンバン形式で進行状況を整理できる機能です。焙煎前後のハンドピックやミル・梱包など、細かなステップを一覧で追跡できます。',
            '',
            '【ボードの見かた】',
            '• 列は作業段階（例：ハンドピック、ロースト、アフターピック、梱包など）を表し、カードには豆の名前が表示されます',
            '• カード内には最新の作業段階やメモがまとまり、同じ豆の履歴を一箇所で確認できます',
            '',
            '【記録の追加手順】',
            '1. 作業状況記録のボード右下にある＋ボタンを押します',
            '2. 「豆の名前」を入力し、現在の作業段階をプルダウンから選びます',
            '3. 必要に応じてメモを残し、作成をタップするとボードにカードが並びます',
            '',
            '【進捗の更新】',
            '• カード右上のメニューから編集すると、作業段階を別の列へ移したりメモを追記できます',
            '• 仕掛かり中の豆が増えてきたら、段階ごとに状態を整理して次の担当へ引き継ぎやすくしましょう',
            '',
            '【共有のポイント】',
            '• 同じ豆のカードを参照すれば、いつ・誰が・どこまで進めたかが一目でわかります',
            '• 未着手・進行中・完了を見比べることで、ボトルネックの段階を素早く把握できます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showMemberInviteDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'メンバーの招待',
          content: [
            'グループにメンバーを追加すると、焙煎記録やスケジュールを同じチームで共有できます。',
            '',
            '【招待するには】',
            '• グループ詳細画面の「招待コードを表示」を開いてください',
            '• コード確認したらメンバーに共有し、入力して参加してもらいましょう',
            '',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showGroupShareDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'グループ内での共有',
          content: [
            'グループでは、焙煎記録やTODOなどが自動的に共有されます。初めてでも難しい設定は不要です。',
            '',
            '【共有される主な内容】',
            '• 焙煎記録・テイスティング結果・TODO・スケジュールなど、業務に必要な項目',
            '• 共有された情報は全員の画面で同じように表示されます',
            '',
            '【覚えておきたいポイント】',
            '• 編集や削除をすると全員に反映されるため、変更前に必要なメンバーへ共有事項を伝えると安心です',
            '• 権限のあるメンバーは共有範囲を後から調整できます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showGroupOverviewDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'グループについて',
          content: [
            'ローストプラスは「グループ」での利用を前提に設計されています。メンバーを招待して同じ記録を共有しながら使うことで、日々の作業がチームで進めやすくなります。',
            '',
            '【グループでできること】',
            '• 焙煎記録や作業メモ、スケジュールなどのデータをメンバー全員でリアルタイム共有できます',
            '• 現在の進捗やスケジュールの状況を互いに把握できます',
            '',
            '【参加するメリット】',
            '• グループの記録に参加すると、活動時間や焙煎数などの統計に貢献できます',
            '• グループレベルやバッジは全員の行動で経験値が加算され、チーム全体の達成感につながります',
            '',
            '【まずはグループに参加しよう】',
            '• 既にあるグループに招待してもらうか、管理者として新しいグループを作成してメンバーを招待しましょう',
            '• 参加後は作業状況記録やカレンダーなどの情報が自動的に共有され、チームの動きをひと目で確認できます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showThemeSettingsDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'テーマ設定の変更',
          content: [
            'テーマ設定はアプリの見た目をカラフルにしたり、おしゃれに整えるための機能です。気分やシーンに合わせて好きな雰囲気を作りましょう。',
            '',
            '【プリセットテーマを楽しむ】',
            '1. 設定画面を開き、「テーマ設定」を選びます',
            '2. 気になるプリセットテーマをタップすると、すぐに画面全体のカラーが切り替わります',
            '3. いつでも違うテーマに切り替えて気分転換できます',
            '',
            '【カスタムテーマでこだわる】',
            '1. 「カスタムテーマ」を開きます',
            '2. 各色パレットをタップして、自分好みのカラーを選びます',
            '3. プレビューを見ながら組み合わせを調整し、「保存」で反映します',
            '',
            '【ヒント】',
            '• 明るさとコントラストのバランスを意識すると読みやすさが保てます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showSecuritySettingsDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'セキュリティ設定',
          content: [
            'セキュリティ設定では、アプリにパスコードロックをかけて第三者からの操作を防げます。共有端末での利用や、記録をしっかり守りたいときに活用してください。',
            '',
            '【パスコードロックの設定】',
            '1. 設定画面を開き、「セキュリティ設定」を選びます',
            '2. 「パスコードロックを設定」をタップし、4桁のコードを登録します',
            '3. 次回以降はアプリ起動時やバックグラウンド復帰時にコード入力が求められます',
            '',
            '【自動ロックの活用】',
            '• 一定時間操作がないと自動的にロックするタイマーを設定できます',
            '• 共有端末では短めの時間に設定しておくと安心です',
            '',
            '【パスコード管理のポイント】',
            '• 忘れてしまった場合は再設定が必要になります。定期的な見直しをおすすめします',
            '• 他サービスと同じコードの使い回しは避け、安全な場所に控えを残しておきましょう',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showAttendanceDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: '出勤退勤機能の使い方',
          content: [
            '担当表では、誰が勤務中かを全員が同じ情報で確認できます。',
            '',
            '【出勤を記録する】',
            '• 担当表タブを開き、自分のカードをタップすると出勤/退勤が切り替わります',
            '• 出勤中は白いカード、退勤すると赤色のカードに変わります',
            '',
            '【共有と同期】',
            '• 状態はリアルタイムにクラウドへ同期され、全メンバーの画面に反映されます',
            '• 間違えて切り替えた場合も同じ手順で戻せるので安心です',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showCalendarDetail(BuildContext context, ThemeSettings themeSettings) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'カレンダー機能の使い方',
          content: [
            'カレンダーは、日付ごとにスケジュールや担当の履歴を振り返るためのページです。豆の準備から焙煎、担当者の割り当てまで、その日の流れを一画面で確認できます。',
            '',
            '【日付の選び方】',
            '1. カレンダータブを開くと、月間ビューと直近の一週間が表示されます',
            '2. 見たい日付をタップすると、下部のカードがその日の情報に切り替わります',
            '3. 週表示を横にスワイプすると、前後の日付へ素早く移動できます',
            '',
            '【本日のスケジュール】',
            '• 左側のカードには時刻ごとの予定が並びます。朝礼やハンドピック、休憩など、当日の進行を一目で把握できます',
            '• 時刻ラベルと内容は自由に入力できるため、細かな時間割や注意事項を柔軟に記録できます',
            '',
            '【ローストスケジュール】',
            '• 中央のカードでは、焙煎機の使用予定を一覧管理できます。豆の種類や量、チェック項目（焙煎機オン／アフターパージなど）を確認しましょう',
            '• 画面右下の＋ボタンから新しいロースト予定を追加できます。時間と豆情報を入力し、保存すると全メンバーに共有されます',
            '',
            '【担当】',
            '• 右側のカードにはその日の担当者が表示されます。未設定の場合はメッセージが表示され、担当アサイン漏れに気付けます',
            '• 担当者が決まったタイミングで更新しておくと、カレンダーから誰がどの作業を受け持ったか振り返りやすくなります',
            '',
            '【活用のヒント】',
            '• 過去の日付を辿れば、スケジュールと担当の履歴から作業の偏りや改善ポイントを見つけられます',
            '• 今日の予定とロースト計画を併せて確認し、必要な準備や引き継ぎを早めに判断しましょう',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showAssignmentDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: '担当表の使い方',
          content: [
            '毎日の役割を公平に割り振りたいときに使う機能です。',
            '',
            '【準備】',
            '• 担当表タブを開き、メンバーと作業ラベルを登録します',
            '• グループ全員で使う場合は、まず全員がアプリにログインしておきましょう',
            '',
            '【担当を決める】',
            '• 「担当を決める」ボタンを押すと、出勤中のメンバーから自動的に担当が割り当てられます',
            '• 過去の履歴を考慮して偏りが出ないよう調整されますが、必要なら手動で変更も可能です',
            '',
            '【履歴と共有】',
            '• 担当履歴から過去の担当状況を振り返れます',
            '• グループに参加していれば、変更内容は全員にリアルタイムで共有されます',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showBadgeSystemDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'バッジシステムとは',
          content: [
            'アプリの操作に慣れてくると、作業内容に応じたバッジが手に入ります。ゲーム感覚で進捗が確認できる仕組みです。',
            '',
            '【バッジの見方】',
            '• ゲームタブの「バッジ一覧」を開くと、達成済みと未達成のバッジが一覧表示されます',
            '• 未達成のバッジには進捗率が表示され、次に何をすれば良いかがわかります',
            '',
            '【獲得の流れ】',
            '• 出勤日数や焙煎時間、ドリップ数など日常の作業がそのまま条件になります',
            '• 作業を積み重ねていくと、節目ごとに新しいバッジが自動的に解放されます',
            '',
            '【はじめの一歩】',
            '• まずは日々の記録を残すだけでOKです。最初のバッジが手に入ると操作の自信にもつながります',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showLevelSystemDetail(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'レベルアップシステム',
          content: [
            'グループで活動すると経験値が貯まり、レベルが上がっていきます。大まかな進捗をゲーム感覚で把握できる仕組みです。',
            '',
            '【経験値の貯め方】',
            '• 出勤登録や焙煎記録、ドリップ数の登録など、日常業務を続けるだけで徐々に増えていきます',
            '• 特別な操作をしなくても、いつもの作業が自然と経験値になります',
            '',
            '【レベルを見るには】',
            '• ゲームタブを開くと、現在のレベルと次のレベルまでの目安が表示されます',
            '• 進捗バーを確認して、どの作業が経験値に繋がっているかをチェックしましょう',
            '',
            '【楽しみ方】',
            '• メンバーと共有しながらレベルを確認したりすると、日々の作業が楽しくなります',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }

  void _showFeedbackDetail(BuildContext context, ThemeSettings themeSettings) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => _DetailPage(
          title: 'フィードバック送信',
          content: [
            '「こうだったら便利なのに」「ここがうまく動かない」など、気づいたことを気軽に送れる窓口です。',
            '',
            '【送信のしかた】',
            '1. 設定画面から「フィードバック送信」を選びます',
            '2. 用件に合うカテゴリを選び、内容を入力して送信してください',
            '',
            '【書くときのヒント】',
            '• どの画面で、どんな操作をしたかを書いていただけると助かります',
            '• 時間があれば再現手順やスクリーンショットも添えると原因調査がスムーズです',
            '',
            '【返信について】',
            '• 個別の回答をお約束するものではありませんが、すべての声に目を通して改善に活かしています',
          ],
          themeSettings: themeSettings,
        ),
      ),
    );
  }
}
