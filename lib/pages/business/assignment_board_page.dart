import '../settings/assignment_settings_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import 'package:intl/intl.dart';
import 'package:roastplus/pages/members/member_edit_page.dart';
import 'package:roastplus/pages/labels/label_edit_page.dart';
import 'package:roastplus/pages/history/assignment_history_page.dart';
import 'dart:math';
import '../../services/assignment_firestore_service.dart';
import '../../services/group_firestore_service.dart';
import '../../services/group_data_sync_service.dart';
import '../../services/attendance_firestore_service.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../models/group_provider.dart';
import '../../models/group_models.dart';
import '../../models/dashboard_stats_provider.dart';
import '../../models/attendance_models.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:convert';
import '../../services/user_settings_firestore_service.dart';
import '../../services/first_login_service.dart';
import '../../widgets/lottie_animation_widget.dart';
import '../../utils/web_ui_utils.dart';
import 'package:lottie/lottie.dart';

class AssignmentBoard extends StatefulWidget {
  const AssignmentBoard({super.key});

  @override
  State<AssignmentBoard> createState() => AssignmentBoardState();
}

class AssignmentBoardState extends State<AssignmentBoard> {
  late SharedPreferences prefs;
  bool _isLoading = true;
  bool _isDataInitialized = false; // データ初期化完了フラグ
  bool _isRemoteSyncCompleted = false; // リモート同期完了フラグ
  bool? _canEditAssignment; // null: 未判定, true/false: 判定済み

  List<Team> teams = [];
  List<String> leftLabels = [];
  List<String> rightLabels = [];

  bool isShuffling = false;
  bool isAssignedToday = false;
  bool isDeveloperMode = false;
  Timer? shuffleTimer;
  String? _lastShuffledDate; // 最後にシャッフルした日付（YYYY-MM-DD形式）
  Timer? _dateCheckTimer; // 日付変更を監視するタイマー

  // 出勤退勤機能用
  List<AttendanceRecord> _todayAttendance = [];

  // グループ同期用
  StreamSubscription<Map<String, dynamic>?>? _groupAssignmentSubscription;
  StreamSubscription<GroupSettings?>? _groupSettingsSubscription;
  StreamSubscription<Map<String, dynamic>?>? _groupTodayAssignmentSubscription;
  StreamSubscription<Map<String, dynamic>>? _developerModeSubscription;
  StreamSubscription<List<AttendanceRecord>>? _groupAttendanceSubscription;
  StreamSubscription<dynamic>? _displayNameSubscription;
  Timer? _autoSyncTimer;

  String? _activeGroupId;
  bool _initialLocalDataLoaded = false;
  bool _initialGroupDataLoaded = false;
  VoidCallback? _groupProviderListener;
  bool _isApplyingRemoteUpdate = false;
  int _remoteUpdateDepth = 0;

  bool get _isSyncLocked => _isApplyingRemoteUpdate || !_initialLocalDataLoaded;

  void _beginRemoteUpdate() {
    _remoteUpdateDepth++;
    _isApplyingRemoteUpdate = true;
  }

  void _endRemoteUpdate() {
    if (_remoteUpdateDepth > 0) {
      _remoteUpdateDepth--;
    }
    if (_remoteUpdateDepth == 0) {
      _isApplyingRemoteUpdate = false;
    }
  }

