import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../models/theme_settings.dart';
import '../../models/work_progress_models.dart';
import '../../services/assignment_firestore_service.dart';
import '../../services/drip_counter_firestore_service.dart';
import '../../services/work_progress_firestore_service.dart';
import '../../services/roast_schedule_memo_service.dart';
import '../../models/roast_schedule_models.dart';
import '../../models/group_provider.dart';
import '../../services/group_data_sync_service.dart';
import '../../widgets/bean_name_with_sticker.dart';
import '../../widgets/lottie_animation_widget.dart';

class CalendarPage extends StatefulWidget {
  final DateTime? initialDate;

  const CalendarPage({super.key, this.initialDate});

  @override
  State<CalendarPage> createState() => _CalendarPageState();
}

class _CalendarPageState extends State<CalendarPage> {
  late DateTime _selectedDate;
  late DateTime _focusedDate;

  // データ状態
  Map<String, dynamic>? _todaySchedule;
  List<RoastScheduleMemo> _roastScheduleMemos = [];
  Map<String, dynamic>? _assignmentHistoryWithLabels;
  List<Map<String, dynamic>> _dripPackRecords = [];
  List<WorkProgress> _workProgressRecords = [];

  bool _isLoading = false;

  // グループデータ監視用
  StreamSubscription<Map<String, dynamic>?>? _groupScheduleSubscription;

  // 土日判定
  bool _isWeekend(DateTime date) {
    return date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
  }

  // 直近の平日を取得（土日の場合は直前の金曜日を返す）
  DateTime _getRecentWeekday(DateTime date) {
    if (date.weekday == DateTime.saturday) {
      return date.subtract(Duration(days: 1)); // 土曜→金曜
    } else if (date.weekday == DateTime.sunday) {
      return date.subtract(Duration(days: 2)); // 日曜→金曜
    }
    return date;
  }

  // 過去N営業日分の日付リストを取得（最新の営業日を含む）
  List<DateTime> _getRecentWeekdays(int count) {
    final List<DateTime> weekdays = [];
    DateTime current = _getRecentWeekday(DateTime.now());

    while (weekdays.length < count) {
      weekdays.add(current);
      current = current.subtract(Duration(days: 1));
      // 土日をスキップ
      while (_isWeekend(current)) {
        current = current.subtract(Duration(days: 1));
      }
    }

    return weekdays.reversed.toList(); // 古い順に並べ替え
  }