  /// 安全な文字列リスト変換
  List<String> _safeStringListFromDynamic(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      try {
        return data.map((item) => item?.toString() ?? '').toList();
      } catch (e) {
        debugPrint('AssignmentBoard: リスト変換エラー: $e, data: $data');
        return [];
      }
    }
    debugPrint('AssignmentBoard: 予期しないデータ型: ${data.runtimeType}, data: $data');
    return [];
  }

  /// 2つのTeamリストが等しいかチェック
  bool _areTeamsEqual(List<Team> a, List<Team> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i].id != b[i].id ||
          a[i].name != b[i].name ||
          !_areLabelsEqual(a[i].members, b[i].members)) {
        return false;
      }
    }
    return true;
  }

  /// 2つのStringリストが等しいかチェック
  bool _areLabelsEqual(List<String> a, List<String> b) {
    if (a.length != b.length) return false;
    for (int i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

  /// グループデータとローカルデータをマージ（publicメソッド）
  void mergeGroupDataWithLocal(Map<String, dynamic> groupAssignmentData) {
    _mergeGroupDataWithLocal(groupAssignmentData, source: 'external');
  }

  /// グループデータとローカルデータをマージ（ローカルデータ優先）
  void _mergeGroupDataWithLocal(
    Map<String, dynamic> groupAssignmentData, {
    String source = 'group',
  }) async {
    if (!mounted) return;
    debugPrint('AssignmentBoard: グループデータとローカルデータをマージ開始');
    debugPrint('AssignmentBoard: 受信データ: $groupAssignmentData');

    final isFirstRemoteMerge = !_initialGroupDataLoaded;
    _beginRemoteUpdate();
    try {
      // グループメンバーの有効性をチェックしてクリーンアップ
      await _cleanupInvalidMembers();

      // ローカルデータの保存時刻をチェック（メンバー編集後の上書きを防ぐため）
      final localSavedAt = await UserSettingsFirestoreService.getSetting(
        'teams_savedAt',
      );
      final groupSavedAt = groupAssignmentData['savedAt'];

      // ローカルデータがグループデータより新しい場合は上書きしない
      if (localSavedAt != null && groupSavedAt != null) {
        try {
          final localTime = DateTime.parse(localSavedAt);
          final groupTime = DateTime.parse(groupSavedAt);
          if (localTime.isAfter(groupTime)) {
            debugPrint('AssignmentBoard: ローカルデータが新しいため、グループデータでの上書きをスキップ');
            return;
          }
        } catch (e) {
          debugPrint('AssignmentBoard: 時刻比較エラー: $e');
        }
      }

      // 今日の担当が既に決定されているかチェック
      final today = _todayKey();
      final todayAssignedPairs = await UserSettingsFirestoreService.getSetting(
        'assignment_$today',
      );
      final savedDate = await UserSettingsFirestoreService.getSetting(
        'assignedDate',
      );
      final lastResetDate = await UserSettingsFirestoreService.getSetting(
        'lastResetDate',
      );

      final hasTodayAssignment =
          todayAssignedPairs != null &&
          todayAssignedPairs is List &&
          todayAssignedPairs.isNotEmpty &&
          savedDate == today &&
          lastResetDate != today;

      debugPrint(
        'AssignmentBoard: 今日の担当状態チェック - hasTodayAssignment: $hasTodayAssignment',
      );

      // データを一旦変数に格納してから一括更新
      List<Team> newTeams = [];
      List<String> newLeftLabels = leftLabels;
      List<String> newRightLabels = rightLabels;

      // 新しい形式（teams）または古い形式（aMembers, bMembers）に対応
      if (groupAssignmentData['teams'] != null) {
        final teamsList = groupAssignmentData['teams'] as List;
        newTeams = teamsList.map((teamMap) => Team.fromMap(teamMap)).toList();
      } else {
        // 古い形式の場合は新しい形式に変換
        final aMembers = _safeStringListFromDynamic(
          groupAssignmentData['aMembers'],
        );
        final bMembers = _safeStringListFromDynamic(
          groupAssignmentData['bMembers'],
        );
        newTeams = [
          Team(id: 'team_a', name: 'A班', members: aMembers),
          Team(id: 'team_b', name: 'B班', members: bMembers),
        ];
      }

      // グループ状態では、グループデータを完全に使用（ローカルデータは保持しない）
      newLeftLabels = _safeStringListFromDynamic(
        groupAssignmentData['leftLabels'],
      );
      newRightLabels = _safeStringListFromDynamic(
        groupAssignmentData['rightLabels'],
      );

      // 今日の担当が決定済みの場合は、基本構成を今日の担当で上書き
      if (hasTodayAssignment) {
        debugPrint('AssignmentBoard: 今日の担当決定済み - 基本構成に担当データを適用');
        try {
          final assignedPairs = todayAssignedPairs;
          if (assignedPairs.length == newLeftLabels.length &&
              newTeams.length >= 2) {
            // 基本構成を今日の担当で上書き
            for (int i = 0; i < newTeams.length; i++) {
              final newTeamMembers = assignedPairs
                  .map((e) => e.toString().split('-')[i])
                  .toList();
              newTeams[i] = newTeams[i].copyWith(members: newTeamMembers);
            }
            debugPrint('AssignmentBoard: 基本構成に今日の担当を適用完了');
          }
        } catch (e) {
          debugPrint('AssignmentBoard: 今日の担当適用エラー: $e');
        }
      }

      // グループデータが変更されている場合は常に反映（ちらつき防止のため変更チェック）
      if (mounted) {
        bool hasChanges = false;

        // データが空の場合は必ず更新
        if (teams.isEmpty && leftLabels.isEmpty) {
          hasChanges = true;
          debugPrint('AssignmentBoard: ローカルデータが空のため、グループデータで更新');
        } else {
          // データの変更をチェック
          if (!_areTeamsEqual(teams, newTeams) ||
              !_areLabelsEqual(leftLabels, newLeftLabels) ||
              !_areLabelsEqual(rightLabels, newRightLabels)) {
            hasChanges = true;
            debugPrint('AssignmentBoard: グループデータの変更を検知 - 更新します');
          } else {
            debugPrint('AssignmentBoard: グループデータに変更なし - 更新をスキップ');
          }
        }

        if (hasChanges) {
          setState(() {
            teams = newTeams;
            leftLabels = newLeftLabels;
            rightLabels = newRightLabels;
            // メンバーやラベルが空の場合はローディングを継続
            _isLoading =
                newTeams.isEmpty ||
                newTeams.every((t) => t.members.isEmpty) ||
                newLeftLabels.isEmpty;
            _isDataInitialized = true;
            // 担当決定状態を常に hasTodayAssignment の値で更新
            isAssignedToday = hasTodayAssignment;
          });
          debugPrint('AssignmentBoard: グループデータの更新完了');
        }
      }

      // マージ完了
    } finally {
      _endRemoteUpdate();
      if (isFirstRemoteMerge) {
        _initialGroupDataLoaded = true;
      }
    }
  }

  /// 無効なメンバーをクリーンアップ
  Future<void> _cleanupInvalidMembers() async {
    try {
      final groupProvider = context.read<GroupProvider>();
      if (!groupProvider.hasGroup) return;

      // 有効なグループメンバー名のリストを作成
      final validMemberNames = groupProvider.currentGroup!.members
          .map((m) => m.displayName)
          .toSet();

      bool hasChanges = false;
      List<Team> cleanedTeams = [];

      for (final team in teams) {
        final validMembers = <String>[];

        for (final memberName in team.members) {
          if (validMemberNames.contains(memberName)) {
            validMembers.add(memberName);
          } else {
            hasChanges = true;
            // 無効なメンバー名を削除
          }
        }

        cleanedTeams.add(team.copyWith(members: validMembers));
      }

      if (hasChanges) {
        setState(() {
          teams = cleanedTeams;
        });
        // メンバーデータのクリーンアップ完了

        // クリーンアップ後のデータを保存
        await _updateLocalData();
      }
    } catch (e) {
      debugPrint('AssignmentBoard: メンバークリーンアップエラー: $e');
    }
  }

  /// 強制クリーンアップ（古いデータを完全に削除）
  Future<void> _forceCleanupAllOldData() async {
    try {
      // 強制クリーンアップ開始

      final groupProvider = context.read<GroupProvider>();
      if (!groupProvider.hasGroup) return;

      // 有効なグループメンバー名のリストを作成
      final validMemberNames = groupProvider.currentGroup!.members
          .map((m) => m.displayName)
          .toSet();

      bool hasChanges = false;
      List<Team> cleanedTeams = [];

      for (final team in teams) {
        final validMembers = <String>[];

        for (final memberName in team.members) {
          if (validMemberNames.contains(memberName)) {
            validMembers.add(memberName);
          } else {
            hasChanges = true;
            // 強制クリーンアップ: 無効なメンバー名を削除
          }
        }

        cleanedTeams.add(team.copyWith(members: validMembers));
      }

      if (hasChanges) {
        setState(() {
          teams = cleanedTeams;
        });
        // 強制クリーンアップ完了

        // クリーンアップ後のデータを保存（グループまたはローカル）
        await _updateLocalData();
      } else {
        // 強制クリーンアップ: 変更なし
      }
    } catch (e) {
      debugPrint('AssignmentBoard: 強制クリーンアップエラー: $e');
    }
  }

  /// ローカルデータを更新
  Future<void> _updateLocalData() async {
    if (_isSyncLocked) {
      return;
    }
    try {
      final groupProvider = context.read<GroupProvider>();

      // 新しい形式で保存
      final teamsData = teams.map((team) => team.toMap()).toList();

      if (groupProvider.hasGroup) {
        // グループ状態の場合はグループに同期
        final group = groupProvider.currentGroup!;
        debugPrint('AssignmentBoard: グループデータ同期開始 - groupId: ${group.id}');

        final assignmentData = {
          'teams': teamsData, // Listとして保存
          'leftLabels': leftLabels, // Listとして保存
          'rightLabels': rightLabels, // Listとして保存
          'savedAt': DateTime.now().toIso8601String(),
        };

        await GroupDataSyncService.syncAssignmentBoard(
          group.id,
          assignmentData,
        );
        debugPrint('AssignmentBoard: グループデータ同期完了');
      } else {
        // 個人状態の場合はローカルに保存
        final currentTime = DateTime.now().toIso8601String();
        await UserSettingsFirestoreService.saveMultipleSettings({
          'teams': teamsData, // Listとして保存
          'leftLabels': leftLabels, // Listとして保存
          'rightLabels': rightLabels, // Listとして保存
          'teams_savedAt': currentTime, // ローカル保存時刻を記録
        });

        // 後方互換性のため、最初の2つの班をA班、B班としても保存
        if (teams.isNotEmpty) {
          await UserSettingsFirestoreService.saveMultipleSettings({
            'assignment_team_a': teams[0].members,
            'assignment_team_b': teams.length > 1 ? teams[1].members : [],
          });
        }

        debugPrint('AssignmentBoard: Firebaseデータ更新完了');
      }
    } catch (e) {
      debugPrint('AssignmentBoard: Firebaseデータ更新エラー: $e');
    }
  }

  void setAssignmentHistoryFromFirestore(List<String> history) async {
    if (!mounted) return;

    final today = _todayKey();
    bool shouldUpdateState = false;
    bool newAssignedStatus = false;

    // 今日の担当履歴設定開始

    if (history.isNotEmpty &&
        history.length == leftLabels.length &&
        teams.length >= 2) {
      try {
        // 履歴を各チームに分配
        List<Team> updatedTeams = [];
        for (int i = 0; i < teams.length; i++) {
          final teamMembers = history.map((e) => e.split('-')[i]).toList();
          updatedTeams.add(teams[i].copyWith(members: teamMembers));
        }

        // グループ状態でない場合のみローカルに保存
        final groupProvider = context.read<GroupProvider>();
        if (!groupProvider.hasGroup) {
          UserSettingsFirestoreService.saveMultipleSettings({
            'assignment_$today': history,
            'assignedDate': today,
            'lastResetDate': null, // リセット状態をクリア
            'resetVerified': false,
          });
        }

        if (mounted) {
          setState(() {
            teams = updatedTeams;
            isAssignedToday = true;
          });
        }

        // グループから今日の担当履歴を受信・適用完了
      } catch (e) {
        debugPrint('AssignmentBoard: 履歴データ適用エラー: $e');
        shouldUpdateState = true;
        newAssignedStatus = false;
      }
    } else {
      // 履歴が空または無効な場合は決定済みフラグをリセット
      shouldUpdateState = true;
      newAssignedStatus = false;
      // 履歴データが無効または空 - 決定済みフラグをリセット

      // 状態変更が必要かつ値が変わる場合のみsetStateを呼ぶ
      if (shouldUpdateState && isAssignedToday != newAssignedStatus) {
        setState(() {
          isAssignedToday = newAssignedStatus;
        });
      }
    }
  }

  void setAssignmentMembersFromFirestore(
    Map<String, dynamic> assignmentMembers,
  ) {
    if (mounted) {
      final isFirstRemoteMerge = !_initialGroupDataLoaded;
      _beginRemoteUpdate();
      setState(() {
        // 新しい形式（teams）または古い形式（aMembers, bMembers）に対応
        if (assignmentMembers['teams'] != null) {
          final teamsList = assignmentMembers['teams'] as List;
          teams = teamsList.map((teamMap) => Team.fromMap(teamMap)).toList();
        } else {
          // 古い形式の場合は新しい形式に変換
          final aMembers = _safeStringListFromDynamic(
            assignmentMembers['aMembers'],
          );
          final bMembers = _safeStringListFromDynamic(
            assignmentMembers['bMembers'],
          );
          teams = [
            Team(id: 'team_a', name: 'A班', members: aMembers),
            Team(id: 'team_b', name: 'B班', members: bMembers),
          ];
        }

        // ラベルデータも更新
        leftLabels = _safeStringListFromDynamic(
          assignmentMembers['leftLabels'],
        );
        rightLabels = _safeStringListFromDynamic(
          assignmentMembers['rightLabels'],
        );
      });
      _endRemoteUpdate();
      if (isFirstRemoteMerge) {
        _initialGroupDataLoaded = true;
      }
    }
  }

  @override
  void initState() {
    super.initState();

    // 読み込み状態を開始
    _isLoading = true;
    _isDataInitialized = false;
    _isRemoteSyncCompleted = false;

    // 権限の初期値を設定（グループ未参加時は編集可能・担当決定可能）
    _canEditAssignment = true;

    // まずローカルデータを読み込み（ラベルを確実に保持）
    _loadLocalDataFirst();

    _loadTodayAttendance();
    _initializeGroupMonitoring();
    _loadDeveloperMode();
    _startDeveloperModeListener();
    _startDisplayNameMonitoring();

    _setupGroupProviderListener();

    // 日付変更監視と最終シャッフル日付を読み込み
    _startDateChangeMonitor();
    _loadLastShuffleDate();

    // タイムアウト処理を追加 - 10秒後には必ずローディングを終了
    Future.delayed(Duration(seconds: 10), () {
      if (mounted && _isLoading) {
        debugPrint('AssignmentBoard: タイムアウト - 強制的にローディングを終了');
        setState(() {
          _isLoading = false;
          _isDataInitialized = true;
        });
      }
    });

    // 初期権限チェックを実行
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkEditPermission();
    });

    // 初期化後に強制クリーンアップを実行
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _forceCleanupAllOldData();
    });
  }

  /// ローカルデータを最初に読み込み（常に実行）
  Future<void> _loadLocalDataFirst() async {
    if (!mounted) return;
    try {
      // ローカルデータ読み込み開始
      debugPrint('AssignmentBoard: ローカルデータ読み込み開始');

      final settings = await UserSettingsFirestoreService.getMultipleSettings([
        'teams',
        'leftLabels',
        'rightLabels',
        'assignment_team_a',
        'assignment_team_b',
      ]);

      // 新しい形式で班データを読み込み
      List<Team> loadedTeams = [];
      final teamsJson = settings['teams'];
      if (teamsJson != null) {
        final teamsList = jsonDecode(teamsJson) as List;
        loadedTeams = teamsList
            .map((teamMap) => Team.fromMap(teamMap))
            .toList();
      } else {
        // 既存のA班、B班データを新しい形式に変換
        final loadedA = settings['assignment_team_a'] ?? [];
        final loadedB = settings['assignment_team_b'] ?? [];
        loadedTeams = [
          Team(id: 'team_a', name: 'A班', members: loadedA),
          Team(id: 'team_b', name: 'B班', members: loadedB),
        ];
      }

      // ラベルデータを確実に読み込み（安全な変換を使用）
      final loadedLeftLabels = _safeStringListFromDynamic(
        settings['leftLabels'],
      );
      final loadedRightLabels = _safeStringListFromDynamic(
        settings['rightLabels'],
      );

      // ローカルデータ読み込み完了

      // 今日の担当があるかチェック
      final today = _todayKey();
      final todayAssignedPairs = await UserSettingsFirestoreService.getSetting(
        'assignment_$today',
      );
      final savedDate = await UserSettingsFirestoreService.getSetting(
        'assignedDate',
      );
      final lastResetDate = await UserSettingsFirestoreService.getSetting(
        'lastResetDate',
      );

      final hasTodayAssignment =
          todayAssignedPairs != null &&
          todayAssignedPairs is List &&
          todayAssignedPairs.isNotEmpty &&
          savedDate == today &&
          lastResetDate != today;

      // 今日の担当が決定済みの場合は、基本構成を今日の担当で上書き
      if (hasTodayAssignment) {
        // 今日の担当決定済み - 基本構成に担当データを適用
        try {
          final assignedPairs = todayAssignedPairs;
          if (assignedPairs.length == loadedLeftLabels.length &&
              loadedTeams.length >= 2) {
            // 基本構成を今日の担当で上書き
            for (int i = 0; i < loadedTeams.length; i++) {
              final newTeamMembers = assignedPairs
                  .map((e) => e.toString().split('-')[i])
                  .toList();
              loadedTeams[i] = loadedTeams[i].copyWith(members: newTeamMembers);
            }
            // ローカルデータに今日の担当を適用完了
          }
        } catch (e) {
          debugPrint('AssignmentBoard: ローカルデータでの今日の担当適用エラー: $e');
        }
      }

      // データを即座に表示（ちらつき防止）
      if (mounted) {
        _initialLocalDataLoaded = true;
        setState(() {
          teams = loadedTeams;
          leftLabels = loadedLeftLabels;
          rightLabels = loadedRightLabels;
          // 一人グループの場合はデータが空でもローディングを終了
          final groupProvider = context.read<GroupProvider>();
          final isSingleMember =
              groupProvider.hasGroup &&
              groupProvider.currentGroup != null &&
              groupProvider.currentGroup!.members.length == 1;
          _isLoading =
              !isSingleMember &&
              (loadedTeams.isEmpty ||
                  loadedTeams.every((t) => t.members.isEmpty) ||
                  loadedLeftLabels.isEmpty);
          _isDataInitialized = true;
          // 担当決定状態を常に hasTodayAssignment の値で更新
          isAssignedToday = hasTodayAssignment;
        });
        // ローカルデータ読み込み完了後、バックグラウンドでFirebaseと同期
        _isRemoteSyncCompleted = false;
        _syncWithFirebaseInBackground().then((_) {
          if (mounted) {
            setState(() {
              _isRemoteSyncCompleted = true;
              // リモート同期完了後、データが存在する場合、または一人グループの場合はローディングを終了
              final groupProvider = context.read<GroupProvider>();
              final isSingleMember =
                  groupProvider.hasGroup &&
                  groupProvider.currentGroup != null &&
                  groupProvider.currentGroup!.members.length == 1;
              if (isSingleMember ||
                  (teams.isNotEmpty &&
                      !teams.every((t) => t.members.isEmpty) &&
                      leftLabels.isNotEmpty)) {
                _isLoading = false;
              }
            });
          }
        });
      }
    } catch (e) {
      debugPrint('AssignmentBoard: ローカルデータ読み込みエラー: $e');
      if (mounted) {
        setState(() {
          // エラー時も一人グループの場合はローディングを終了
          final groupProvider = context.read<GroupProvider>();
          final isSingleMember =
              groupProvider.hasGroup &&
              groupProvider.currentGroup != null &&
              groupProvider.currentGroup!.members.length == 1;
          _isLoading =
              !isSingleMember &&
              (teams.isEmpty ||
                  teams.every((t) => t.members.isEmpty) ||
                  leftLabels.isEmpty);
          _isDataInitialized = true;
        });
      }
    }
  }

  /// バックグラウンドでFirebaseと同期
  Future<void> _syncWithFirebaseInBackground() async {
    try {
      final groupProvider = context.read<GroupProvider>();

      if (groupProvider.hasGroup) {
        // グループ状態の場合、グループデータと同期
        debugPrint('AssignmentBoard: グループデータとバックグラウンド同期開始');
        await _syncWithGroupData();
      } else {
        // 個人状態の場合、Firestoreデータと同期
        debugPrint('AssignmentBoard: Firestoreデータとバックグラウンド同期開始');
        await _syncWithFirestoreData();
      }
      // 同期完了フラグを立てる（nil安全）
      if (mounted) {
        _isRemoteSyncCompleted = true;
        // バックグラウンド同期完了後、確実にローディングを終了
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('AssignmentBoard: バックグラウンド同期エラー: $e');
      // エラーが発生しても同期完了フラグを立てる（UIのちらつきを防ぐ）
      if (mounted) {
        _isRemoteSyncCompleted = true;
        // エラー時も確実にローディングを終了
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// Firestoreデータと同期
  Future<void> _syncWithFirestoreData() async {
    try {
      debugPrint('AssignmentBoard: Firestoreデータ同期開始');
      final assignmentData =
          await AssignmentFirestoreService.loadAssignmentMembers();
      if (assignmentData != null && mounted) {
        // Firestoreデータがローカルデータより新しい場合のみ更新
        final firestoreSavedAt = assignmentData['savedAt'];
        if (firestoreSavedAt != null) {
          // 必要に応じてデータを更新（ここでは簡略化）
          debugPrint('AssignmentBoard: Firestoreデータ同期完了');

          // Firestoreデータが存在する場合はローディングを終了
          if (mounted) {
            setState(() {
              _isLoading = false;
            });
          }
        }
      } else {
        debugPrint('AssignmentBoard: Firestoreデータが取得できませんでした');
        // データが存在しない場合もローディングを終了
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('AssignmentBoard: Firestore同期エラー: $e');
      // エラーが発生しても処理を継続（UIのちらつきを防ぐ）
      // エラー時もローディングを終了
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// グループデータと同期
  Future<void> _syncWithGroupData() async {
    try {
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.groups.isNotEmpty) {
        final group = groupProvider.groups.first;
        final groupData = await GroupDataSyncService.getGroupAssignmentBoard(
          group.id,
        );

        if (groupData != null && mounted) {
          // グループデータが取得できた場合はローカルに反映
          _mergeGroupDataWithLocal(Map<String, dynamic>.from(groupData));
        }

        // データ取得の成否に関わらずローディング状態を解除
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('AssignmentBoard: グループ同期エラー: $e');
      // エラー時もローディング状態を解除
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    // 解像度変更時はローディング状態を開始しない
    // データが既に初期化済みの場合は、ラベルのみ再読み込み
    if (_isDataInitialized) {
      // ラベルデータを再読み込み（データは保持）
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _reloadLabelsOnly();
      });
    } else {
      // 初回読み込み時のみローディング状態を開始
      if (!_isLoading) {
        setState(() {
          _isLoading = true;
          _isDataInitialized = false;
        });
      }

      // ラベルデータを再読み込み
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _reloadLabelsOnly();
      });
    }
  }

  /// 今日の出勤退勤記録を読み込み
  Future<void> _loadTodayAttendance() async {
    if (!mounted) return;
    try {
      // 出勤退勤記録読み込み開始

      // グループ状態の場合はグループデータを優先的に読み込み
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.hasGroup) {
        final group = groupProvider.currentGroup!;
        final today = DateTime.now();
        final dateKey =
            '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';

        // グループ出勤退勤記録読み込み開始

        final groupAttendance =
            await AttendanceFirestoreService.getGroupAttendanceData(
              group.id,
              dateKey,
            );
        if (mounted) {
          setState(() {
            _todayAttendance = groupAttendance;
          });
        }
        // グループ出勤退勤記録読み込み完了
      } else {
        // グループ状態でない場合はローカルデータを読み込み
        final attendance =
            await AttendanceFirestoreService.getTodayAttendance();
        if (mounted) {
          setState(() {
            _todayAttendance = attendance;
          });
        }
        // ローカル出勤退勤記録読み込み完了
      }
    } catch (e) {
      // 出勤退勤記録読み込みエラー
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('出勤退勤記録の読み込みに失敗しました')));
      }
    } finally {
      // 出勤データの読み込みは独立して行い、ローディング状態は変更しない
      // ローディング状態の変更を削除
    }
  }

  /// メンバーの出勤退勤状態を取得
  AttendanceStatus _getMemberAttendanceStatus(String memberName) {
    final record = _todayAttendance.firstWhere(
      (r) => r.memberName == memberName,
      orElse: () => AttendanceRecord(
        memberId: '',
        memberName: memberName,
        status: AttendanceStatus.present, // デフォルトは出勤
        timestamp: DateTime.now(),
        dateKey: DateFormat('yyyy-MM-dd').format(DateTime.now()),
      ),
    );
    return record.status;
  }

  /// メンバーを班内で並び替え
  Future<void> _reorderMemberInTeam(
    String teamId,
    int fromIndex,
    int toIndex,
  ) async {
    if (!mounted) return;

    // チームを検索
    final teamIndex = teams.indexWhere((t) => t.id == teamId);
    if (teamIndex == -1) return;

    final team = teams[teamIndex];
    final members = List<String>.from(team.members);

    // インデックスが範囲外の場合は何もしない
    if (fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= members.length ||
        toIndex >= members.length) {
      return;
    }

    // 同じ位置なら何もしない
    if (fromIndex == toIndex) return;

    // メンバーを移動
    final member = members.removeAt(fromIndex);
    members.insert(toIndex, member);

    // チームを更新
    final updatedTeam = team.copyWith(members: members);
    final updatedTeams = List<Team>.from(teams);
    updatedTeams[teamIndex] = updatedTeam;

    setState(() {
      teams = updatedTeams;
    });

    // 担当表履歴に保存
    await _saveAssignmentHistory();
  }

  /// 担当表履歴を保存
  Future<void> _saveAssignmentHistory() async {
    if (!mounted) return;

    try {
      final today = _todayKey();

      // 各行のメンバーを"-"で結合した形式で保存
      final maxMembers = teams.fold<int>(
        0,
        (max, team) => team.members.length > max ? team.members.length : max,
      );

      final assignments = <String>[];
      for (int i = 0; i < maxMembers; i++) {
        final rowMembers = teams
            .map((team) {
              return i < team.members.length && team.members[i].isNotEmpty
                  ? team.members[i]
                  : '未設定';
            })
            .join('-');
        assignments.add(rowMembers);
      }

      // Firestoreに保存
      await AssignmentFirestoreService.saveAssignmentHistory(
        dateKey: today,
        assignments: assignments,
        leftLabels: leftLabels,
        rightLabels: rightLabels,
      );

      // グループ参加中の場合は同期
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.hasGroup) {
        final group = groupProvider.currentGroup;
        if (group != null) {
          // グループの今日の担当履歴を更新
          await GroupDataSyncService.syncTodayAssignment(group.id, {
            'assignments': assignments,
            'dateKey': today,
            'updatedAt': DateTime.now().toIso8601String(),
          });
        }
      }

      debugPrint('AssignmentBoard: 担当表履歴保存完了 - $today');
    } catch (e) {
      debugPrint('AssignmentBoard: 担当表履歴保存エラー: $e');
    }
  }

  /// メンバーの出勤退勤状態を更新
  Future<void> _updateMemberAttendance(
    String memberName,
    AttendanceStatus status,
  ) async {
    if (!mounted) return;

    try {
      final userId = FirebaseAuth.instance.currentUser?.uid;
      if (userId == null) return;

      // 出勤退勤状態更新開始

      // 出勤状態更新時のローディング表示は削除
      // UIの不要な再描画を防止

      await AttendanceFirestoreService.updateMemberAttendance(
        userId,
        memberName,
        status,
      );

      // 出勤の場合、経験値を追加
      if (status == AttendanceStatus.present && mounted) {
        await _addAttendanceExperience();
      }

      // 統計データを更新
      if (mounted) {
        final statsProvider = Provider.of<DashboardStatsProvider>(
          context,
          listen: false,
        );
        await statsProvider.onAttendanceUpdated();
      }

      // 状態更新後にUIを更新
      if (!mounted) return;
      final groupProvider = context.read<GroupProvider>();
      if (!groupProvider.hasGroup) {
        // グループ状態でない場合はローカル状態を更新
        await _loadTodayAttendance();
      } else {
        // グループ状態の場合は少し待ってから再読み込み（リアルタイム同期の遅延を考慮）
        // グループ状態のため、少し待ってから再読み込みします
        await Future.delayed(Duration(milliseconds: 500));
        if (mounted) {
          await _loadTodayAttendance();
        }
      }

      // 出勤状態更新時のローディング表示は削除
      // UIの不要な再描画を防止
    } catch (e) {
      // 出勤退勤状態更新エラー
      // エラー時もローディング状態の変更は行わない
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('出勤退勤状態の更新に失敗しました')));
      }
    }
  }

  /// 出勤記録からXPを加算
  Future<void> _addAttendanceExperience() async {
    try {
      // グループレベルシステムで出勤記録を処理
      await _processAttendanceForGroup();

      // 成果表示（グループレベルシステム用に簡略化）
      _showGroupAttendanceResult();
    } catch (e) {
      // 出勤記録処理エラー
    }
  }

  /// グループレベルシステムで出勤記録を処理
  Future<void> _processAttendanceForGroup() async {
    try {
      // グループプロバイダーを取得
      final groupProvider = Provider.of<GroupProvider>(context, listen: false);

      if (groupProvider.hasGroup) {
        final groupId = groupProvider.currentGroup!.id;

        // グループのゲーミフィケーションシステムに通知
        await groupProvider.processGroupAttendance(groupId, context: context);
      }
    } catch (e) {
      // グループレベルシステム処理エラー
    }
  }

  /// グループレベルシステム用の出勤結果表示
  void _showGroupAttendanceResult() {
    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('出勤記録を保存しました'), backgroundColor: Colors.green),
    );
  }

  /// グループ監視の初期化
  void _initializeGroupMonitoring() {
    if (!mounted) return;
    // グループ監視初期化開始
    // 既に監視中の場合は何もしない
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final groupProvider = context.read<GroupProvider>();
      _handleGroupProviderUpdate(groupProvider);
    });
  }

  void _setupGroupProviderListener() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final groupProvider = context.read<GroupProvider>();
      if (_groupProviderListener != null) {
        groupProvider.removeListener(_groupProviderListener!);
      }
      _groupProviderListener = () {
        _handleGroupProviderUpdate(groupProvider);
      };
      groupProvider.addListener(_groupProviderListener!);
      _handleGroupProviderUpdate(groupProvider);
    });
  }

  void _handleGroupProviderUpdate(GroupProvider groupProvider) {
    if (!mounted) return;

    final groupId = groupProvider.currentGroup?.id;
    if (_activeGroupId == groupId && _groupAssignmentSubscription != null) {
      return;
    }

    _activeGroupId = groupId;
    _startGroupMonitoring(groupProvider);
  }

  /// グループ監視を開始
  void _startGroupMonitoring(GroupProvider groupProvider) {
    if (!mounted) return;
    // グループ監視開始

    // 既存のサブスクリプションをクリーンアップ
    _groupAssignmentSubscription?.cancel();
    _groupSettingsSubscription?.cancel();
    _groupTodayAssignmentSubscription?.cancel();
    _groupAttendanceSubscription?.cancel();

    if (groupProvider.hasGroup) {
      final group = groupProvider.currentGroup!;
      // グループ監視開始

      // グループの担当表データを監視（基本構成）
      _groupAssignmentSubscription =
          GroupDataSyncService.watchGroupAssignmentBoard(group.id).listen((
            groupAssignmentData,
          ) {
            if (!mounted) return; // ウィジェットが破棄されている場合は処理しない
            // グループ担当表データ変更検知
            if (groupAssignmentData != null) {
              // グループデータが利用可能になった場合、バックグラウンドで同期
              // ローカルデータを優先し、必要に応じて更新
              _mergeGroupDataWithLocal(groupAssignmentData);

              // グループデータ受信後にクリーンアップを実行
              WidgetsBinding.instance.addPostFrameCallback((_) {
                _forceCleanupAllOldData();
              });
            } else {
              // グループ担当表データが空です - ローカルデータを維持
              // グループデータが空の場合は、ローカルデータを維持
              if (mounted) {
                setState(() {
                  _isLoading = false;
                  _isDataInitialized = true;
                });
              }
            }
          });

      // グループ設定を監視
      // グループ設定監視を開始
      _groupSettingsSubscription =
          GroupFirestoreService.watchGroupSettings(group.id).listen((
            groupSettings,
          ) {
            if (!mounted) return; // ウェットが破棄されている場合は処理しない
            // グループ設定変更検知

            if (groupSettings != null) {
              // グループ設定変換成功

              // グループ設定が変更されたら権限を再チェック
              _checkEditPermissionFromSettings(groupSettings, groupProvider);
            } else {
              // グループ設定データがnullです
            }
          });

      // グループの今日の担当履歴を監視
      _groupTodayAssignmentSubscription =
          GroupDataSyncService.watchGroupTodayAssignment(group.id).listen((
            groupTodayAssignmentData,
          ) {
            if (!mounted) return; // ウェットが破棄されている場合は処理しない
            // グループ今日の担当履歴変更検知

            // データがnullまたは削除された場合の処理を強化
            if (groupTodayAssignmentData == null) {
              // グループの今日の担当データが削除されました
              setAssignmentHistoryFromFirestore([]);
              return;
            }

            if (groupTodayAssignmentData['assignments'] != null) {
              final assignments = _safeStringListFromDynamic(
                groupTodayAssignmentData['assignments'],
              );
              if (assignments.isNotEmpty) {
                // グループから今日の担当データを受信 - 最優先で適用
                setAssignmentHistoryFromFirestore(assignments);
              } else {
                // グループの今日の担当データが空です
                setAssignmentHistoryFromFirestore([]);
              }
            } else {
              // グループの今日の担当履歴が削除された場合
              // グループの今日の担当履歴が削除されました
              setAssignmentHistoryFromFirestore([]);
            }
          });

      // グループの出勤退勤データをリアルタイム監視
      final today = DateTime.now();
      final dateKey =
          '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
      // グループ出勤退勤データ監視開始

      _groupAttendanceSubscription =
          AttendanceFirestoreService.watchGroupAttendanceData(
            group.id,
            dateKey,
          ).listen((groupAttendanceRecords) {
            if (!mounted) return;
            // グループ出勤退勤データ変更検知

            // グループの出勤退勤データをローカルに反映
            setState(() {
              _todayAttendance = groupAttendanceRecords;
            });
          });
    }
  }

  /// グループ設定から直接権限をチェック
  void _checkEditPermissionFromSettings(
    GroupSettings groupSettings,
    GroupProvider groupProvider,
  ) {
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      debugPrint('未ログインのため権限チェックをスキップ');
      setState(() {
        _canEditAssignment = false;
      });
      return;
    }

    // 権限チェック開始

    try {
      final userRole = groupProvider.currentGroup!.getMemberRole(
        currentUser.uid,
      );
      if (userRole == null) {
        // ユーザーロールが取得できません
        setState(() {
          _canEditAssignment = false;
        });
        return;
      }

      // ユーザーロール確認

      final canEdit = groupSettings.canEditDataType(
        'assignment_board',
        userRole,
      );

      // 設定変更による権限チェック

      if (mounted && _canEditAssignment != canEdit) {
        // 権限状態を更新
        setState(() {
          _canEditAssignment = canEdit;
        });
        // 権限状態を更新完了
      } else {
        // 権限状態は変更されませんでした
      }
    } catch (e) {
      debugPrint('AssignmentBoard: 設定変更による権限チェックエラー - $e');
      if (mounted) {
        setState(() {
          _canEditAssignment = false;
        });
      }
    }
  }

  /// 担当表編集権限をチェック
  Future<void> _checkEditPermission() async {
    try {
      final groupProvider = context.read<GroupProvider>();
      final groups = groupProvider.groups;

      debugPrint('AssignmentBoard: 権限チェック開始 - groups: ${groups.length}');

      // グループが存在することを前提とする
      if (groups.isNotEmpty) {
        final group = groups.first;
        debugPrint('AssignmentBoard: グループ権限チェック - groupId: ${group.id}');

        // 現在のグループ設定から直接権限を取得
        final groupSettings = await GroupFirestoreService.getGroupSettings(
          group.id,
        );
        final currentUser = FirebaseAuth.instance.currentUser;
        if (currentUser == null) {
          debugPrint('未ログインのため権限チェックをスキップ');
          setState(() {
            _canEditAssignment = false;
          });
          return;
        }
        if (groupSettings != null) {
          final userRole = group.getMemberRole(currentUser.uid);
          if (userRole != null) {
            final canEdit = groupSettings.canEditDataType(
              'assignment_board',
              userRole,
            );
            debugPrint(
              'AssignmentBoard: 初期権限チェック結果 - ユーザーロール: $userRole, 編集権限: $canEdit',
            );
            setState(() {
              _canEditAssignment = canEdit;
            });
            return;
          }
        }

        // フォールバック: 既存の方法で権限チェック
        final canEdit = await GroupFirestoreService.canEditDataType(
          groupId: group.id,
          dataType: 'assignment_board',
        );

        debugPrint('AssignmentBoard: フォールバック権限チェック結果 - canEdit: $canEdit');

        setState(() {
          _canEditAssignment = canEdit;
        });
      } else {
        // グループ未参加の場合は編集不可
        debugPrint('AssignmentBoard: グループ未参加 - 編集不可に設定');
        setState(() {
          _canEditAssignment = false;
        });
      }
    } catch (e) {
      // エラーの場合は編集不可として扱う
      debugPrint('AssignmentBoard: 権限チェックエラー - $e, 編集不可に設定');
      setState(() {
        _canEditAssignment = false;
      });
    }
  }

  /// リアルタイムで権限をチェック（Consumer内で使用）
  void _checkEditPermissionRealtime(GroupProvider groupProvider) {
    if (!mounted) return; // ウィジェットが破棄されている場合は処理しない

    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser == null) {
      debugPrint('未ログインのため権限チェックをスキップ');
      setState(() {
        _canEditAssignment = false;
      });
      return;
    }

    if (groupProvider.hasGroup) {
      final group = groupProvider.currentGroup!;
      debugPrint('AssignmentBoard: リアルタイム権限チェック開始 - groupId: ${group.id}');

      GroupFirestoreService.canEditDataType(
            groupId: group.id,
            dataType: 'assignment_board',
          )
          .then((canEdit) {
            // リアルタイムチェック時の権限判定
            final groupSettings = groupProvider.getCurrentGroupSettings();
            final userRole = group.getMemberRole(currentUser.uid);
            final accessLevel = groupSettings?.getPermissionForDataType(
              'assignment_board',
            );
            debugPrint(
              'AssignmentBoard: リアルタイム権限判定 - userRole: $userRole, accessLevel: $accessLevel',
            );
            if (mounted && _canEditAssignment != canEdit) {
              setState(() {
                _canEditAssignment = canEdit;
              });
            }
          })
          .catchError((e) {
            // エラーの場合は編集不可として扱う
            debugPrint('AssignmentBoard: リアルタイム権限チェックエラー - $e');
            if (mounted && (_canEditAssignment != false)) {
              setState(() {
                _canEditAssignment = false;
              });
            }
          });
    } else {
      // グループ未参加の場合は編集不可
      if (mounted && (_canEditAssignment != false)) {
        setState(() {
          _canEditAssignment = false;
        });
      }
    }
  }

  /// グループに今日の担当履歴を同期
  Future<void> _syncTodayAssignmentToGroup(List<String> assignments) async {
    try {
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.hasGroup) {
        final group = groupProvider.currentGroup!;
        debugPrint('AssignmentBoard: 今日の担当履歴をグループに同期開始 - groupId: ${group.id}');

        final todayAssignmentData = {
          'assignments': assignments,
          'savedAt': DateTime.now().toIso8601String(),
        };

        await GroupDataSyncService.syncTodayAssignment(
          group.id,
          todayAssignmentData,
        );
        debugPrint('AssignmentBoard: 今日の担当履歴同期完了');
      }
    } catch (e) {
      debugPrint('AssignmentBoard: 今日の担当履歴同期エラー: $e');
    }
  }

  /// グループに担当履歴を同期
  Future<void> _syncAssignmentHistoryToGroup(
    String dateKey,
    List<String> assignments,
  ) async {
    try {
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.hasGroup) {
        final group = groupProvider.currentGroup!;
        debugPrint(
          'AssignmentBoard: 担当履歴をグループに同期開始 - groupId: ${group.id}, dateKey: $dateKey',
        );

        final assignmentHistoryData = {
          dateKey: {
            'assignments': assignments,
            'leftLabels': leftLabels,
            'rightLabels': rightLabels,
            'savedAt': DateTime.now().toIso8601String(),
          },
        };

        await GroupDataSyncService.syncAssignmentHistory(
          group.id,
          assignmentHistoryData,
        );
        debugPrint('AssignmentBoard: 担当履歴同期完了');
      }
    } catch (e) {
      debugPrint('AssignmentBoard: 担当履歴同期エラー: $e');
    }
  }

  Future<void> _loadState() async {
    if (!mounted) return;

    // このメソッドは非グループ状態でのみ使用
    final groupProvider = context.read<GroupProvider>();
    if (groupProvider.groups.isNotEmpty) {
      debugPrint('AssignmentBoard: グループ状態 - _loadStateはスキップ');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isDataInitialized = true;
        });
      }
      return;
    }

    // 個人データ取得
    try {
      final assignmentMembers =
          await AssignmentFirestoreService.loadAssignmentMembers();
      if (assignmentMembers != null) {
        debugPrint('AssignmentBoard: Firestoreから担当表データを取得しました');
        _mergeGroupDataWithLocal(assignmentMembers);
        // 今日の担当履歴も取得
        final today = _todayKey();
        final assignmentHistory =
            await AssignmentFirestoreService.loadAssignmentHistory(today);
        if (assignmentHistory != null && assignmentHistory.isNotEmpty) {
          setAssignmentHistoryFromFirestore(assignmentHistory);
        }
        return;
      }
    } catch (e) {
      debugPrint('AssignmentBoard: Firestoreからのデータ取得に失敗しました: $e');
    } finally {
      // データ読み込み完了時にローディング状態を終了
      if (mounted) {
        setState(() {
          _isLoading = false;
          _isDataInitialized = true;
        });
      }
    }
  }

  /// ラベルのみを再読み込み（メンバーデータは保持）
  Future<void> _reloadLabelsOnly() async {
    try {
      debugPrint('AssignmentBoard: ラベル再読み込み開始');

      final settings = await UserSettingsFirestoreService.getMultipleSettings([
        'leftLabels',
        'rightLabels',
      ]);

      debugPrint('AssignmentBoard: 取得したラベル設定: $settings');

      if (mounted) {
        setState(() {
          // 安全な文字列リスト変換を使用
          leftLabels = _safeStringListFromDynamic(settings['leftLabels']);
          rightLabels = _safeStringListFromDynamic(settings['rightLabels']);
        });
        debugPrint(
          'AssignmentBoard: ラベル再読み込み完了 - leftLabels: $leftLabels, rightLabels: $rightLabels',
        );

        // グループに参加している場合は同期
        _updateLocalData();
      }
    } catch (e) {
      debugPrint('AssignmentBoard: ラベル再読み込みエラー: $e');
    }
  }

  /// メンバーのみを再読み込み（ラベルデータは保持）
  Future<void> _reloadMembersOnly() async {
    try {
      debugPrint('AssignmentBoard: メンバー再読み込み開始');

      final settings = await UserSettingsFirestoreService.getMultipleSettings([
        'teams',
        'assignment_team_a',
        'assignment_team_b',
      ]);

      if (mounted) {
        // 新しい形式で班データを読み込み
        final teamsJson = settings['teams'];
        if (teamsJson != null) {
          final teamsList = jsonDecode(teamsJson) as List;
          teams = teamsList.map((teamMap) => Team.fromMap(teamMap)).toList();
        } else {
          // 既存のA班、B班データを新しい形式に変換
          final loadedA = settings['assignment_team_a'] ?? [];
          final loadedB = settings['assignment_team_b'] ?? [];
          teams = [
            Team(id: 'team_a', name: 'A班', members: loadedA),
            Team(id: 'team_b', name: 'B班', members: loadedB),
          ];
        }
        setState(() {});
        debugPrint('AssignmentBoard: メンバー再読み込み完了');

        // グループに参加している場合は同期
        await _updateLocalData();
      }
    } catch (e) {
      debugPrint('AssignmentBoard: メンバー再読み込みエラー: $e');
    }
  }

  /// グループメンバー数が1人かどうかをチェック
  bool _isSingleMemberGroup() {
    final groupProvider = context.read<GroupProvider>();
    if (!groupProvider.hasGroup) return false;

    final group = groupProvider.currentGroup;
    return group != null && group.members.length == 1;
  }

  String _todayKey() => DateFormat('yyyy-MM-dd').format(DateTime.now());

  /// 本日シャッフル可能かを判定
  bool _canShuffleToday() {
    // 初回シャッフル（まだ割り当てられていない）なら常に許可
    if (!isAssignedToday) return true;

    // 開発者モードなら常に許可
    if (isDeveloperMode) return true;

    // 最後のシャッフル日付が今日と異なれば許可
    final today = _todayKey();
    if (_lastShuffledDate == null || _lastShuffledDate != today) return true;

    // それ以外は不許可
    return false;
  }

  /// 日付変更を監視
  void _startDateChangeMonitor() {
    _dateCheckTimer?.cancel();
    _dateCheckTimer = Timer.periodic(Duration(minutes: 1), (_) {
      final today = _todayKey();
      // 日付が変わった場合、最後のシャッフル日付をクリアしてUIを更新
      if (_lastShuffledDate != null && _lastShuffledDate != today) {
        debugPrint('AssignmentBoard: 日付が変更されたため、シャッフル制限をリセット');
        if (mounted) {
          setState(() {
            _lastShuffledDate = null;
          });
        }
      }
    });
  }

  /// 最終シャッフル日付を読み込み
  Future<void> _loadLastShuffleDate() async {
    try {
      final lastShuffleDate = await UserSettingsFirestoreService.getSetting(
        'lastShuffleDate',
      );
      if (mounted) {
        setState(() {
          _lastShuffledDate = lastShuffleDate;
        });
      }
      debugPrint('AssignmentBoard: 最終シャッフル日付を読み込み: $_lastShuffledDate');
    } catch (e) {
      debugPrint('AssignmentBoard: 最終シャッフル日付読み込みエラー: $e');
    }
  }

  /// 最終シャッフル日付を保存
  Future<void> _saveLastShuffleDate() async {
    try {
      final today = _todayKey();
      await UserSettingsFirestoreService.saveSetting('lastShuffleDate', today);
      if (mounted) {
        setState(() {
          _lastShuffledDate = today;
        });
      }
      debugPrint('AssignmentBoard: 最終シャッフル日付を保存: $today');
    } catch (e) {
      debugPrint('AssignmentBoard: 最終シャッフル日付保存エラー: $e');
    }
  }

  String _dayKeyAgo(int d) => DateFormat(
    'yyyy-MM-dd',
  ).format(DateTime.now().subtract(Duration(days: d)));

  /// リセット後の状態を検証して永続化
  Future<void> _verifyResetState() async {
    try {
      final today = _todayKey();
      debugPrint('AssignmentBoard: リセット状態の検証開始 - today: $today');

      // グループ状態でない場合のみローカルデータを保存
      final groupProvider = context.read<GroupProvider>();
      if (!groupProvider.hasGroup) {
        await UserSettingsFirestoreService.saveMultipleSettings({
          'assignment_$today': null,
          'assignedDate': null,
          'lastResetDate': today, // リセット実行日を記録
          'resetVerified': true, // リセット検証フラグ
        });
      }

      // 現在の状態を確認
      final assignedPairs = await UserSettingsFirestoreService.getSetting(
        'assignment_$today',
      );
      final savedDate = await UserSettingsFirestoreService.getSetting(
        'assignedDate',
      );

      debugPrint(
        'AssignmentBoard: リセット後の確認 - assignedPairs: $assignedPairs, savedDate: $savedDate',
      );

      // 状態が正しくリセットされていることを確認
      if (assignedPairs == null && savedDate == null) {
        debugPrint('AssignmentBoard: リセット状態の検証成功');

        // UIの状態も確実に更新
        if (mounted) {
          setState(() {
            isAssignedToday = false;
          });
        }
      } else {
        debugPrint('AssignmentBoard: リセット状態の検証失敗 - 再試行');

        // 再度リセットを実行
        await UserSettingsFirestoreService.saveMultipleSettings({
          'assignment_$today': null,
          'assignedDate': null,
        });

        if (mounted) {
          setState(() {
            isAssignedToday = false;
          });
        }
      }
    } catch (e) {
      debugPrint('AssignmentBoard: リセット状態の検証エラー: $e');

      // エラーの場合も確実にリセット状態にする
      if (mounted) {
        setState(() {
          isAssignedToday = false;
        });
      }
    }
  }

  bool _isWeekend() {
    final wd = DateTime.now().weekday;
    return wd == DateTime.saturday || wd == DateTime.sunday;
  }

  List<String> _makePairs() {
    final count = leftLabels.length;
    if (teams.length < 2) return [];

    // 複数の班に対応するため、すべての班のメンバーを結合
    List<String> pairs = [];
    for (int i = 0; i < count; i++) {
      List<String> rowMembers = [];
      for (int teamIndex = 0; teamIndex < teams.length; teamIndex++) {
        if (i < teams[teamIndex].members.length &&
            teams[teamIndex].members[i].isNotEmpty) {
          rowMembers.add(teams[teamIndex].members[i]);
        } else {
          rowMembers.add('未設定');
        }
      }
      pairs.add(rowMembers.join('-'));
    }
    return pairs;
  }

  /// 過去N日分の担当履歴を取得
  Future<Map<String, List<String>>> _getRecentAssignmentHistory(
    int days,
  ) async {
    final history = <String, List<String>>{};
    for (int i = 1; i <= days; i++) {
      final dateKey = _dayKeyAgo(i);
      try {
        final assignments = await UserSettingsFirestoreService.getSetting(
          'assignment_$dateKey',
        );
        if (assignments != null &&
            assignments is List &&
            assignments.isNotEmpty) {
          history[dateKey] = _safeStringListFromDynamic(assignments);
        }
      } catch (e) {
        debugPrint('AssignmentBoard: 履歴取得エラー ($dateKey): $e');
      }
    }
    return history;
  }

  /// 新しい配置の重複スコアを計算（低いほど良い）
  int _calculateAssignmentScore(
    List<String> newPairs,
    Map<String, List<String>> recentHistory, {
    bool enableDebugLog = false,
  }) {
    int score = 0;
    int positionDuplicates = 0; // 担当位置の重複数
    int pairDuplicates = 0; // ペア相手の重複数

    // 新しい配置のペア関係を抽出（どのメンバーがどのメンバーとペアになっているか）
    final newPairRelations = <String, Set<String>>{};
    for (var i = 0; i < newPairs.length; i++) {
      final members = newPairs[i]
          .split('-')
          .where((m) => m.isNotEmpty && m != '未設定')
          .toList();
      // 各メンバーとそのペア相手を記録
      for (var j = 0; j < members.length; j++) {
        final member = members[j];
        if (!newPairRelations.containsKey(member)) {
          newPairRelations[member] = {};
        }
        // このメンバーのペア相手全員を追加
        for (var k = 0; k < members.length; k++) {
          if (k != j) {
            newPairRelations[member]!.add(members[k]);
          }
        }
      }
    }

    // 新しい配置の担当位置を抽出
    final newPositions = <String, Set<int>>{};
    for (var i = 0; i < newPairs.length; i++) {
      final members = newPairs[i].split('-');
      for (var member in members) {
        if (member.isNotEmpty && member != '未設定') {
          if (!newPositions.containsKey(member)) {
            newPositions[member] = {};
          }
          newPositions[member]!.add(i);
        }
      }
    }

    // 過去の履歴と比較してスコアを計算
    int dayIndex = 1;
    for (var entry in recentHistory.entries) {
      final historyPairs = entry.value;
      // 段階的な重み付け：直近ほど重く、過去ほど軽く
      final weight = switch (dayIndex) {
        1 => 10, // 1日前（最も避けたい）
        2 => 5, // 2日前
        3 => 3, // 3日前
        4 => 2, // 4日前
        _ => 1, // 5日前以降
      };

      // 過去の配置のペア関係を抽出
      final historyPairRelations = <String, Set<String>>{};
      for (var i = 0; i < historyPairs.length; i++) {
        final members = historyPairs[i]
            .split('-')
            .where((m) => m.isNotEmpty && m != '未設定')
            .toList();
        for (var j = 0; j < members.length; j++) {
          final member = members[j];
          if (!historyPairRelations.containsKey(member)) {
            historyPairRelations[member] = {};
          }
          for (var k = 0; k < members.length; k++) {
            if (k != j) {
              historyPairRelations[member]!.add(members[k]);
            }
          }
        }
      }

      // 過去の担当位置を抽出
      final historyPositions = <String, Set<int>>{};
      for (var i = 0; i < historyPairs.length; i++) {
        final members = historyPairs[i].split('-');
        for (var member in members) {
          if (member.isNotEmpty && member != '未設定') {
            if (!historyPositions.containsKey(member)) {
              historyPositions[member] = {};
            }
            historyPositions[member]!.add(i);
          }
        }
      }

      // ペアの重複をチェック（担当位置に関係なく）
      for (var member in newPairRelations.keys) {
        if (historyPairRelations.containsKey(member)) {
          final newPartners = newPairRelations[member]!;
          final oldPartners = historyPairRelations[member]!;

          // 共通のペア相手を見つける
          final commonPartners = newPartners.intersection(oldPartners);
          for (var partner in commonPartners) {
            // ペアの重複にはより強いペナルティを適用
            score += 15 * weight;
            pairDuplicates++;
            if (enableDebugLog) {
              debugPrint(
                '  ペア重複: $member と $partner が${dayIndex}日前もペア (重み: ${weight}x, ペナルティ: ${15 * weight})',
              );
            }
          }
        }
      }

      // 担当位置の重複をチェック
      for (var member in newPositions.keys) {
        if (historyPositions.containsKey(member)) {
          final newPos = newPositions[member]!;
          final oldPos = historyPositions[member]!;

          // 共通の担当位置を見つける
          final commonPositions = newPos.intersection(oldPos);
          for (var pos in commonPositions) {
            score += 10 * weight;
            positionDuplicates++;
            if (enableDebugLog) {
              debugPrint(
                '  担当位置重複: $member が${dayIndex}日前と同じ担当位置 $pos (重み: ${weight}x)',
              );
            }
          }
        }
      }

      dayIndex++;
    }

    if (enableDebugLog && score > 0) {
      debugPrint(
        'AssignmentBoard: スコア詳細 - 合計: $score, 担当位置重複: $positionDuplicates件, ペア重複: $pairDuplicates件',
      );
    }

    return score;
  }

  Future<void> _shuffleAssignments() async {
    if (teams.length < 2) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: Text(
            'エラー',
            style: TextStyle(
              fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
            ),
          ),
          content: Text(
            'シャッフルするには2つ以上の班が必要です。',
            style: TextStyle(
              fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'OK',
                style: TextStyle(
                  fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                ),
              ),
            ),
          ],
        ),
      );
      return;
    }

    // 既存のシャッフルタイマーをキャンセル
    shuffleTimer?.cancel();

    setState(() => isShuffling = true);

    // シャッフル前に基本構成データを読み込む
    List<Team> basicTeams = [];
    try {
      debugPrint('AssignmentBoard: シャッフル用の基本構成データを読み込み開始');
      final groupProvider = context.read<GroupProvider>();

      if (groupProvider.hasGroup) {
        // グループモード：グループから基本構成を取得
        final group = groupProvider.currentGroup!;
        final groupData = await GroupDataSyncService.getGroupAssignmentBoard(
          group.id,
        );

        if (groupData != null) {
          if (groupData['teams'] != null) {
            final teamsList = groupData['teams'] as List;
            basicTeams = teamsList
                .map((teamMap) => Team.fromMap(teamMap))
                .toList();
          } else {
            // 古い形式の場合
            final aMembers = _safeStringListFromDynamic(groupData['aMembers']);
            final bMembers = _safeStringListFromDynamic(groupData['bMembers']);
            basicTeams = [
              Team(id: 'team_a', name: 'A班', members: aMembers),
              Team(id: 'team_b', name: 'B班', members: bMembers),
            ];
          }
          debugPrint('AssignmentBoard: グループから基本構成を取得しました');
        }
      } else {
        // 個人モード：UserSettingsから基本構成を取得
        final settings = await UserSettingsFirestoreService.getMultipleSettings(
          ['teams', 'assignment_team_a', 'assignment_team_b'],
        );

        final teamsJson = settings['teams'];
        if (teamsJson != null) {
          final teamsList = jsonDecode(teamsJson) as List;
          basicTeams = teamsList
              .map((teamMap) => Team.fromMap(teamMap))
              .toList();
        } else {
          // 古い形式から変換
          final loadedA = settings['assignment_team_a'] ?? [];
          final loadedB = settings['assignment_team_b'] ?? [];
          basicTeams = [
            Team(id: 'team_a', name: 'A班', members: loadedA),
            Team(id: 'team_b', name: 'B班', members: loadedB),
          ];
        }
        debugPrint('AssignmentBoard: ローカルから基本構成を取得しました');
      }

      // 基本構成データが取得できない場合は現在のteamsを使用
      if (basicTeams.isEmpty || basicTeams.length < 2) {
        debugPrint('AssignmentBoard: 基本構成データが不正のため、現在のteamsを使用');
        basicTeams = teams;
      } else {
        debugPrint('AssignmentBoard: 基本構成データを使用してシャッフルを開始');
      }
    } catch (e) {
      debugPrint('AssignmentBoard: 基本構成データの読み込みエラー: $e - 現在のteamsを使用');
      basicTeams = teams;
    }

    int cnt = 0;
    const dur = Duration(milliseconds: 100);
    // 現在画面に表示されている teams を基準にシャッフル
    List<List<String>> shuffledMembers = List.generate(
      teams.length,
      (i) => List.from(teams[i].members),
    );
    shuffleTimer = Timer.periodic(dur, (_) async {
      try {
        for (int i = 0; i < shuffledMembers.length; i++) {
          shuffledMembers[i].shuffle(Random());
        }

        if (cnt % 5 == 0) {
          if (!mounted) return;
          setState(() {
            for (int i = 0; i < teams.length; i++) {
              teams[i] = teams[i].copyWith(
                members: List.from(shuffledMembers[i]),
              );
            }
          });
        }

        if (++cnt >= 50) {
          shuffleTimer?.cancel();

          final today = _todayKey();

          final recentHistory = await _getRecentAssignmentHistory(7);

          debugPrint('AssignmentBoard: 担当履歴を参照してシャッフル開始（過去7日分）');

          List<List<String>> bestShuffledMembers = List.generate(
            teams.length,
            (i) => List.from(shuffledMembers[i]),
          );

          // 現在の配置を使用してteamsを更新してからペアを作成
          for (int i = 0; i < teams.length; i++) {
            teams[i] = teams[i].copyWith(
              members: List.from(shuffledMembers[i]),
            );
          }

          List<String> bestPairs = _makePairs();
          int bestScore = _calculateAssignmentScore(bestPairs, recentHistory);

          int retry = 0;
          const maxRetries = 1000; // より多くの試行でベストな配置を探す

          while (retry < maxRetries) {
            for (int i = 0; i < shuffledMembers.length; i++) {
              shuffledMembers[i].shuffle(Random());
            }

            for (int i = 0; i < teams.length; i++) {
              teams[i] = teams[i].copyWith(
                members: List.from(shuffledMembers[i]),
              );
            }

            final candidatePairs = _makePairs();
            final candidateScore = _calculateAssignmentScore(
              candidatePairs,
              recentHistory,
            );

            if (candidateScore < bestScore) {
              bestPairs = candidatePairs;
              bestScore = candidateScore;
              bestShuffledMembers = List.generate(
                teams.length,
                (i) => List.from(shuffledMembers[i]),
              );
              debugPrint(
                'AssignmentBoard: より良い配置を発見 (スコア: $bestScore, 試行: $retry)',
              );
            }

            if (candidateScore == 0) {
              bestPairs = candidatePairs;
              bestScore = candidateScore;
              bestShuffledMembers = List.generate(
                teams.length,
                (i) => List.from(shuffledMembers[i]),
              );
              debugPrint('AssignmentBoard: 完璧な配置を発見！重複なし (試行: $retry)');
              break;
            }

            retry++;
            await Future.delayed(Duration(milliseconds: 5));
          }

          for (int i = 0; i < teams.length; i++) {
            teams[i] = teams[i].copyWith(
              members: List.from(bestShuffledMembers[i]),
            );
          }

          debugPrint('AssignmentBoard: 最終配置決定 (スコア: $bestScore, 試行回数: $retry)');

          // 最終配置の詳細ログを出力
          if (bestScore > 0) {
            debugPrint('AssignmentBoard: 最終配置の詳細分析:');
            _calculateAssignmentScore(
              bestPairs,
              recentHistory,
              enableDebugLog: true,
            );
          }

          await UserSettingsFirestoreService.saveMultipleSettings({
            'assignment_$today': bestPairs,
            'assignedDate': today,
          });

          setState(() {
            isShuffling = false;
            isAssignedToday = true;
          });

          // シャッフル日付を保存
          await _saveLastShuffleDate();

          try {
            await AssignmentFirestoreService.saveAssignmentHistory(
              dateKey: today,
              assignments: bestPairs,
              leftLabels: leftLabels,
              rightLabels: rightLabels,
            );
            debugPrint('AssignmentBoard: 担当履歴をFirestoreに保存完了');
          } catch (e) {
            debugPrint('AssignmentBoard: 担当履歴のFirestore保存エラー: $e');
          }

          // グループに今日の担当を同期
          _syncTodayAssignmentToGroup(bestPairs);

          // グループに担当履歴を同期
          await _syncAssignmentHistoryToGroup(today, bestPairs);
        }
      } catch (e) {
        debugPrint('AssignmentBoard: シャッフル処理エラー: $e');
        shuffleTimer?.cancel();
        setState(() {
          isShuffling = false;
        });
        if (!mounted) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('シャッフル処理中にエラーが発生しました: $e')));
      }
    });
  }

  /// 開発者モードを読み込み
  Future<void> _loadDeveloperMode() async {
    try {
      final devMode = await UserSettingsFirestoreService.getSetting(
        'developerMode',
        defaultValue: false,
      );
      if (mounted) {
        setState(() {
          isDeveloperMode = devMode;
        });
      }
    } catch (e) {
      debugPrint('AssignmentBoard: 開発者モード読み込みエラー: $e');
    }
  }

  /// 開発者モードの監視を開始
  void _startDeveloperModeListener() {
    _developerModeSubscription?.cancel();
    _developerModeSubscription =
        UserSettingsFirestoreService.watchSettings(['developerMode']).listen((
          settings,
        ) {
          if (mounted && settings.containsKey('developerMode')) {
            setState(() {
              isDeveloperMode = settings['developerMode'] ?? false;
            });
          }
        });
  }

  /// 表示名の変更を監視
  void _startDisplayNameMonitoring() {
    debugPrint('AssignmentBoard: 表示名監視を開始');

    // 定期的に表示名をチェックして更新を検知
    _displayNameSubscription?.cancel();
    _displayNameSubscription = Stream.periodic(Duration(seconds: 10)).listen((
      _,
    ) async {
      if (!mounted) return;

      try {
        final currentDisplayName =
            await FirstLoginService.getCurrentDisplayName();
        final currentUser = FirebaseAuth.instance.currentUser;

        if (currentUser != null && currentDisplayName != null) {
          // 表示名が変更された場合、担当表を再構築
          setState(() {
            // 状態を更新してMemberCardを再描画
          });
          debugPrint('AssignmentBoard: 表示名変更を検知 - 担当表を更新: $currentDisplayName');
        }
      } catch (e) {
        debugPrint('AssignmentBoard: 表示名監視エラー: $e');
      }
    });
  }

  /// 今日の担当をリセット
  Future<void> _resetTodayAssignment() async {
    final today = _todayKey();
    debugPrint('AssignmentBoard: 今日の担当リセット開始 - today: $today');

    // グループ状態でない場合のみローカルデータをリセット
    final currentGroupProvider = context.read<GroupProvider>();
    if (!currentGroupProvider.hasGroup) {
      await UserSettingsFirestoreService.saveMultipleSettings({
        'assignment_$today': null,
        'assignedDate': null,
      });
    }

    // Firestoreからも削除
    try {
      await AssignmentFirestoreService.deleteAssignmentHistory(today);
      debugPrint('AssignmentBoard: Firestoreから今日の担当履歴削除完了');
    } catch (e) {
      debugPrint('AssignmentBoard: Firestoreからの今日の担当履歴削除エラー: $e');
    }

    // グループにも同期（今日の担当データを完全に削除）
    try {
      if (!mounted) return;
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.hasGroup) {
        final group = groupProvider.currentGroup!;
        debugPrint(
          'AssignmentBoard: 今日の担当履歴をグループから削除開始 - groupId: ${group.id}',
        );

        // 今日の担当データを完全に削除（空のマップを送信）
        await GroupDataSyncService.syncTodayAssignment(
          group.id,
          {}, // 空のマップを送信してデータをクリア
        );

        // 担当履歴からも削除
        final assignmentHistoryData = {
          today: {'deleted': true, 'savedAt': DateTime.now().toIso8601String()},
        };

        await GroupDataSyncService.syncAssignmentHistory(
          group.id,
          assignmentHistoryData,
        );
        debugPrint('AssignmentBoard: 今日の担当履歴削除完了');
      }
    } catch (e) {
      debugPrint('AssignmentBoard: グループからの今日の担当履歴削除エラー: $e');
    }

    // グループ状態の場合は、メンバー構成を復元しない（グループデータに任せる）
    if (!mounted) return;
    final groupProvider = context.read<GroupProvider>();
    if (groupProvider.groups.isNotEmpty) {
      debugPrint('AssignmentBoard: グループ状態のため、メンバー構成復元をスキップ');
      if (mounted) {
        setState(() {
          isAssignedToday = false;
        });
      }
    } else {
      // 個人状態の場合は、_loadState()を呼び出してデータを再読み込み
      await _loadState();
    }

    // リセット後の状態を確実にチェックして永続化
    await _verifyResetState();

    debugPrint('AssignmentBoard: 今日の担当リセット完了');
  }

  @override
  void dispose() {
    shuffleTimer?.cancel();
    _dateCheckTimer?.cancel();
    _groupAssignmentSubscription?.cancel();
    _groupSettingsSubscription?.cancel();
    _groupTodayAssignmentSubscription?.cancel();
    _developerModeSubscription?.cancel();
    _groupAttendanceSubscription?.cancel();
    _displayNameSubscription?.cancel();
    _autoSyncTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GroupProvider>(
      builder: (context, groupProvider, child) {
        // リアルタイム権限チェックを実行
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _checkEditPermissionRealtime(groupProvider);
        });

        // グループデータの監視状態を確認
        if (groupProvider.hasGroup && !groupProvider.isWatchingGroupData) {
          // グループデータの監視を開始
          WidgetsBinding.instance.addPostFrameCallback((_) {
            groupProvider.startWatchingGroupData();
          });
        }

        // ローディング条件: データが初期化されていない、またはメンバー・ラベルが空（一人グループは除外）
        final shouldShowLoading =
            _isLoading &&
            !_isSingleMemberGroup() &&
            (!_isDataInitialized ||
                teams.isEmpty ||
                teams.every((t) => t.members.isEmpty) ||
                leftLabels.isEmpty);

        if (shouldShowLoading) {
          return Scaffold(
            backgroundColor: Provider.of<ThemeSettings>(
              context,
            ).backgroundColor,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  LoadingAnimationWidget(width: 200, height: 200),
                  SizedBox(height: 24),
                  Text(
                    '担当表を読み込み中...',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Provider.of<ThemeSettings>(context).fontColor1,
                      fontFamily: Provider.of<ThemeSettings>(
                        context,
                      ).fontFamily,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        final todayIsWeekend = _isWeekend();
        final canShuffleToday = isDeveloperMode || _canShuffleToday();
        final isButtonDisabled =
            (todayIsWeekend && !isDeveloperMode) ||
            isShuffling ||
            !canShuffleToday;

        final themeSettings = Provider.of<ThemeSettings>(context);

        // Web版とスマホ版でUIを分岐
        if (kIsWeb) {
          return _buildWebUI(
            context,
            groupProvider,
            themeSettings,
            isButtonDisabled,
            todayIsWeekend,
          );
        } else {
          return _buildMobileUI(
            context,
            groupProvider,
            themeSettings,
            isButtonDisabled,
            todayIsWeekend,
          );
        }
      },
    );
  }

  /// Web版専用のUIを構築
  Widget _buildWebUI(
    BuildContext context,
    GroupProvider groupProvider,
    ThemeSettings themeSettings,
    bool isButtonDisabled,
    bool todayIsWeekend,
  ) {
    // Web版ではレスポンシブ対応を適用
    if (WebUIUtils.isWeb) {
      return _buildWebResponsiveUI(
        context,
        groupProvider,
        themeSettings,
        isButtonDisabled,
        todayIsWeekend,
      );
    } else {
      // 従来のWeb版UI（後方互換性）
      return _buildWebLegacyUI(
        context,
        groupProvider,
        themeSettings,
        isButtonDisabled,
        todayIsWeekend,
      );
    }
  }

  /// Web版レスポンシブUIを構築
  Widget _buildWebResponsiveUI(
    BuildContext context,
    GroupProvider groupProvider,
    ThemeSettings themeSettings,
    bool isButtonDisabled,
    bool todayIsWeekend,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(Icons.group, color: themeSettings.iconColor),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                '担当表',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: themeSettings.fontFamily,
                  fontSize: (20 * themeSettings.fontSizeScale).clamp(
                    16.0,
                    28.0,
                  ),
                ),
              ),
            ),
            // グループ状態バッジを追加
            if (groupProvider.groups.isNotEmpty)
              Container(
                margin: EdgeInsets.only(left: 12),
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade400),
                ),
                child: Icon(
                  Icons.groups,
                  size: 18,
                  color: Colors.blue.shade700,
                ),
              ),
          ],
        ),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
        actions: [
          if (_canEditAssignment == true) ...[
            IconButton(
              icon: Icon(Icons.person_add),
              tooltip: 'メンバー編集',
              onPressed: () async {
                final currentLeftLabels = List<String>.from(leftLabels);
                final currentRightLabels = List<String>.from(rightLabels);
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MemberEditPage()),
                );
                await _reloadMembersOnly();
                setState(() {
                  leftLabels = currentLeftLabels;
                  rightLabels = currentRightLabels;
                });
              },
            ),
            IconButton(
              icon: Icon(Icons.label),
              tooltip: 'ラベル編集',
              onPressed: () async {
                final currentTeams = List<Team>.from(teams);
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => LabelEditPage()),
                );
                await _reloadLabelsOnly();
                setState(() {
                  teams = currentTeams;
                });
              },
            ),
          ],
          IconButton(
            icon: Icon(Icons.list),
            tooltip: '担当履歴',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => AssignmentHistoryPage()),
              );
            },
          ),
          if (_canEditAssignment == true)
            IconButton(
              icon: Icon(Icons.settings),
              tooltip: '設定',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        SettingsPage(onReset: _resetTodayAssignment),
                  ),
                );
              },
            ),
        ],
      ),
      body: Container(
        color: themeSettings.backgroundColor,
        child: WebUIUtils.responsiveContainer(
          context: context,
          child: SingleChildScrollView(
            padding: WebUIUtils.getResponsivePadding(context),
            child: Column(
              children: [
                SizedBox(height: 24),
                // レスポンシブ対応の担当表レイアウト
                _buildWebResponsiveAssignmentTable(themeSettings),
                SizedBox(height: 40),
                // レスポンシブ対応のボタンレイアウト
                _buildWebResponsiveButtonLayout(
                  isButtonDisabled,
                  todayIsWeekend,
                ),
                SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Web版従来UIを構築（後方互換性）
  Widget _buildWebLegacyUI(
    BuildContext context,
    GroupProvider groupProvider,
    ThemeSettings themeSettings,
    bool isButtonDisabled,
    bool todayIsWeekend,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(Icons.group, color: themeSettings.iconColor),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                '担当表',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: themeSettings.fontFamily,
                  fontSize: (20 * themeSettings.fontSizeScale).clamp(
                    16.0,
                    28.0,
                  ),
                ),
              ),
            ),
            // グループ状態バッジを追加
            if (groupProvider.groups.isNotEmpty)
              Container(
                margin: EdgeInsets.only(left: 12),
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade400),
                ),
                child: Icon(
                  Icons.groups,
                  size: 18,
                  color: Colors.blue.shade700,
                ),
              ),
          ],
        ),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
        actions: [
          if (_canEditAssignment == true) ...[
            IconButton(
              icon: Icon(Icons.person_add),
              tooltip: 'メンバー編集',
              onPressed: () async {
                final currentLeftLabels = List<String>.from(leftLabels);
                final currentRightLabels = List<String>.from(rightLabels);
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MemberEditPage()),
                );
                await _reloadMembersOnly();
                setState(() {
                  leftLabels = currentLeftLabels;
                  rightLabels = currentRightLabels;
                });
              },
            ),
            IconButton(
              icon: Icon(Icons.label),
              tooltip: 'ラベル編集',
              onPressed: () async {
                final currentTeams = List<Team>.from(teams);
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => LabelEditPage()),
                );
                await _reloadLabelsOnly();
                setState(() {
                  teams = currentTeams;
                });
              },
            ),
          ],
          IconButton(
            icon: Icon(Icons.list),
            tooltip: '担当履歴',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => AssignmentHistoryPage()),
              );
            },
          ),
          if (_canEditAssignment == true)
            IconButton(
              icon: Icon(Icons.settings),
              tooltip: '設定',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        SettingsPage(onReset: _resetTodayAssignment),
                  ),
                );
              },
            ),
        ],
      ),
      body: Container(
        color: themeSettings.backgroundColor,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 900), // 内容に合わせた適切な幅 - 拡大版
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(vertical: 24, horizontal: 8),
              child: Column(
                children: [
                  SizedBox(height: 24),
                  // Web版専用の担当表レイアウト
                  _buildWebAssignmentTable(themeSettings),
                  SizedBox(height: 40),
                  // Web版専用のボタンレイアウト
                  _buildWebButtonLayout(isButtonDisabled, todayIsWeekend),
                  SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// スマホ版専用のUIを構築
  Widget _buildMobileUI(
    BuildContext context,
    GroupProvider groupProvider,
    ThemeSettings themeSettings,
    bool isButtonDisabled,
    bool todayIsWeekend,
  ) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(Icons.group, color: themeSettings.iconColor),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                '担当表',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: themeSettings.fontFamily,
                  fontSize: (20 * themeSettings.fontSizeScale).clamp(
                    16.0,
                    28.0,
                  ),
                ),
              ),
            ),
            // グループ状態バッジを追加
            if (groupProvider.groups.isNotEmpty)
              Container(
                margin: EdgeInsets.only(left: 12),
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade400),
                ),
                child: Icon(
                  Icons.groups,
                  size: 18,
                  color: Colors.blue.shade700,
                ),
              ),
          ],
        ),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
        actions: [
          if (_canEditAssignment == true) ...[
            IconButton(
              icon: Icon(Icons.person_add),
              tooltip: 'メンバー編集',
              onPressed: () async {
                final currentLeftLabels = List<String>.from(leftLabels);
                final currentRightLabels = List<String>.from(rightLabels);
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => MemberEditPage()),
                );
                await _reloadMembersOnly();
                setState(() {
                  leftLabels = currentLeftLabels;
                  rightLabels = currentRightLabels;
                });
              },
            ),
            IconButton(
              icon: Icon(Icons.label),
              tooltip: 'ラベル編集',
              onPressed: () async {
                final currentTeams = List<Team>.from(teams);
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => LabelEditPage()),
                );
                await _reloadLabelsOnly();
                setState(() {
                  teams = currentTeams;
                });
              },
            ),
          ],
          IconButton(
            icon: Icon(Icons.list),
            tooltip: '担当履歴',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => AssignmentHistoryPage()),
              );
            },
          ),
          if (_canEditAssignment == true)
            IconButton(
              icon: Icon(Icons.settings),
              tooltip: '設定',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        SettingsPage(onReset: _resetTodayAssignment),
                  ),
                );
              },
            ),
        ],
      ),
      body: Container(
        color: themeSettings.backgroundColor,
        child: SingleChildScrollView(
          padding: EdgeInsets.all(16),
          child: Column(
            children: [
              SizedBox(height: 40), // 上部の余白を増加
              // スマホ版専用の担当表レイアウト
              _buildMobileAssignmentTable(themeSettings),
              SizedBox(height: 40), // 担当表とボタンの間の余白を増加
              // スマホ版専用のボタンレイアウト
              _buildMobileButtonLayout(isButtonDisabled, todayIsWeekend),
              SizedBox(height: 40), // 下部の余白を増加
            ],
          ),
        ),
      ),
    );
  }

  /// Web版専用の担当表テーブル
  Widget _buildWebAssignmentTable(ThemeSettings themeSettings) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 16, horizontal: 32),
      constraints: BoxConstraints(maxWidth: 700), // 内容に合わせた適切な幅 - 拡大版
      decoration: BoxDecoration(
        color: themeSettings.cardBackgroundColor,
        border: Border.all(color: Colors.black26),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Web版ヘッダー行
          Container(
            padding: EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: themeSettings.cardBackgroundColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                SizedBox(width: 150), // 左ラベル用スペース
                ...teams.map<Widget>(
                  (team) => SizedBox(
                    width: 200,
                    child: Center(
                      child: Text(
                        team.name,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24 * themeSettings.fontSizeScale,
                          color: themeSettings.fontColor1,
                          fontFamily: Provider.of<ThemeSettings>(
                            context,
                          ).fontFamily,
                        ),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 150), // 右ラベル用スペース
              ],
            ),
          ),
          SizedBox(height: 8),
          // データ表示部分
          if (_isLoading)
            _buildLoadingWidget(themeSettings)
          else if (_isDataInitialized &&
              _isRemoteSyncCompleted &&
              (_isSingleMemberGroup() ||
                  (leftLabels.isEmpty &&
                      teams.every((t) => t.members.isEmpty))))
            _buildEmptyStateWidget()
          else
            _buildWebDataRows(themeSettings),
        ],
      ),
    );
  }

  /// Web版レスポンシブ対応の担当表テーブル
  Widget _buildWebResponsiveAssignmentTable(ThemeSettings themeSettings) {
    // 解像度判定を一度だけ実行してキャッシュ
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet =
        screenWidth > 768 && screenWidth <= 1400; // iPad解像度を統一（Mini、Air、Pro）
    final isMobile = screenWidth <= 768;
    final isSmallMobile =
        screenWidth <= 480 || MediaQuery.of(context).size.height <= 600;

    // 担当表の横幅を画面幅に応じて動的に設定（はみ出し防止）
    final double dynamicMaxWidth = screenWidth * 0.95; // 画面幅の95%を使用

    // 動的サイズ計算（将来的な拡張用）
    // 現在は固定値を使用し、将来的に画面幅に応じた動的調整を実装予定

    // スマホ版の場合（縦画面最適化）
    if (isMobile) {
      return Container(
        padding: EdgeInsets.symmetric(
          vertical: isSmallMobile ? 8 : 12,
          horizontal: isSmallMobile ? 12 : 16,
        ),
        constraints: BoxConstraints(maxWidth: dynamicMaxWidth), // 画面幅の95%に制限
        decoration: BoxDecoration(
          color: themeSettings.cardBackgroundColor,
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            // スマホ版ヘッダー行（縦スクロール対応）
            Container(
              padding: EdgeInsets.symmetric(vertical: 6, horizontal: 8),
              decoration: BoxDecoration(
                color: themeSettings.backgroundColor.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    SizedBox(width: isSmallMobile ? 60 : 80), // 左ラベル用スペース
                    ...teams.map<Widget>(
                      (team) => Container(
                        width: isSmallMobile ? 70 : 85,
                        margin: EdgeInsets.symmetric(horizontal: 2),
                        child: Center(
                          child: Text(
                            team.name,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize:
                                  (isSmallMobile ? 18 : 20) *
                                  (screenWidth > 1024
                                      ? 1.3
                                      : screenWidth > 768
                                      ? 1.1
                                      : 1.0),
                              color: themeSettings.fontColor1,
                              fontFamily: Provider.of<ThemeSettings>(
                                context,
                              ).fontFamily,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: isSmallMobile ? 60 : 80), // 右ラベル用スペース
                  ],
                ),
              ),
            ),
            SizedBox(height: 4),
            // データ表示部分
            if (_isLoading)
              _buildLoadingWidget(themeSettings)
            else if (_isDataInitialized &&
                _isRemoteSyncCompleted &&
                (_isSingleMemberGroup() ||
                    (leftLabels.isEmpty &&
                        teams.every((t) => t.members.isEmpty))))
              _buildEmptyStateWidget()
            else
              _buildWebResponsiveDataRows(themeSettings),
          ],
        ),
      );
    }
    // タブレット版の場合（横画面最適化）
    else if (isTablet) {
      return Container(
        padding: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
        constraints: BoxConstraints(
          maxWidth:
              700, // 内容に合わせた固定幅（左ラベル100px + メンバーカード180px×2 + 右ラベル100px + パディング等）- 拡大版
        ),
        decoration: BoxDecoration(
          color: themeSettings.cardBackgroundColor,
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          children: [
            // タブレット版ヘッダー行
            Container(
              padding: EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: themeSettings.cardBackgroundColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(width: 100), // 左ラベル用スペース（タブレット版）
                  ...teams.map<Widget>(
                    (team) => SizedBox(
                      width: 180, // iPad解像度統一の列幅（メンバーカードサイズに合わせて調整）- 拡大版
                      child: Center(
                        child: Text(
                          team.name,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 20 * WebUIUtils.getFontSizeScale(context),
                            color: themeSettings.fontColor1,
                            fontFamily: Provider.of<ThemeSettings>(
                              context,
                            ).fontFamily,
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 100), // 右ラベル用スペース（タブレット版）
                ],
              ),
            ),
            SizedBox(height: 6),
            // データ表示部分
            if (_isLoading)
              _buildLoadingWidget(themeSettings)
            else if (_isDataInitialized &&
                _isRemoteSyncCompleted &&
                (_isSingleMemberGroup() ||
                    (leftLabels.isEmpty &&
                        teams.every((t) => t.members.isEmpty))))
              _buildEmptyStateWidget()
            else
              _buildWebResponsiveDataRows(themeSettings),
          ],
        ),
      );
    }
    // デスクトップ版の場合（PCでもタブレットと同じレイアウトを使用）
    else {
      return Container(
        padding: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
        constraints: BoxConstraints(
          maxWidth: 700, // タブレットと同じ固定幅を使用
        ),
        decoration: BoxDecoration(
          color: themeSettings.cardBackgroundColor,
          border: Border.all(color: Colors.black26),
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          children: [
            // PCでもタブレットと同じヘッダー行
            Container(
              padding: EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: themeSettings.cardBackgroundColor,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(width: 100), // 左ラベル用スペース（タブレット版）
                  ...teams.map<Widget>(
                    (team) => SizedBox(
                      width: 180, // iPad解像度統一の列幅（メンバーカードサイズに合わせて調整）- 拡大版
                      child: Center(
                        child: Text(
                          team.name,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 20 * WebUIUtils.getFontSizeScale(context),
                            color: themeSettings.fontColor1,
                            fontFamily: Provider.of<ThemeSettings>(
                              context,
                            ).fontFamily,
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 100), // 右ラベル用スペース（タブレット版）
                ],
              ),
            ),
            SizedBox(height: 6),
            // データ表示部分
            if (_isLoading)
              _buildLoadingWidget(themeSettings)
            else if (_isDataInitialized &&
                _isRemoteSyncCompleted &&
                (_isSingleMemberGroup() ||
                    (leftLabels.isEmpty &&
                        teams.every((t) => t.members.isEmpty))))
              _buildEmptyStateWidget()
            else
              _buildWebResponsiveDataRows(themeSettings),
          ],
        ),
      );
    }
  }

  /// Web版レスポンシブ対応のデータ行
  Widget _buildWebResponsiveDataRows(ThemeSettings themeSettings) {
    // 解像度判定を一度だけ実行してキャッシュ
    final screenWidth = MediaQuery.of(context).size.width;
    // PCでもタブレットレイアウトを使用
    final isTablet = screenWidth > 768; // タブレット解像度以上（PC含む）
    final isMobile = screenWidth <= 768;
    final isSmallMobile =
        screenWidth <= 480 || MediaQuery.of(context).size.height <= 600;

    return Column(
      children: List.generate(
        leftLabels.isNotEmpty
            ? leftLabels.length
            : teams.fold<int>(
                0,
                (max, team) =>
                    team.members.length > max ? team.members.length : max,
              ),
        (i) => Container(
          margin: EdgeInsets.symmetric(vertical: isMobile ? 2 : 4),
          padding: EdgeInsets.symmetric(
            vertical: isMobile ? 6 : 8,
            horizontal: isMobile ? 8 : 16,
          ),
          decoration: BoxDecoration(
            color: i % 2 == 0
                ? themeSettings.backgroundColor.withValues(alpha: 0.3)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(isMobile ? 6 : 8),
          ),
          child: isMobile
              ? _buildMobileDataRow(themeSettings, i, isSmallMobile)
              : _buildDesktopDataRow(themeSettings, i, false, isTablet),
        ),
      ),
    );
  }

  /// スマホ版データ行
  Widget _buildMobileDataRow(
    ThemeSettings themeSettings,
    int i,
    bool isSmallMobile,
  ) {
    // 解像度判定を一度だけ実行してキャッシュ
    final screenWidth = MediaQuery.of(context).size.width;
    // PCでもタブレットレイアウトを使用
    final isTablet = screenWidth > 768; // タブレット解像度以上（PC含む）
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          // 左ラベル
          SizedBox(
            width: isSmallMobile ? 60 : 80,
            child: Text(
              leftLabels.isNotEmpty && i < leftLabels.length
                  ? leftLabels[i]
                  : '',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: (isSmallMobile ? 14 : 16) * (isTablet ? 1.1 : 1.0),
                color: themeSettings.fontColor1,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ),
          // メンバーカード
          ...teams.asMap().entries.map<Widget>((entry) {
            final team = entry.value;
            final memberName =
                i < team.members.length && team.members[i].isNotEmpty
                ? team.members[i]
                : '未設定';

            return Container(
              width: isSmallMobile ? 70 : 85,
              margin: EdgeInsets.symmetric(horizontal: 2),
              child: DragTarget<Map<String, dynamic>>(
                onWillAcceptWithDetails: (details) {
                  // 同じチーム内のみ受け入れる
                  return details.data['teamId'] == team.id &&
                      details.data['fromIndex'] != i;
                },
                onAcceptWithDetails: (details) {
                  final fromIndex = details.data['fromIndex'] as int;
                  _reorderMemberInTeam(team.id, fromIndex, i);
                },
                builder: (context, candidateData, rejectedData) {
                  final isHovering = candidateData.isNotEmpty;
                  return LongPressDraggable<Map<String, dynamic>>(
                    data: {
                      'teamId': team.id,
                      'fromIndex': i,
                      'memberName': memberName,
                    },
                    feedback: Material(
                      color: Colors.transparent,
                      child: Opacity(
                        opacity: 0.7,
                        child: Container(
                          width: isSmallMobile ? 70 : 85,
                          child: MemberCard(
                            name: memberName,
                            attendanceStatus: _getMemberAttendanceStatus(
                              memberName,
                            ),
                            onTap: () {},
                          ),
                        ),
                      ),
                    ),
                    childWhenDragging: Opacity(
                      opacity: 0.3,
                      child: MemberCard(
                        name: memberName,
                        attendanceStatus: _getMemberAttendanceStatus(
                          memberName,
                        ),
                        onTap: () {},
                      ),
                    ),
                    child: Container(
                      decoration: isHovering
                          ? BoxDecoration(
                              border: Border.all(
                                color: themeSettings.iconColor,
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(8),
                            )
                          : null,
                      child: MemberCard(
                        name: memberName,
                        attendanceStatus: _getMemberAttendanceStatus(
                          memberName,
                        ),
                        onTap: () {
                          if (memberName != '未設定') {
                            _showAttendanceDialog(memberName);
                          }
                        },
                      ),
                    ),
                  );
                },
              ),
            );
          }),
          // 右ラベル
          SizedBox(
            width: isSmallMobile ? 60 : 80,
            child: Text(
              rightLabels.isNotEmpty && i < rightLabels.length
                  ? rightLabels[i]
                  : '',
              textAlign: TextAlign.right,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: (isSmallMobile ? 14 : 16) * (isTablet ? 1.1 : 1.0),
                color: themeSettings.fontColor1,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// デスクトップ・タブレット版データ行
  Widget _buildDesktopDataRow(
    ThemeSettings themeSettings,
    int i,
    bool isDesktop,
    bool isTablet,
  ) {
    // 解像度判定を一度だけ実行してキャッシュ
    final screenWidth = MediaQuery.of(context).size.width;
    // PCでもタブレットレイアウトを使用
    final isTabletLocal = screenWidth > 768; // タブレット解像度以上（PC含む）
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // 左ラベル
        SizedBox(
          width: 100, // タブレット版レイアウトを統一使用
          child: Text(
            leftLabels.isNotEmpty && i < leftLabels.length ? leftLabels[i] : '',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize:
                  20 * // タブレット版レイアウトを統一使用
                  (isTabletLocal ? 1.1 : 1.0),
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
        ),
        SizedBox(width: 2), // 左ラベルとメンバーカードの間隔
        // メンバーカード
        ...teams.asMap().entries.map<Widget>((entry) {
          final team = entry.value;
          final memberName =
              i < team.members.length && team.members[i].isNotEmpty
              ? team.members[i]
              : '未設定';

          return Container(
            width: 180, // タブレット版レイアウトを統一使用
            margin: EdgeInsets.symmetric(horizontal: 0), // カード間の間隔を0に調整
            child: Center(
              child: DragTarget<Map<String, dynamic>>(
                onWillAcceptWithDetails: (details) {
                  // 同じチーム内のみ受け入れる
                  return details.data['teamId'] == team.id &&
                      details.data['fromIndex'] != i;
                },
                onAcceptWithDetails: (details) {
                  final fromIndex = details.data['fromIndex'] as int;
                  _reorderMemberInTeam(team.id, fromIndex, i);
                },
                builder: (context, candidateData, rejectedData) {
                  final isHovering = candidateData.isNotEmpty;
                  return LongPressDraggable<Map<String, dynamic>>(
                    data: {
                      'teamId': team.id,
                      'fromIndex': i,
                      'memberName': memberName,
                    },
                    feedback: Material(
                      color: Colors.transparent,
                      child: Opacity(
                        opacity: 0.7,
                        child: Container(
                          width: 180,
                          child: MemberCard(
                            name: memberName,
                            attendanceStatus: _getMemberAttendanceStatus(
                              memberName,
                            ),
                            onTap: () {},
                          ),
                        ),
                      ),
                    ),
                    childWhenDragging: Opacity(
                      opacity: 0.3,
                      child: MemberCard(
                        name: memberName,
                        attendanceStatus: _getMemberAttendanceStatus(
                          memberName,
                        ),
                        onTap: () {},
                      ),
                    ),
                    child: Container(
                      decoration: isHovering
                          ? BoxDecoration(
                              border: Border.all(
                                color: themeSettings.iconColor,
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(8),
                            )
                          : null,
                      child: MemberCard(
                        name: memberName,
                        attendanceStatus: _getMemberAttendanceStatus(
                          memberName,
                        ),
                        onTap: () {
                          if (memberName != '未設定') {
                            _showAttendanceDialog(memberName);
                          }
                        },
                      ),
                    ),
                  );
                },
              ),
            ),
          );
        }),
        SizedBox(width: 2), // メンバーカードと右ラベルの間隔
        // 右ラベル
        SizedBox(
          width: 100, // タブレット版レイアウトを統一使用
          child: Text(
            rightLabels.isNotEmpty && i < rightLabels.length
                ? rightLabels[i]
                : '',
            textAlign: TextAlign.right,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize:
                  20 * // タブレット版レイアウトを統一使用
                  (isTabletLocal ? 1.1 : 1.0),
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
          ),
        ),
      ],
    );
  }

  /// スマホ版専用の担当表テーブル
  Widget _buildMobileAssignmentTable(ThemeSettings themeSettings) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration: BoxDecoration(
        color: themeSettings.cardBackgroundColor,
        border: Border.all(color: Colors.black26),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          // スマホ版ヘッダー行（班名をカードの上に配置）
          Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(width: 60), // 左ラベル用スペース
                // SizedBox(width: 2), // スペーサーを削除（間隔をさらに狭く）
                ...teams.map<Widget>(
                  (team) => Container(
                    width: 85, // カードと同じ幅に調整
                    margin: EdgeInsets.symmetric(horizontal: 1), // 間隔を狭く
                    child: Text(
                      team.name,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16 * themeSettings.fontSizeScale,
                        color: themeSettings.fontColor1,
                        fontFamily: Provider.of<ThemeSettings>(
                          context,
                        ).fontFamily,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                // SizedBox(width: 2), // スペーサーを削除（間隔をさらに狭く）
                SizedBox(width: 60), // 右ラベル用スペース
              ],
            ),
          ),
          // データ表示部分
          if (_isLoading)
            _buildLoadingWidget(themeSettings)
          else if (_isDataInitialized &&
              _isRemoteSyncCompleted &&
              (_isSingleMemberGroup() ||
                  (leftLabels.isEmpty &&
                      teams.every((t) => t.members.isEmpty))))
            _buildEmptyStateWidget()
          else
            _buildMobileDataRows(themeSettings),
        ],
      ),
    );
  }

  /// Web版データ行
  Widget _buildWebDataRows(ThemeSettings themeSettings) {
    return Column(
      children: List.generate(
        leftLabels.isNotEmpty
            ? leftLabels.length
            : teams.fold<int>(
                0,
                (max, team) =>
                    team.members.length > max ? team.members.length : max,
              ),
        (i) => Container(
          margin: EdgeInsets.symmetric(vertical: 8),
          padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          decoration: BoxDecoration(
            color: i % 2 == 0
                ? themeSettings.backgroundColor.withValues(alpha: 0.3)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              // 左ラベル
              SizedBox(
                width: 150,
                child: Text(
                  leftLabels.isNotEmpty && i < leftLabels.length
                      ? leftLabels[i]
                      : '',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18 * themeSettings.fontSizeScale,
                    color: themeSettings.fontColor1,
                    fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                  ),
                ),
              ),
              // メンバーカード
              ...teams.asMap().entries.map<Widget>((entry) {
                final team = entry.value;
                final memberName =
                    i < team.members.length && team.members[i].isNotEmpty
                    ? team.members[i]
                    : '未設定';

                return SizedBox(
                  width: 200,
                  child: Center(
                    child: DragTarget<Map<String, dynamic>>(
                      onWillAcceptWithDetails: (details) {
                        // 同じチーム内のみ受け入れる
                        return details.data['teamId'] == team.id &&
                            details.data['fromIndex'] != i;
                      },
                      onAcceptWithDetails: (details) {
                        final fromIndex = details.data['fromIndex'] as int;
                        _reorderMemberInTeam(team.id, fromIndex, i);
                      },
                      builder: (context, candidateData, rejectedData) {
                        final isHovering = candidateData.isNotEmpty;
                        return LongPressDraggable<Map<String, dynamic>>(
                          data: {
                            'teamId': team.id,
                            'fromIndex': i,
                            'memberName': memberName,
                          },
                          feedback: Material(
                            color: Colors.transparent,
                            child: Opacity(
                              opacity: 0.7,
                              child: Container(
                                width: 200,
                                child: MemberCard(
                                  name: memberName,
                                  attendanceStatus: _getMemberAttendanceStatus(
                                    memberName,
                                  ),
                                  onTap: () {},
                                ),
                              ),
                            ),
                          ),
                          childWhenDragging: Opacity(
                            opacity: 0.3,
                            child: MemberCard(
                              name: memberName,
                              attendanceStatus: _getMemberAttendanceStatus(
                                memberName,
                              ),
                              onTap: () {},
                            ),
                          ),
                          child: Container(
                            decoration: isHovering
                                ? BoxDecoration(
                                    border: Border.all(
                                      color: themeSettings.iconColor,
                                      width: 2,
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  )
                                : null,
                            child: MemberCard(
                              name: memberName,
                              attendanceStatus: _getMemberAttendanceStatus(
                                memberName,
                              ),
                              onTap: () {
                                if (memberName != '未設定') {
                                  _showAttendanceDialog(memberName);
                                }
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                );
              }),
              // 右ラベル
              SizedBox(
                width: 150,
                child: Text(
                  rightLabels.isNotEmpty && i < rightLabels.length
                      ? rightLabels[i]
                      : '',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18 * themeSettings.fontSizeScale,
                    color: themeSettings.fontColor1,
                    fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// スマホ版データ行
  Widget _buildMobileDataRows(ThemeSettings themeSettings) {
    return Column(
      children: List.generate(
        leftLabels.isNotEmpty
            ? leftLabels.length
            : teams.fold<int>(
                0,
                (max, team) =>
                    team.members.length > max ? team.members.length : max,
              ),
        (i) => Padding(
          padding: EdgeInsets.symmetric(vertical: 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (leftLabels.isNotEmpty && i < leftLabels.length)
                Text(
                  leftLabels[i],
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: themeSettings.fontColor1,
                  ),
                ),
              SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: teams.asMap().entries.map((entry) {
                  final team = entry.value;
                  final memberName =
                      i < team.members.length && team.members[i].isNotEmpty
                      ? team.members[i]
                      : '未設定';

                  return SizedBox(
                    width: 120,
                    child: DragTarget<Map<String, dynamic>>(
                      onWillAcceptWithDetails: (details) {
                        // 同じチーム内のみ受け入れる
                        return details.data['teamId'] == team.id &&
                            details.data['fromIndex'] != i;
                      },
                      onAcceptWithDetails: (details) {
                        final fromIndex = details.data['fromIndex'] as int;
                        _reorderMemberInTeam(team.id, fromIndex, i);
                      },
                      builder: (context, candidateData, rejectedData) {
                        final isHovering = candidateData.isNotEmpty;
                        return LongPressDraggable<Map<String, dynamic>>(
                          data: {
                            'teamId': team.id,
                            'fromIndex': i,
                            'memberName': memberName,
                          },
                          feedback: Material(
                            color: Colors.transparent,
                            child: Opacity(
                              opacity: 0.7,
                              child: Container(
                                width: 120,
                                child: MemberCard(
                                  name: memberName,
                                  attendanceStatus: _getMemberAttendanceStatus(
                                    memberName,
                                  ),
                                  onTap: () {},
                                ),
                              ),
                            ),
                          ),
                          childWhenDragging: Opacity(
                            opacity: 0.3,
                            child: MemberCard(
                              name: memberName,
                              attendanceStatus: _getMemberAttendanceStatus(
                                memberName,
                              ),
                              onTap: () {},
                            ),
                          ),
                          child: Container(
                            decoration: isHovering
                                ? BoxDecoration(
                                    border: Border.all(
                                      color: themeSettings.iconColor,
                                      width: 2,
                                    ),
                                    borderRadius: BorderRadius.circular(8),
                                  )
                                : null,
                            child: MemberCard(
                              name: memberName,
                              attendanceStatus: _getMemberAttendanceStatus(
                                memberName,
                              ),
                              onTap: () {
                                if (memberName != '未設定') {
                                  _showAttendanceDialog(memberName);
                                }
                              },
                            ),
                          ),
                        );
                      },
                    ),
                  );
                }).toList(),
              ),
              SizedBox(height: 8),
              if (rightLabels.isNotEmpty && i < rightLabels.length)
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    rightLabels[i],
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: themeSettings.fontColor1,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  /// Web版ボタンレイアウト
  Widget _buildWebButtonLayout(bool isButtonDisabled, bool todayIsWeekend) {
    return Container(
      constraints: BoxConstraints(maxWidth: 600),
      child: Column(
        children: [
          if (_canEditAssignment == true) ...[
            if (isDeveloperMode)
              Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text(
                  'デバッグ: 編集権限=$_canEditAssignment',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                  ),
                ),
              ),
            SizedBox(
              width: 300,
              height: 50,
              child: ElevatedButton(
                onPressed: isButtonDisabled ? null : _shuffleAssignments,
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: Text(
                  () {
                    if (todayIsWeekend && !isDeveloperMode) return '土日は休み';
                    if (isShuffling) return 'シャッフル中...';
                    if (isAssignedToday && !_canShuffleToday())
                      return '本日はシャッフル済み';
                    if (isAssignedToday) return '再度シャッフル';
                    return '今日の担当を決める';
                  }(),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Web版レスポンシブ対応のボタンレイアウト
  Widget _buildWebResponsiveButtonLayout(
    bool isButtonDisabled,
    bool todayIsWeekend,
  ) {
    // PCでもタブレットレイアウトを使用

    return Container(
      constraints: BoxConstraints(maxWidth: 600), // タブレット版レイアウトを統一使用
      child: Column(
        children: [
          if (_canEditAssignment == true) ...[
            if (isDeveloperMode)
              Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text(
                  'デバッグ: 編集権限=$_canEditAssignment',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                  ),
                ),
              ),
            SizedBox(
              width: 300, // タブレット版レイアウトを統一使用
              height: 50,
              child: ElevatedButton(
                onPressed: isButtonDisabled ? null : _shuffleAssignments,
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25), // タブレット版レイアウトを統一使用
                  ),
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
                child: Text(
                  () {
                    if (todayIsWeekend && !isDeveloperMode) return '土日は休み';
                    if (isShuffling) return 'シャッフル中...';
                    if (isAssignedToday && !_canShuffleToday())
                      return '本日はシャッフル済み';
                    if (isAssignedToday) return '再度シャッフル';
                    return '今日の担当を決める';
                  }(),
                  style: TextStyle(
                    fontSize: 16, // タブレット版レイアウトを統一使用
                    fontWeight: FontWeight.bold,
                    fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// スマホ版ボタンレイアウト
  Widget _buildMobileButtonLayout(bool isButtonDisabled, bool todayIsWeekend) {
    return Column(
      children: [
        if (_canEditAssignment == true) ...[
          if (isDeveloperMode)
            Padding(
              padding: EdgeInsets.only(bottom: 8),
              child: Text(
                'デバッグ: 編集権限=$_canEditAssignment',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ),
          ElevatedButton(
            onPressed: isButtonDisabled ? null : _shuffleAssignments,
            child: Text(() {
              if (todayIsWeekend && !isDeveloperMode) return '土日は休み';
              if (isShuffling) return 'シャッフル中...';
              if (isAssignedToday && !_canShuffleToday()) return '本日はシャッフル済み';
              if (isAssignedToday) return '再度シャッフル';
              return '今日の担当を決める';
            }()),
          ),
        ],
      ],
    );
  }

  /// ローディングウィジェット
  Widget _buildLoadingWidget(ThemeSettings themeSettings) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40.0),
      child: Center(
        child: Column(
          children: [
            Lottie.asset(
              'assets/animations/Loading coffee bean.json',
              width: 120,
              height: 120,
              fit: BoxFit.contain,
            ),
            SizedBox(height: 16),
            Text(
              '担当表を読み込み中...',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: themeSettings.fontColor1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 空状態ウィジェット
  Widget _buildEmptyStateWidget() {
    final isSingleMember = _isSingleMemberGroup();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24.0),
      child: Center(
        child: Text(
          isSingleMember ? 'グループに一人しかいないので、担当表は使えません。' : 'メンバーとラベルを追加してください',
          style: TextStyle(
            color: isSingleMember ? Colors.grey[600] : Colors.red,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }

  /// 出勤退勤状態変更ダイアログを表示
  void _showAttendanceDialog(String memberName) {
    // 現在のユーザーが変更しようとしているメンバーと一致するかチェック
    final currentUser = FirebaseAuth.instance.currentUser;
    final currentUserName = currentUser?.displayName ?? '';

    // グループ状態の場合は、グループメンバー情報から現在のユーザー名を取得
    final groupProvider = context.read<GroupProvider>();
    String currentUserNameInGroup = currentUserName;

    if (groupProvider.hasGroup) {
      final currentUserInGroup = groupProvider.currentGroup!.members.firstWhere(
        (member) => member.uid == currentUser?.uid,
        orElse: () => GroupMember(
          uid: '',
          email: '',
          displayName: currentUserName,
          role: GroupRole.member,
          joinedAt: DateTime.now(),
        ),
      );
      currentUserNameInGroup = currentUserInGroup.displayName;
    }

    // 自分以外のメンバーの状態は変更できない
    if (memberName != currentUserNameInGroup) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('変更不可'),
          content: Text('自分の出勤・退勤状態のみ変更できます。\n\n$memberName の状態は変更できません。'),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    final currentStatus = _getMemberAttendanceStatus(memberName);
    final newStatus = currentStatus == AttendanceStatus.present
        ? AttendanceStatus.absent
        : AttendanceStatus.present;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('出勤退勤状態の変更'),
        content: Text(
          '自分の状態を変更しますか？\n\n現在: ${currentStatus == AttendanceStatus.present ? '白カード（出勤）' : '赤カード（退勤）'}\n変更後: ${newStatus == AttendanceStatus.present ? '白カード（出勤）' : '赤カード（退勤）'}',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('キャンセル'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _updateMemberAttendance(memberName, newStatus);
            },
            child: Text('変更'),
          ),
        ],
      ),
    );
  }
}

class MemberCard extends StatefulWidget {
  final String name;
  final AttendanceStatus attendanceStatus;
  final VoidCallback? onTap;
  const MemberCard({
    super.key,
    required this.name,
    this.attendanceStatus = AttendanceStatus.present,
    this.onTap,
  });

  @override
  State<MemberCard> createState() => _MemberCardState();
}

class _MemberCardState extends State<MemberCard> {
  String? _customDisplayName;
  bool _isLoadingDisplayName = true;

  @override
  void initState() {
    super.initState();
    // カスタム表示名の読み込みを非同期で実行（UIのブロックを防ぐ）
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadCustomDisplayName();
    });
    _startDisplayNameMonitoring();
  }

  /// カスタム表示名を読み込み
  Future<void> _loadCustomDisplayName() async {
    try {
      // 現在のユーザーのカスタム表示名を取得
      final customDisplayName = await FirstLoginService.getCurrentDisplayName();

      if (mounted) {
        setState(() {
          _customDisplayName = customDisplayName;
          _isLoadingDisplayName = false;
        });
      }
    } catch (e) {
      debugPrint('MemberCard: カスタム表示名読み込みエラー: $e');
      if (mounted) {
        setState(() {
          _isLoadingDisplayName = false;
        });
      }
    }
  }

  /// 表示名の変更を監視
  void _startDisplayNameMonitoring() {
    // 定期的に表示名をチェック（頻度を下げてパフォーマンス向上）
    Timer.periodic(Duration(seconds: 10), (timer) async {
      if (!mounted) {
        timer.cancel();
        return;
      }

      try {
        final newDisplayName = await FirstLoginService.getCurrentDisplayName();
        if (_customDisplayName != newDisplayName) {
          if (mounted) {
            setState(() {
              _customDisplayName = newDisplayName;
            });
            debugPrint(
              'MemberCard: 表示名変更を検知: $_customDisplayName -> $newDisplayName',
            );
          }
        }
      } catch (e) {
        debugPrint('MemberCard: 表示名監視エラー: $e');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // 画面サイズに基づく解像度判定
    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth > 768; // タブレット解像度以上（PC含む）
    // PCでもタブレットレイアウトを使用

    // 表示名を決定（カスタム表示名を優先）
    String displayName;
    if (widget.name.isEmpty) {
      displayName = '未設定';
    } else if (_isLoadingDisplayName) {
      // 読み込み中でも元の名前を表示（カスタム表示名の読み込み中は非表示）
      displayName = widget.name;
    } else {
      // 現在のユーザーのカードの場合、カスタム表示名を使用
      final currentUser = FirebaseAuth.instance.currentUser;
      final currentUserName = currentUser?.displayName ?? '';

      // グループ状態の場合は、グループメンバー情報から現在のユーザー名を取得
      final groupProvider = context.read<GroupProvider>();
      String currentUserNameInGroup = currentUserName;

      if (groupProvider.hasGroup) {
        final currentUserInGroup = groupProvider.currentGroup!.members
            .firstWhere(
              (member) => member.uid == currentUser?.uid,
              orElse: () => GroupMember(
                uid: '',
                email: '',
                displayName: currentUserName,
                role: GroupRole.member,
                joinedAt: DateTime.now(),
              ),
            );
        currentUserNameInGroup = currentUserInGroup.displayName;
      }

      // 自分のカードかどうかを判定
      final isMyCard = widget.name == currentUserNameInGroup;

      if (isMyCard &&
          _customDisplayName != null &&
          _customDisplayName!.isNotEmpty) {
        displayName = _customDisplayName!;
      } else {
        displayName = widget.name;
      }
    }

    final isUnset = displayName == '未設定';

    // 現在のユーザー名を取得
    final currentUser = FirebaseAuth.instance.currentUser;
    final currentUserName = currentUser?.displayName ?? '';

    // グループ状態の場合は、グループメンバー情報から現在のユーザー名を取得
    final groupProvider = context.read<GroupProvider>();
    String currentUserNameInGroup = currentUserName;

    if (groupProvider.hasGroup) {
      final currentUserInGroup = groupProvider.currentGroup!.members.firstWhere(
        (member) => member.uid == currentUser?.uid,
        orElse: () => GroupMember(
          uid: '',
          email: '',
          displayName: currentUserName,
          role: GroupRole.member,
          joinedAt: DateTime.now(),
        ),
      );
      currentUserNameInGroup = currentUserInGroup.displayName;
    }

    // 自分のカードかどうかを判定
    final isMyCard = displayName == currentUserNameInGroup && !isUnset;

    // 出勤退勤状態に基づいて色を決定
    Color cardColor;
    Color textColor;
    Color borderColor;

    if (isUnset) {
      cardColor = Provider.of<ThemeSettings>(context).cardBackgroundColor;
      textColor = Colors.grey[600]!;
      borderColor = Colors.grey.shade400;
    } else {
      switch (widget.attendanceStatus) {
        case AttendanceStatus.present:
          cardColor = Colors.white; // 白カード（出勤）
          textColor = Colors.black;
          borderColor = isMyCard
              ? Provider.of<ThemeSettings>(context).iconColor
              : Colors.grey.shade400;
          break;
        case AttendanceStatus.absent:
          cardColor = Colors.red.shade600; // 赤カード（退勤）
          textColor = Colors.white;
          borderColor = isMyCard
              ? Provider.of<ThemeSettings>(context).iconColor
              : Colors.red.shade700;
          break;
      }
    }

    // 解像度に応じたサイズ設定
    double cardWidth;
    double cardHeight;
    double fontSize;
    double verticalPadding;
    double horizontalMargin;
    double borderRadius;

    if (isTablet) {
      // iPad解像度統一のサイズ設定（Mini、Air、Pro共通）- 拡大版
      cardWidth = 180; // 140 -> 180 (大きく調整)
      cardHeight = 75; // 60 -> 75 (大きく調整)
      fontSize = 24; // 16 -> 18 (さらに大きく調整)
      verticalPadding = 14; // 10 -> 14 (大きく調整)
      horizontalMargin = 4; // 2 -> 4 (大きく調整)
      borderRadius = 14; // 10 -> 14 (大きく調整)
      // PCでもタブレットレイアウトを使用するため、デスクトップ専用設定は削除
    } else {
      // モバイル版のサイズ設定
      cardWidth = 85;
      cardHeight = 50;
      fontSize = 12;
      verticalPadding = 10;
      horizontalMargin = 2;
      borderRadius = 12;
    }

    return GestureDetector(
      onTap: isUnset ? null : widget.onTap,
      child: Container(
        width: cardWidth,
        height: cardHeight,
        padding: EdgeInsets.symmetric(vertical: verticalPadding),
        margin: EdgeInsets.symmetric(horizontal: horizontalMargin),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(borderRadius),
          border: Border.all(
            color: borderColor,
            width: isMyCard ? 3 : 2, // 自分のカードは太い枠線
          ),
        ),
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              displayName,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.bold,
                color: textColor,
                fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }
}