  @override
  void initState() {
    super.initState();
    final initialDate = widget.initialDate ?? DateTime.now();
    _selectedDate = _getRecentWeekday(initialDate);
    _focusedDate = _getRecentWeekday(initialDate);

    // 初期データ読み込みを遅延実行
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadSelectedDateData();
        _setupGroupScheduleListener();
      }
    });
  }

  @override
  void dispose() {
    _groupScheduleSubscription?.cancel();
    super.dispose();
  }

  // グループスケジュールの変更を監視
  void _setupGroupScheduleListener() {
    try {
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.groups.isNotEmpty) {
        final group = groupProvider.groups.first;
        debugPrint('CalendarPage: グループスケジュールリスナーを設定: ${group.id}');

        _groupScheduleSubscription =
            GroupDataSyncService.watchGroupTodaySchedule(group.id).listen((
              scheduleData,
            ) {
              if (!mounted) return;

              debugPrint('CalendarPage: グループスケジュール変更を検知: $scheduleData');

              // 今日の日付の場合のみ更新
              final today = DateTime.now();
              final todayKey = DateFormat('yyyy-MM-dd').format(today);
              final selectedKey = DateFormat(
                'yyyy-MM-dd',
              ).format(_selectedDate);

              if (selectedKey == todayKey) {
                setState(() {
                  _todaySchedule = scheduleData;
                });
                debugPrint('CalendarPage: 本日のスケジュールを更新しました');
              }
            });
      }
    } catch (e) {
      debugPrint('CalendarPage: グループスケジュールリスナー設定エラー: $e');
    }
  }

  Future<void> _loadSelectedDateData() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final dateKey = DateFormat('yyyy-MM-dd').format(_selectedDate);

      // データを順次読み込み（並行実行を避ける）
      await _loadTodaySchedule(dateKey);
      if (!mounted) return;

      await _loadRoastScheduleMemos(_selectedDate);
      if (!mounted) return;

      await _loadAssignmentHistory(dateKey);
      if (!mounted) return;

      await _loadDripPackRecords(_selectedDate);
      if (!mounted) return;

      await _loadWorkProgressRecords(_selectedDate);
    } catch (e) {
      // カレンダーデータ読み込みエラー
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loadTodaySchedule(String dateKey) async {
    if (!mounted) return;

    try {
      // 指定した日付のスケジュールを取得するためのカスタム関数を作成
      final schedule = await _loadScheduleForDate(dateKey);
      if (mounted) {
        setState(() {
          _todaySchedule = schedule;
        });
      }
    } catch (e) {
      // 本日のスケジュール読み込みエラー
    }
  }

  Future<void> _loadRoastScheduleMemos(DateTime date) async {
    if (!mounted) return;

    try {
      // グループプロバイダーを取得
      final groupProvider = context.read<GroupProvider>();
      List<RoastScheduleMemo> allMemos = [];

      // 指定した日付のローストスケジュールメモを取得
      if (groupProvider.groups.isNotEmpty) {
        allMemos = await RoastScheduleMemoService.getGroupMemosForDate(
          groupProvider.groups.first.id,
          date,
        );
      } else {
        allMemos = await RoastScheduleMemoService.getUserMemosForDate(date);
      }

      final filteredMemos = allMemos;

      // 記録順（作成順）でソート - ローストスケジュールで設定した順番を保持
      filteredMemos.sort((a, b) {
        return a.createdAt.compareTo(b.createdAt);
      });

      if (mounted) {
        setState(() {
          _roastScheduleMemos = filteredMemos;
        });
        // ローストスケジュールメモを表示
      }
    } catch (e) {
      // ローストスケジュールメモ読み込みエラー
    }
  }

  // タスクの説明を取得するヘルパーメソッド
  String _getTaskDescription(RoastScheduleMemo memo) {
    if (memo.isRoasterOn) {
      return '焙煎機オン';
    } else if (memo.isAfterPurge) {
      return 'アフターパージ';
    } else if (memo.beanName != null && memo.beanName!.isNotEmpty) {
      return memo.beanName!;
    } else {
      return '未設定';
    }
  }

  // タスクのアイコンを取得するヘルパーメソッド
  IconData _getTaskIcon(RoastScheduleMemo memo) {
    if (memo.isRoasterOn) {
      return Icons.local_fire_department;
    } else if (memo.isAfterPurge) {
      return Icons.ac_unit;
    } else {
      return Icons.coffee;
    }
  }

  // タスクの色を取得するヘルパーメソッド
  Color _getTaskColor(RoastScheduleMemo memo, ThemeSettings themeSettings) {
    if (memo.isRoasterOn) {
      return themeSettings.iconColor;
    } else if (memo.isAfterPurge) {
      return themeSettings.settingsColor;
    } else {
      return themeSettings.iconColor;
    }
  }

  Future<void> _loadAssignmentHistory(String dateKey) async {
    if (!mounted) return;

    try {
      final history =
          await AssignmentFirestoreService.loadAssignmentHistoryWithLabels(
            dateKey,
          );
      if (mounted) {
        setState(() {
          _assignmentHistoryWithLabels = history;
        });
      }
    } catch (e) {
      // 担当履歴読み込みエラー
    }
  }

  Future<void> _loadDripPackRecords(DateTime date) async {
    if (!mounted) return;

    try {
      final records =
          await DripCounterFirestoreService.loadDripPackRecordsAddedOnDate(
            date: date,
          );
      if (mounted) {
        setState(() {
          _dripPackRecords = records;
        });
      }
    } catch (e) {
      // ドリップパック記録読み込みエラー
    }
  }

  Future<void> _loadWorkProgressRecords(DateTime date) async {
    if (!mounted) return;

    try {
      final records =
          await WorkProgressFirestoreService.getWorkProgressRecordsByDate(date);
      if (mounted) {
        setState(() {
          _workProgressRecords = records;
        });
      }
    } catch (e) {
      // 作業状況記録読み込みエラー
    }
  }

  // 指定した日付のスケジュールを取得
  Future<Map<String, dynamic>?> _loadScheduleForDate(String dateKey) async {
    try {
      final firestore = FirebaseFirestore.instance;
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) return null;

      // グループ参加時はグループデータを優先的に読み込み
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.groups.isNotEmpty) {
        final group = groupProvider.groups.first;
        debugPrint('CalendarPage: グループ参加中 - グループデータを優先読み込み: $dateKey');

        try {
          // グループデータから本日のスケジュールを取得
          final groupScheduleData =
              await GroupDataSyncService.getGroupTodaySchedule(group.id);
          if (groupScheduleData != null) {
            debugPrint('CalendarPage: グループからスケジュールデータを取得: $groupScheduleData');
            return groupScheduleData;
          }
        } catch (e) {
          debugPrint('CalendarPage: グループデータ読み込みエラー: $e');
        }
      }

      // グループデータが読み込めない場合は個人データを読み込み
      debugPrint('CalendarPage: 個人データからスケジュールを読み込み: $dateKey');
      final doc = await firestore
          .collection('users')
          .doc(user.uid)
          .collection('todaySchedule')
          .doc(dateKey)
          .get();

      return doc.exists ? doc.data() : null;
    } catch (e) {
      debugPrint('CalendarPage: スケジュール読み込みエラー: $e');
      return null;
    }
  }

  void _onDateSelected(DateTime selectedDate, DateTime focusedDate) {
    if (!mounted) return;

    setState(() {
      _selectedDate = selectedDate;
      _focusedDate = focusedDate;
    });

    // データ読み込みを遅延実行
    Future.delayed(Duration(milliseconds: 100), () {
      if (mounted) {
        _loadSelectedDateData();
        // 日付変更時にリスナーを再設定（今日の日付の場合のみ）
        final today = DateTime.now();
        final todayKey = DateFormat('yyyy-MM-dd').format(today);
        final selectedKey = DateFormat('yyyy-MM-dd').format(selectedDate);

        if (selectedKey == todayKey) {
          _setupGroupScheduleListener();
        } else {
          // 今日以外の日付の場合はリスナーを停止
          _groupScheduleSubscription?.cancel();
          _groupScheduleSubscription = null;
        }
      }
    });
  }

  void _showCalendarDialog(BuildContext context, ThemeSettings themeSettings) {
    final fontFamily = themeSettings.fontFamily;
    final dialogBaseTextStyle = TextStyle(fontFamily: fontFamily);

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return DefaultTextStyle.merge(
          style: dialogBaseTextStyle,
          child: Dialog(
            backgroundColor: themeSettings.cardBackgroundColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: Container(
              padding: EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '日付を選択',
                        style: dialogBaseTextStyle.copyWith(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: themeSettings.fontColor1,
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.close, color: themeSettings.iconColor),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: themeSettings.fontColor1.withValues(
                            alpha: 0.12,
                          ),
                          blurRadius: 8,
                          offset: Offset(0, 2),
                        ),
                      ],
                    ),
                    child: TableCalendar(
                      firstDay: DateTime(2020),
                      lastDay: DateTime(2030),
                      focusedDay: _focusedDate,
                      selectedDayPredicate: (day) =>
                          isSameDay(_selectedDate, day),
                      enabledDayPredicate: (day) => !_isWeekend(day),
                      onDaySelected: (selectedDay, focusedDay) {
                        _onDateSelected(selectedDay, focusedDay);
                        Navigator.of(context).pop();
                      },
                      onPageChanged: (focusedDay) {
                        setState(() {
                          _focusedDate = focusedDay;
                        });
                      },
                      calendarFormat: CalendarFormat.month,
                      startingDayOfWeek: StartingDayOfWeek.monday,
                      headerStyle: HeaderStyle(
                        formatButtonVisible: false,
                        titleCentered: true,
                        titleTextStyle: dialogBaseTextStyle.copyWith(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: themeSettings.fontColor1,
                        ),
                        leftChevronIcon: Icon(
                          Icons.chevron_left,
                          color: themeSettings.iconColor,
                        ),
                        rightChevronIcon: Icon(
                          Icons.chevron_right,
                          color: themeSettings.iconColor,
                        ),
                      ),
                      daysOfWeekStyle: DaysOfWeekStyle(
                        weekdayStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor1,
                          fontWeight: FontWeight.bold,
                        ),
                        weekendStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor1,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      calendarStyle: CalendarStyle(
                        outsideDaysVisible: false,
                        weekendTextStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor1.withValues(
                            alpha: 0.3,
                          ),
                          decoration: TextDecoration.lineThrough,
                        ),
                        holidayTextStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor1,
                        ),
                        defaultTextStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor1,
                        ),
                        disabledTextStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor1.withValues(
                            alpha: 0.3,
                          ),
                          decoration: TextDecoration.lineThrough,
                        ),
                        selectedDecoration: BoxDecoration(
                          color: themeSettings.buttonColor,
                          shape: BoxShape.circle,
                        ),
                        selectedTextStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor2,
                          fontWeight: FontWeight.bold,
                        ),
                        todayDecoration: BoxDecoration(
                          color: themeSettings.buttonColor.withValues(
                            alpha: 0.3,
                          ),
                          shape: BoxShape.circle,
                        ),
                        todayTextStyle: dialogBaseTextStyle.copyWith(
                          color: themeSettings.fontColor1,
                          fontWeight: FontWeight.bold,
                        ),
                        defaultDecoration: BoxDecoration(
                          shape: BoxShape.circle,
                        ),
                        weekendDecoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: themeSettings.fontColor1.withValues(
                            alpha: 0.1,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final fontFamily = themeSettings.fontFamily;
    final baseTextStyle = TextStyle(fontFamily: fontFamily);
    final theme = Theme.of(context);

    return Theme(
      data: theme.copyWith(
        textTheme: theme.textTheme.apply(fontFamily: fontFamily),
        cardColor: themeSettings.cardBackgroundColor,
      ),
      child: DefaultTextStyle.merge(
        style: baseTextStyle,
        child: Scaffold(
          appBar: AppBar(
            title: Text(
              'カレンダー',
              style: baseTextStyle.copyWith(
                fontSize: (20 * themeSettings.fontSizeScale).clamp(16.0, 28.0),
              ),
            ),
            backgroundColor: themeSettings.appBarColor,
            foregroundColor: themeSettings.appBarTextColor,
            actions: [
              IconButton(
                icon: Icon(Icons.calendar_month),
                onPressed: () {
                  _showCalendarDialog(context, themeSettings);
                },
              ),
            ],
          ),
          body: kIsWeb
              ? _buildWebLayout(themeSettings)
              : SafeArea(child: _buildMobileLayout(themeSettings)),
        ),
      ),
    );
  }

  Widget _buildWebLayout(ThemeSettings themeSettings) {
    final dateFormatter = DateFormat('yyyy年M月d日 (E)', 'ja_JP');

    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              // 日付選択部分（中央配置）
              _buildWebDateSelector(themeSettings, dateFormatter),
              SizedBox(height: 32),

              // データ表示部分（3列レイアウト）
              _isLoading
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const LoadingAnimationWidget(),
                          SizedBox(height: 16),
                          Text(
                            'Loading...',
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    )
                  : _todaySchedule == null &&
                        _assignmentHistoryWithLabels == null &&
                        _dripPackRecords.isEmpty &&
                        _workProgressRecords.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.event_busy,
                            size: 64,
                            color: themeSettings.iconColor.withValues(
                              alpha: 0.5,
                            ),
                          ),
                          SizedBox(height: 16),
                          Text(
                            'この日のデータはありません',
                            style: TextStyle(
                              color: themeSettings.fontColor1.withValues(
                                alpha: 0.6,
                              ),
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    )
                  : _buildWebDataLayout(themeSettings),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWebDateSelector(
    ThemeSettings themeSettings,
    DateFormat dateFormatter,
  ) {
    // 画面幅を取得してレスポンシブ対応
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768; // 768px未満をスマホ解像度とする

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: themeSettings.cardBackgroundColor,
      child: Padding(
        padding: EdgeInsets.all(isMobile ? 16 : 24), // スマホではパディングを小さく
        child: Column(
          children: [
            // 選択された日付の表示
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.calendar_today,
                  color: themeSettings.iconColor,
                  size: isMobile ? 20 : 24, // スマホではアイコンサイズを小さく
                ),
                SizedBox(width: isMobile ? 8 : 12), // スマホでは間隔を狭く
                Flexible(
                  // テキストが長い場合の対応
                  child: Text(
                    dateFormatter.format(_selectedDate),
                    style: TextStyle(
                      fontSize: isMobile ? 18 : 22, // スマホではフォントサイズを小さく
                      fontWeight: FontWeight.bold,
                      color: themeSettings.fontColor1,
                    ),
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            SizedBox(height: isMobile ? 16 : 24), // スマホでは間隔を狭く
            // 日付選択ボタン（直近の平日7営業日を表示）
            Wrap(
              alignment: WrapAlignment.center,
              spacing: isMobile ? 12 : 28,
              runSpacing: isMobile ? 12 : 16,
              children: _getRecentWeekdays(7).map((date) {
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: isMobile ? 0 : 4),
                  child: _buildWeekdayDateButton(
                    context,
                    date,
                    themeSettings,
                    isMobile: isMobile,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWebDataLayout(ThemeSettings themeSettings) {
    // 画面幅を取得してレスポンシブ対応
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768; // 768px未満をスマホ解像度とする

    if (isMobile) {
      // スマホ解像度では1列表示
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_todaySchedule != null) _buildTodayScheduleSection(themeSettings),
          if (_todaySchedule != null) SizedBox(height: 16),
          _buildRoastScheduleSection(themeSettings),
          SizedBox(height: 16),
          _buildAssignmentSection(themeSettings),
          SizedBox(height: 16),
          if (_dripPackRecords.isNotEmpty) _buildDripPackSection(themeSettings),
          if (_dripPackRecords.isNotEmpty) SizedBox(height: 16),
          if (_workProgressRecords.isNotEmpty)
            _buildWorkProgressSection(themeSettings),
        ],
      );
    } else {
      // デスクトップ解像度では3列表示
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 本日のスケジュール
          Expanded(
            child: Column(
              children: [
                if (_todaySchedule != null)
                  _buildTodayScheduleSection(themeSettings),
                if (_todaySchedule != null) SizedBox(height: 16),
                if (_dripPackRecords.isNotEmpty)
                  _buildDripPackSection(themeSettings),
                if (_dripPackRecords.isNotEmpty) SizedBox(height: 16),
                if (_workProgressRecords.isNotEmpty)
                  _buildWorkProgressSection(themeSettings),
              ],
            ),
          ),
          SizedBox(width: 16),
          // ローストスケジュール
          Expanded(
            child: Column(
              children: [_buildRoastScheduleSection(themeSettings)],
            ),
          ),
          SizedBox(width: 16),
          // 担当
          Expanded(
            child: Column(children: [_buildAssignmentSection(themeSettings)]),
          ),
        ],
      );
    }
  }

  Widget _buildMobileLayout(ThemeSettings themeSettings) {
    final dateFormatter = DateFormat('yyyy年M月d日 (E)', 'ja_JP');

    return Column(
      children: [
        // 日付選択部分
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            children: [
              // 選択された日付の表示
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.calendar_today,
                    color: themeSettings.iconColor,
                    size: 20,
                  ),
                  SizedBox(width: 8),
                  Text(
                    dateFormatter.format(_selectedDate),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: themeSettings.fontColor1,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              // 日付選択ボタン（直近の平日7営業日を表示）
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: _getRecentWeekdays(7).map((date) {
                  return _buildWeekdayDateButton(context, date, themeSettings);
                }).toList(),
              ),
            ],
          ),
        ),

        // データ表示部分
        Expanded(
          child: _isLoading
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const LoadingAnimationWidget(),
                      SizedBox(height: 16),
                      Text(
                        'Loading...',
                        style: TextStyle(
                          color: themeSettings.fontColor1,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                )
              : _todaySchedule == null &&
                    _assignmentHistoryWithLabels == null &&
                    _dripPackRecords.isEmpty &&
                    _workProgressRecords.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.event_busy,
                        size: 64,
                        color: themeSettings.iconColor.withValues(alpha: 0.5),
                      ),
                      SizedBox(height: 16),
                      Text(
                        'この日のデータはありません',
                        style: TextStyle(
                          color: themeSettings.fontColor1.withValues(
                            alpha: 0.6,
                          ),
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: EdgeInsets.fromLTRB(
                    16,
                    16,
                    16,
                    16 + MediaQuery.of(context).padding.bottom,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_todaySchedule != null)
                        _buildTodayScheduleSection(themeSettings),
                      if (_todaySchedule != null) SizedBox(height: 16),
                      _buildRoastScheduleSection(themeSettings),
                      SizedBox(height: 16),
                      _buildAssignmentSection(themeSettings),
                      SizedBox(height: 16),
                      if (_dripPackRecords.isNotEmpty)
                        _buildDripPackSection(themeSettings),
                      if (_dripPackRecords.isNotEmpty) SizedBox(height: 16),
                      if (_workProgressRecords.isNotEmpty)
                        _buildWorkProgressSection(themeSettings),
                    ],
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildTodayScheduleSection(ThemeSettings themeSettings) {
    return _buildSectionCard(
      title: '本日のスケジュール',
      icon: Icons.schedule,
      themeSettings: themeSettings,
      child: _todaySchedule != null && _todaySchedule!['labels'] != null
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ...List.generate((_todaySchedule!['labels'] as List).length, (
                  index,
                ) {
                  final label = _todaySchedule!['labels'][index];
                  final content = _todaySchedule!['contents']?[label] ?? '';
                  if (content.isNotEmpty) {
                    return Padding(
                      padding: EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: themeSettings.buttonColor.withValues(
                                alpha: 0.1,
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              label,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.buttonColor,
                              ),
                            ),
                          ),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              content,
                              style: TextStyle(
                                color: themeSettings.fontColor1,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                  return SizedBox.shrink();
                }),
                if (_todaySchedule!['labels'] == null ||
                    (_todaySchedule!['labels'] as List).isEmpty ||
                    _todaySchedule!['contents'] == null ||
                    (_todaySchedule!['contents'] as Map).isEmpty)
                  _buildEmptyScheduleMessage(themeSettings),
              ],
            )
          : _buildEmptyScheduleMessage(themeSettings),
    );
  }

  Widget _buildEmptyScheduleMessage(ThemeSettings themeSettings) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.event_busy,
            size: 48,
            color: themeSettings.iconColor.withValues(alpha: 0.5),
          ),
          SizedBox(height: 12),
          Text(
            '本日のスケジュールはありません',
            style: TextStyle(
              color: themeSettings.fontColor1.withValues(alpha: 0.6),
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'スケジュールを設定して作業を効率化しましょう',
            style: TextStyle(
              color: themeSettings.fontColor1.withValues(alpha: 0.5),
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildRoastScheduleSection(ThemeSettings themeSettings) {
    return _buildSectionCard(
      title: 'ローストスケジュール',
      icon: Icons.local_fire_department,
      themeSettings: themeSettings,
      child: _roastScheduleMemos.isNotEmpty
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: _roastScheduleMemos.map((memo) {
                return Padding(
                  padding: EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        _getTaskIcon(memo),
                        size: 16,
                        color: _getTaskColor(memo, themeSettings),
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            memo.isAfterPurge
                                ? Text(
                                    _getTaskDescription(memo),
                                    style: TextStyle(
                                      color: themeSettings.fontColor1,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  )
                                : Row(
                                    children: [
                                      Text(
                                        '${memo.time} - ',
                                        style: TextStyle(
                                          color: themeSettings.fontColor1,
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      SizedBox(width: 6),
                                      Expanded(
                                        child:
                                            memo.beanName != null &&
                                                memo.beanName!.isNotEmpty
                                            ? BeanNameWithSticker(
                                                beanName: memo.beanName!,
                                                textStyle: TextStyle(
                                                  color:
                                                      themeSettings.fontColor1,
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                stickerSize: 14,
                                              )
                                            : Text(
                                                _getTaskDescription(memo),
                                                style: TextStyle(
                                                  color:
                                                      themeSettings.fontColor1,
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                      ),
                                    ],
                                  ),
                            if (!memo.isRoasterOn &&
                                !memo.isAfterPurge &&
                                memo.weight != null &&
                                memo.quantity != null)
                              Text(
                                '${memo.weight}g × ${memo.quantity}袋',
                                style: TextStyle(
                                  color: themeSettings.fontColor1.withValues(
                                    alpha: 0.7,
                                  ),
                                  fontSize: 12,
                                ),
                              ),
                            if (!memo.isRoasterOn &&
                                !memo.isAfterPurge &&
                                memo.roastLevel != null &&
                                memo.roastLevel!.isNotEmpty)
                              Text(
                                '煎り度: ${memo.roastLevel}',
                                style: TextStyle(
                                  color: themeSettings.fontColor1.withValues(
                                    alpha: 0.7,
                                  ),
                                  fontSize: 12,
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            )
          : _buildEmptyRoastScheduleMessage(themeSettings),
    );
  }

  Widget _buildEmptyRoastScheduleMessage(ThemeSettings themeSettings) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.local_fire_department_outlined,
            size: 48,
            color: themeSettings.iconColor.withValues(alpha: 0.5),
          ),
          SizedBox(height: 12),
          Text(
            'ローストスケジュールがありません',
            style: TextStyle(
              color: themeSettings.fontColor1.withValues(alpha: 0.6),
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '焙煎作業のスケジュールを設定しましょう',
            style: TextStyle(
              color: themeSettings.fontColor1.withValues(alpha: 0.5),
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAssignmentSection(ThemeSettings themeSettings) {
    return _buildSectionCard(
      title: '担当',
      icon: Icons.group,
      themeSettings: themeSettings,
      child:
          _assignmentHistoryWithLabels != null &&
              _assignmentHistoryWithLabels!['assignments'] != null &&
              (_assignmentHistoryWithLabels!['assignments'] as List).isNotEmpty
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: (_assignmentHistoryWithLabels!['assignments'] as List)
                  .map((assignment) => assignment.toString())
                  .toList()
                  .asMap()
                  .entries
                  .map((entry) {
                    final index = entry.key;
                    final assignment = entry.value;
                    final parts = assignment.split('-');

                    if (parts.length == 2) {
                      final leftLabelsRaw =
                          _assignmentHistoryWithLabels!['leftLabels']
                              as List? ??
                          [];
                      final rightLabelsRaw =
                          _assignmentHistoryWithLabels!['rightLabels']
                              as List? ??
                          [];

                      final leftLabels = leftLabelsRaw
                          .map((label) => label.toString())
                          .toList();
                      final rightLabels = rightLabelsRaw
                          .map((label) => label.toString())
                          .toList();

                      final leftLabel = index < leftLabels.length
                          ? leftLabels[index]
                          : '';
                      final rightLabel = index < rightLabels.length
                          ? rightLabels[index]
                          : '';

                      return Padding(
                        padding: EdgeInsets.only(bottom: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.person,
                                  size: 16,
                                  color: themeSettings.iconColor,
                                ),
                                SizedBox(width: 4),
                                Text(
                                  '${parts[0]} - ${parts[1]}',
                                  style: TextStyle(
                                    color: themeSettings.fontColor1,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            if (leftLabel.isNotEmpty || rightLabel.isNotEmpty)
                              Padding(
                                padding: EdgeInsets.only(left: 20, top: 2),
                                child: Text(
                                  '${leftLabel.isNotEmpty ? leftLabel : ''}${leftLabel.isNotEmpty && rightLabel.isNotEmpty ? ' / ' : ''}${rightLabel.isNotEmpty ? rightLabel : ''}',
                                  style: TextStyle(
                                    color: themeSettings.fontColor1.withValues(
                                      alpha: 0.7,
                                    ),
                                    fontSize: 12,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }
                    return SizedBox.shrink();
                  })
                  .toList(),
            )
          : _buildEmptyAssignmentMessage(themeSettings),
    );
  }

  Widget _buildEmptyAssignmentMessage(ThemeSettings themeSettings) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.group_outlined,
            size: 48,
            color: themeSettings.iconColor.withValues(alpha: 0.5),
          ),
          SizedBox(height: 12),
          Text(
            '担当が設定されていません',
            style: TextStyle(
              color: themeSettings.fontColor1.withValues(alpha: 0.6),
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '担当表を設定して作業を効率化しましょう',
            style: TextStyle(
              color: themeSettings.fontColor1.withValues(alpha: 0.5),
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildDripPackSection(ThemeSettings themeSettings) {
    final totalCount = _dripPackRecords.fold<int>(
      0,
      (sumValue, record) => sumValue + (record['count'] as int),
    );

    return _buildSectionCard(
      title: '今日完成したドリップパック',
      icon: Icons.local_cafe,
      themeSettings: themeSettings,
      child: _dripPackRecords.isNotEmpty
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.inventory,
                      size: 16,
                      color: themeSettings.iconColor,
                    ),
                    SizedBox(width: 4),
                    Text(
                      '合計: $totalCount 袋',
                      style: TextStyle(
                        color: themeSettings.fontColor1,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 8),
                ..._dripPackRecords.map((record) {
                  return Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Row(
                      children: [
                        Icon(
                          Icons.coffee,
                          size: 16,
                          color: themeSettings.iconColor,
                        ),
                        SizedBox(width: 4),
                        Text(
                          '', // 豆名＋シール＋他情報をRowで分割表示
                          style: TextStyle(
                            color: themeSettings.fontColor1,
                            fontSize: 14,
                          ),
                        ),
                        Row(
                          children: [
                            BeanNameWithSticker(
                              beanName: record['bean'],
                              textStyle: TextStyle(
                                color: themeSettings.fontColor1,
                                fontSize: 14,
                              ),
                              stickerSize: 16,
                            ),
                            SizedBox(width: 4),
                            Text(
                              '・${record['roast']}・${record['count']}袋',
                              style: TextStyle(
                                color: themeSettings.fontColor1,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
              ],
            )
          : Text(
              '今日完成したドリップパックの記録がありません',
              style: TextStyle(
                color: themeSettings.fontColor1.withValues(alpha: 0.6),
                fontStyle: FontStyle.italic,
              ),
            ),
    );
  }

  Widget _buildWorkProgressSection(ThemeSettings themeSettings) {
    return _buildSectionCard(
      title: '作業状況記録',
      icon: Icons.work,
      themeSettings: themeSettings,
      child: _workProgressRecords.isNotEmpty
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: _workProgressRecords.map((record) {
                return Padding(
                  padding: EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.coffee,
                            size: 16,
                            color: themeSettings.iconColor,
                          ),
                          SizedBox(width: 4),
                          Text(
                            '', // 豆名＋シールをRowで表示
                            style: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          BeanNameWithSticker(
                            beanName: record.beanName,
                            textStyle: TextStyle(
                              color: themeSettings.fontColor1,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                            stickerSize: 16,
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      ...record.stageStatus.entries.map((entry) {
                        final stage = entry.key;
                        final status = entry.value;
                        final isCompleted = status == WorkStatus.after;

                        return Padding(
                          padding: EdgeInsets.only(left: 20, bottom: 2),
                          child: Row(
                            children: [
                              Icon(
                                isCompleted
                                    ? Icons.check_circle
                                    : Icons.radio_button_unchecked,
                                size: 14,
                                color: isCompleted
                                    ? themeSettings.iconColor
                                    : themeSettings.iconColor.withValues(
                                        alpha: 0.5,
                                      ),
                              ),
                              SizedBox(width: 4),
                              Text(
                                _getStageName(stage),
                                style: TextStyle(
                                  color: isCompleted
                                      ? themeSettings.fontColor1
                                      : themeSettings.fontColor1.withValues(
                                          alpha: 0.6,
                                        ),
                                  fontSize: 12,
                                  decoration: isCompleted
                                      ? TextDecoration.lineThrough
                                      : null,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                      if (record.notes != null && record.notes!.isNotEmpty)
                        Padding(
                          padding: EdgeInsets.only(left: 20, top: 4),
                          child: Text(
                            'メモ: ${record.notes}',
                            style: TextStyle(
                              color: themeSettings.fontColor1.withValues(
                                alpha: 0.7,
                              ),
                              fontSize: 11,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              }).toList(),
            )
          : Text(
              '作業状況記録がありません',
              style: TextStyle(
                color: themeSettings.fontColor1.withValues(alpha: 0.6),
                fontStyle: FontStyle.italic,
              ),
            ),
    );
  }

  String _getStageName(WorkStage stage) {
    switch (stage) {
      case WorkStage.handpick:
        return 'ハンドピック';
      case WorkStage.roast:
        return 'ロースト';
      case WorkStage.afterPick:
        return 'アフターピック';
      case WorkStage.mill:
        return 'ミル';
      case WorkStage.dripPack:
        return 'ドリップパック';
      case WorkStage.sticker:
        return 'シール貼り';
      case WorkStage.threeWayBag:
        return '三方袋';
      case WorkStage.packaging:
        return '梱包';
      case WorkStage.shipping:
        return '発送';
    }
  }

  Widget _buildWeekdayDateButton(
    BuildContext context,
    DateTime date,
    ThemeSettings themeSettings, {
    bool isMobile = false,
  }) {
    final isSelected =
        _selectedDate.year == date.year &&
        _selectedDate.month == date.month &&
        _selectedDate.day == date.day;
    final isToday =
        date.day == DateTime.now().day &&
        date.month == DateTime.now().month &&
        date.year == DateTime.now().year;

    // ラベルを動的に生成
    String label;
    if (isToday) {
      label = '今日';
    } else {
      final today = DateTime.now();
      final difference = date.difference(today).inDays;
      if (difference == -1) {
        label = '昨日';
      } else {
        label = '${-difference}日前';
      }
    }

    // 曜日表示
    final weekdayNames = ['月', '火', '水', '木', '金', '土', '日'];
    final weekdayName = weekdayNames[date.weekday - 1];

    return GestureDetector(
      onTap: () {
        if (!mounted) return;

        setState(() {
          _selectedDate = date;
          _focusedDate = date;
        });

        // データ読み込みを遅延実行
        Future.delayed(Duration(milliseconds: 100), () {
          if (mounted) {
            _loadSelectedDateData();
          }
        });
      },
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 6 : 8, // スマホではパディングを小さく
          vertical: isMobile ? 4 : 6, // スマホではパディングを小さく
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? themeSettings.buttonColor
              : (isToday
                    ? themeSettings.buttonColor.withValues(alpha: 0.3)
                    : themeSettings.cardBackgroundColor.withValues(alpha: 0.2)),
          borderRadius: BorderRadius.circular(isMobile ? 6 : 8), // スマホでは角丸を小さく
          border: Border.all(
            color: isSelected
                ? themeSettings.buttonColor
                : themeSettings.iconColor.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Text(
              date.day.toString(),
              style: TextStyle(
                color: isSelected
                    ? themeSettings.fontColor2
                    : themeSettings.fontColor1,
                fontSize: isMobile ? 14 : 16, // スマホではフォントサイズを小さく
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              weekdayName,
              style: TextStyle(
                color: isSelected
                    ? themeSettings.fontColor2
                    : themeSettings.fontColor1.withValues(alpha: 0.7),
                fontSize: isMobile ? 8 : 10,
                fontWeight: FontWeight.w500,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                color: isSelected
                    ? themeSettings.fontColor2
                    : themeSettings.fontColor1.withValues(alpha: 0.7),
                fontSize: isMobile ? 6 : 8, // スマホではフォントサイズを小さく
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required ThemeSettings themeSettings,
    required Widget child,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: themeSettings.cardBackgroundColor,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: themeSettings.buttonColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: themeSettings.buttonColor, size: 20),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: themeSettings.fontColor1,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }
}
