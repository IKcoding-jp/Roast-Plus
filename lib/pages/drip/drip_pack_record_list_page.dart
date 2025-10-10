import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'dart:async';
import 'dart:developer' as developer;
import '../../models/theme_settings.dart';
import '../../models/group_provider.dart';
import '../../services/user_settings_firestore_service.dart';
import '../../services/group_data_sync_service.dart';
import '../../utils/permission_utils.dart';

class DripPackRecordListPage extends StatefulWidget {
  const DripPackRecordListPage({super.key});

  @override
  State<DripPackRecordListPage> createState() => _DripPackRecordListPageState();
}

class _DripPackRecordListPageState extends State<DripPackRecordListPage> {
  // ドリップパック記録リスト
  List<Map<String, dynamic>> _records = [];
  final Set<int> _selectedIndexes = {};
  bool _selectionMode = false;
  String? _currentGroupId;
  bool _isGroupMode = false;
  StreamSubscription<Map<String, dynamic>?>? _groupDataSubscription;

  // 検索・フィルター用の状態
  String _searchKeyword = '';
  String? _selectedBean;
  String? _selectedRoast;
  DateTime? _startDate;
  DateTime? _endDate;

  // フィルター折りたたみ状態
  bool _filterExpanded = false;

  // 動的に豆リストを生成
  List<String> get _dynamicBeanList {
    final beans = _records
        .map((r) => r['bean']?.toString() ?? '')
        .where((b) => b.isNotEmpty)
        .toSet()
        .toList();
    beans.sort();
    // 最大50件までに制限
    final limitedBeans = beans.take(50).toList();
    return ['全て', ...limitedBeans];
  }

  // 煎り度リスト
  final List<String> _roastList = ['全て', '浅煎り', '中煎り', '中深煎り', '深煎り'];

  // グループ共有機能用の状態
  bool _canDeleteDripPackRecordsPermission = true;
  bool _isCheckingPermissions = true;

  // リスナー管理用
  GroupProvider? _groupProvider;
  VoidCallback? _groupProviderListener;

  // カードアイテムを構築
  Widget _buildRecordItem(
    Map<String, dynamic> record,
    bool selected,
    int index,
  ) {
    final date = DateTime.tryParse(record['timestamp'] ?? '') ?? DateTime.now();
    final formattedDate = DateFormat('yyyy/MM/dd HH:mm').format(date);

    return Padding(
      padding: EdgeInsets.symmetric(vertical: kIsWeb ? 0 : 8),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: selected
            ? Provider.of<ThemeSettings>(
                context,
              ).buttonColor.withValues(alpha: 0.08)
            : Provider.of<ThemeSettings>(context).cardBackgroundColor,
        child: GestureDetector(
          onTap: null, // タップ機能を無効化
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // アイコン部分
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Provider.of<ThemeSettings>(
                      context,
                    ).iconColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.local_drink,
                    color: Provider.of<ThemeSettings>(context).iconColor,
                    size: 24,
                  ),
                ),
                SizedBox(width: 16),
                // メインコンテンツ部分
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // タイトル部分（豆の種類・煎り度・袋数）
                      Text(
                        '${record['bean'] ?? ''}・${record['roast'] ?? ''}・${record['count'] ?? 0}袋',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Provider.of<ThemeSettings>(context).fontColor1,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 8),
                      // 記録日時
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 16,
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).iconColor,
                          ),
                          SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              formattedDate,
                              style: TextStyle(
                                fontSize: 13,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1.withValues(alpha: 0.7),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // アクションボタン部分
                if (!_selectionMode)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // 削除ボタン
                      if (_canDeleteDripPackRecordsPermission)
                        IconButton(
                          icon: Icon(
                            Icons.delete,
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).iconColor,
                          ),
                          onPressed: () => _deleteRecords([index]),
                          iconSize: 24,
                          padding: EdgeInsets.all(8),
                          tooltip: '削除',
                        ),
                    ],
                  )
                else
                  Checkbox(
                    value: selected,
                    onChanged: (val) => _toggleSelection(index),
                    activeColor: Provider.of<ThemeSettings>(
                      context,
                    ).buttonColor,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // フィルターされた記録を取得
  List<Map<String, dynamic>> _getFilteredRecords() {
    if (_records.isEmpty) return [];
    return _records.where((record) {
      try {
        // 検索キーワード
        if (_searchKeyword.isNotEmpty) {
          final keyword = _searchKeyword.toLowerCase();
          final bean = (record['bean']?.toString() ?? '').toLowerCase();
          final roast = (record['roast']?.toString() ?? '').toLowerCase();
          final count = (record['count']?.toString() ?? '');
          if (!bean.contains(keyword) &&
              !roast.contains(keyword) &&
              !count.contains(keyword)) {
            return false;
          }
        }
        // 豆フィルター
        if (_selectedBean != null &&
            _selectedBean != '全て' &&
            (record['bean']?.toString() ?? '') != _selectedBean) {
          return false;
        }
        // 煎り度フィルター
        if (_selectedRoast != null &&
            _selectedRoast != '全て' &&
            (record['roast']?.toString() ?? '') != _selectedRoast) {
          return false;
        }
        // 日付範囲フィルター
        if (_startDate != null || _endDate != null) {
          final date = DateTime.tryParse(record['timestamp'] ?? '');
          if (date == null) return false;
          if (_startDate != null && date.isBefore(_startDate!)) return false;
          if (_endDate != null && date.isAfter(_endDate!)) return false;
        }
        return true;
      } catch (e) {
        return false;
      }
    }).toList();
  }

  // 記録を削除（単数・複数対応）
  Future<void> _deleteRecords(List<int> indexes) async {
    // 権限チェック
    if (!_canDeleteDripPackRecordsPermission) {
      _showPermissionError();
      return;
    }

    final toRemove = indexes.map((i) => _records[i]).toList();
    final groupProvider = context.read<GroupProvider>();

    for (final record in toRemove) {
      if (_isGroupMode && groupProvider.hasGroup) {
        // グループモードの場合はグループの記録を削除
        final groupId = groupProvider.currentGroup!.id;
        try {
          await GroupDataSyncService.syncDripCounterRecords(groupId, {
            'records': _records.where((r) => r != record).toList(),
          });
        } catch (e) {
          developer.log(
            'グループ同期エラー: $e',
            name: 'DripPackRecordListPage',
            error: e,
          );
          _showPermissionError();
          return;
        }
      } else {
        // ローカルモードの場合はローカルデータを更新
        await UserSettingsFirestoreService.saveSetting(
          'dripPackRecords',
          _records.where((r) => r != record).toList(),
        );
      }
    }

    // UI更新のため、削除されたアイテムを_recordsから除去
    setState(() {
      for (final record in toRemove) {
        _records.remove(record);
      }
      _selectedIndexes.clear();
      _selectionMode = false;
    });
  }

  // 選択状態を切り替え
  void _toggleSelection(int index) {
    setState(() {
      if (_selectedIndexes.contains(index)) {
        _selectedIndexes.remove(index);
      } else {
        _selectedIndexes.add(index);
      }
    });
  }

  // 選択モードを切り替え
  void _toggleSelectionMode() {
    setState(() {
      _selectionMode = !_selectionMode;
      _selectedIndexes.clear();
    });
  }

  // グループ権限チェック（削除）
  bool _canDeleteDripPackRecords(BuildContext context) {
    return _canDeleteDripPackRecordsPermission;
  }

  // 権限エラーメッセージを表示
  void _showPermissionError() {
    final groupProvider = Provider.of<GroupProvider>(context, listen: false);
    final currentGroup = groupProvider.currentGroup;

    String message;
    if (currentGroup == null) {
      message = 'グループに参加していません';
    } else {
      message = '権限がありません';
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: Duration(seconds: 2),
      ),
    );
  }

  // グループデータの変更を監視
  void _setupGroupDataListener() {
    developer.log('ドリップパック記録グループデータリスナーを設定開始', name: 'DripPackRecordListPage');

    // GroupProviderの変更を監視
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;

      try {
        final groupProvider = context.read<GroupProvider>();
        _groupProvider = groupProvider;

        // 初回の権限チェックを実行
        if (groupProvider.hasGroup) {
          developer.log('初回権限チェックを実行', name: 'DripPackRecordListPage');
          _checkEditPermissions();
        }

        // GroupProviderの変更を監視
        _groupProviderListener = () {
          if (!mounted) return;

          developer.log('GroupProviderの変更を検知', name: 'DripPackRecordListPage');

          // グループ設定の変更を検知するため、常に権限チェックを実行
          _checkEditPermissions();
        };

        groupProvider.addListener(_groupProviderListener!);
      } catch (e) {
        developer.log(
          'ドリップパック記録グループデータリスナー設定エラー: $e',
          name: 'DripPackRecordListPage',
          error: e,
        );
      }
    });

    developer.log('ドリップパック記録グループデータリスナー設定完了', name: 'DripPackRecordListPage');
  }

  // 編集権限をチェック
  Future<void> _checkEditPermissions() async {
    try {
      final groupProvider = context.read<GroupProvider>();
      if (groupProvider.hasGroup) {
        developer.log(
          'ドリップパック記録権限チェック開始 - グループID: ${groupProvider.currentGroup!.id}',
          name: 'DripPackRecordListPage',
        );

        final canDelete = await PermissionUtils.canDeleteDataType(
          groupId: groupProvider.currentGroup!.id,
          dataType: 'dripCounter',
        );

        developer.log(
          'ドリップパック記録権限チェック結果 - 削除: $canDelete',
          name: 'DripPackRecordListPage',
        );

        setState(() {
          _canDeleteDripPackRecordsPermission = canDelete;
          _isCheckingPermissions = false;
        });
      } else {
        developer.log(
          'グループに参加していないため、削除権限を有効化',
          name: 'DripPackRecordListPage',
        );
        setState(() {
          _canDeleteDripPackRecordsPermission = true;
          _isCheckingPermissions = false;
        });
      }
    } catch (e) {
      developer.log(
        'ドリップパック記録権限チェックエラー: $e',
        name: 'DripPackRecordListPage',
        error: e,
      );
      setState(() {
        _canDeleteDripPackRecordsPermission = false;
        _isCheckingPermissions = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _filterExpanded = false;
    _loadRecords();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _setupGroupDataListener();
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _checkGroupChange();
  }

  /// グループ変更をチェックして、必要に応じてデータをクリア
  void _checkGroupChange() {
    final groupProvider = Provider.of<GroupProvider>(context, listen: false);
    final currentGroupId = groupProvider.hasGroup
        ? groupProvider.currentGroup!.id
        : null;

    // グループが変更された場合、データを再読み込み
    if (_currentGroupId != null && _currentGroupId != currentGroupId) {
      // グループ変更を検知

      // 1. 既存のリスナーを停止
      _groupDataSubscription?.cancel();
      _groupDataSubscription = null;

      // 2. データをクリア
      setState(() {
        _records = [];
        _isCheckingPermissions = true;
        _isGroupMode = false;
      });

      // 3. ローカルデータをクリア
      _clearLocalData();

      // 4. 新しいグループのデータを読み込み
      _loadRecords();

      // 5. 新しいグループのリスナーを開始
      _startGroupDataListener();
    }

    _currentGroupId = currentGroupId;
  }

  Future<void> _loadRecords() async {
    setState(() {
      _isCheckingPermissions = true;
    });

    try {
      final groupProvider = Provider.of<GroupProvider>(context, listen: false);

      if (groupProvider.hasGroup) {
        // グループモード：グループの共有データを取得
        final groupId = groupProvider.currentGroup!.id;
        // グループデータ読み込み開始

        final groupData = await GroupDataSyncService.getGroupDripCounterRecords(
          groupId,
        );

        if (mounted) {
          if (groupData != null && groupData['records'] != null) {
            setState(() {
              _records = List<Map<String, dynamic>>.from(groupData['records']);
              _isGroupMode = true;
              _isCheckingPermissions = false;
            });
            // グループデータ読み込み完了
          } else {
            // グループデータがない場合は空の状態を設定
            setState(() {
              _records = [];
              _isGroupMode = true;
              _isCheckingPermissions = false;
            });
            // グループデータが存在しません
          }
        }
      } else {
        // ローカルモード：ローカルデータを取得
        // ローカルデータ読み込み開始
        await _loadLocalRecords();
      }
    } catch (e) {
      // ドリップパック記録読み込みエラー
      // エラー時はローカルデータを取得
      if (mounted) {
        await _loadLocalRecords();
      }
    }
  }

  /// ローカル記録を読み込み
  Future<void> _loadLocalRecords() async {
    final saved = await UserSettingsFirestoreService.getSetting(
      'dripPackRecords',
    );
    if (saved != null) {
      setState(() {
        _records = List<Map<String, dynamic>>.from(saved);
        _isGroupMode = false;
        _isCheckingPermissions = false;
      });
    } else {
      setState(() {
        _records = [];
        _isGroupMode = false;
        _isCheckingPermissions = false;
      });
    }
  }

  /// ローカルデータをクリア
  Future<void> _clearLocalData() async {
    try {
      await UserSettingsFirestoreService.deleteSetting('dripPackRecords');
      // ローカルデータをクリア完了
    } catch (e) {
      // ローカルデータのクリアに失敗
    }
  }

  /// グループデータの変更を監視
  void _startGroupDataListener() {
    final groupProvider = Provider.of<GroupProvider>(context, listen: false);

    if (groupProvider.hasGroup) {
      final groupId = groupProvider.currentGroup!.id;

      // グループデータリスナー開始

      // 既存のリスナーを停止
      _groupDataSubscription?.cancel();
      _groupDataSubscription = null;

      // 新しいリスナーを開始
      _groupDataSubscription =
          GroupDataSyncService.watchGroupDripCounterRecords(groupId).listen(
            (groupData) {
              if (mounted) {
                // グループデータ受信

                if (groupData != null && groupData['records'] != null) {
                  setState(() {
                    _records = List<Map<String, dynamic>>.from(
                      groupData['records'],
                    );
                    _isGroupMode = true;
                    _isCheckingPermissions = false;
                  });
                  // グループデータの変更を検知
                } else {
                  // グループデータがない場合は空の状態を設定
                  setState(() {
                    _records = [];
                    _isGroupMode = true;
                    _isCheckingPermissions = false;
                  });
                  // グループデータが空です
                }
              }
            },
            onError: (error) {
              // グループデータ監視エラー
            },
          );
    } else {
      // グループに参加していないため、リスナーを開始しません
    }
  }

  @override
  void dispose() {
    // グループプロバイダーのリスナーを削除
    if (_groupProvider != null && _groupProviderListener != null) {
      try {
        _groupProvider!.removeListener(_groupProviderListener!);
      } catch (e) {
        developer.log(
          'ドリップパック記録リスナー削除エラー: $e',
          name: 'DripPackRecordListPage',
          error: e,
        );
      }
    }

    _groupDataSubscription?.cancel();
    super.dispose();
  }

  // フィルタードロップダウンを構築
  Widget _buildFilterDropdown({
    required String value,
    required List<String> items,
    required String label,
    required Function(String?) onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xFF795548).withValues(alpha: 0.3)),
      ),
      child: DropdownButtonFormField<String>(
        initialValue: value,
        items: items
            .map(
              (item) => DropdownMenuItem(
                value: item,
                child: Text(
                  item.length > 20 ? '${item.substring(0, 20)}…' : item,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            )
            .toList(),
        onChanged: onChanged,
        decoration: InputDecoration(
          labelText: label,
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          labelStyle: TextStyle(color: Color(0xFF795548)),
        ),
      ),
    );
  }

  // 日付ピッカーを構築
  Widget _buildDatePicker({
    required String label,
    required DateTime? date,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Color(0xFF795548).withValues(alpha: 0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF795548),
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 4),
            Text(
              date != null ? DateFormat('yyyy/MM/dd').format(date) : '',
              style: TextStyle(
                fontSize: 14,
                color: date != null ? Color(0xFF2C1D17) : Colors.grey[400],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GroupProvider>(
      builder: (context, groupProvider, child) {
        _records = _records; // データ更新をトリガー
        final filteredRecords = _getFilteredRecords();

        return Scaffold(
          appBar: AppBar(
            title: Row(
              children: [
                Text('ドリップパック記録一覧'),
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
            actions: [
              // 編集・削除権限がある場合のみ選択ボタンを表示
              if (_canDeleteDripPackRecordsPermission)
                IconButton(
                  icon: Icon(_selectionMode ? Icons.close : Icons.select_all),
                  onPressed: _toggleSelectionMode,
                ),
              if (_selectionMode &&
                  _selectedIndexes.isNotEmpty &&
                  _canDeleteDripPackRecords(context))
                IconButton(
                  icon: Icon(Icons.delete),
                  onPressed: () => _deleteRecords(_selectedIndexes.toList()),
                ),
            ],
          ),
          body: _isCheckingPermissions || (_records.isEmpty && !_isGroupMode)
              ? Center(
                  child: _isCheckingPermissions
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Provider.of<ThemeSettings>(context).buttonColor,
                              ),
                            ),
                            SizedBox(height: 16),
                            Text(
                              'Loading...',
                              style: TextStyle(
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.local_drink,
                              size: 64,
                              color: Provider.of<ThemeSettings>(
                                context,
                              ).iconColor,
                            ),
                            SizedBox(height: 16),
                            Text(
                              '記録がありません',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              '新しい記録を追加してください',
                              style: TextStyle(
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1.withValues(alpha: 0.7),
                              ),
                            ),
                          ],
                        ),
                )
              : Container(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  child: Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        maxWidth: kIsWeb ? 1000 : double.infinity,
                      ),
                      child: Column(
                        children: [
                          // 検索・フィルターカード
                          Card(
                            margin: EdgeInsets.all(16),
                            elevation: 6,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).cardBackgroundColor,
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // タイトル部分
                                  GestureDetector(
                                    onTap: () => setState(
                                      () => _filterExpanded = !_filterExpanded,
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          Icons.search,
                                          color: Provider.of<ThemeSettings>(
                                            context,
                                          ).iconColor,
                                          size: 24,
                                        ),
                                        SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            '検索・フィルター',
                                            style: TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: Provider.of<ThemeSettings>(
                                                context,
                                              ).fontColor1,
                                            ),
                                          ),
                                        ),
                                        Icon(
                                          _filterExpanded
                                              ? Icons.expand_less
                                              : Icons.expand_more,
                                          color: Provider.of<ThemeSettings>(
                                            context,
                                          ).iconColor,
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (_filterExpanded) ...[
                                    SizedBox(height: 16),
                                    // 検索バー
                                    Container(
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade50,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(
                                          color: Colors.grey.shade300,
                                        ),
                                      ),
                                      child: TextField(
                                        decoration: InputDecoration(
                                          hintText: 'キーワード検索',
                                          prefixIcon: Icon(
                                            Icons.search,
                                            color: Provider.of<ThemeSettings>(
                                              context,
                                            ).iconColor,
                                          ),
                                          border: InputBorder.none,
                                          contentPadding: EdgeInsets.symmetric(
                                            horizontal: 14,
                                            vertical: 12,
                                          ),
                                        ),
                                        onChanged: (v) =>
                                            setState(() => _searchKeyword = v),
                                      ),
                                    ),
                                    SizedBox(height: 14),
                                    // フィルター行
                                    Row(
                                      children: [
                                        Flexible(
                                          flex: 3,
                                          child: _buildFilterDropdown(
                                            value: _selectedBean ?? '全て',
                                            items: _dynamicBeanList,
                                            label: '豆の種類',
                                            onChanged: (v) => setState(
                                              () => _selectedBean = v,
                                            ),
                                          ),
                                        ),
                                        SizedBox(width: 10),
                                        Flexible(
                                          flex: 2,
                                          child: _buildFilterDropdown(
                                            value: _selectedRoast ?? '全て',
                                            items: _roastList,
                                            label: '煎り度',
                                            onChanged: (v) => setState(
                                              () => _selectedRoast = v,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 14),
                                    // 日付フィルター
                                    Row(
                                      children: [
                                        Expanded(
                                          child: _buildDatePicker(
                                            label: '開始日',
                                            date: _startDate,
                                            onTap: () async {
                                              final picked =
                                                  await showDatePicker(
                                                    context: context,
                                                    initialDate:
                                                        _startDate ??
                                                        DateTime.now(),
                                                    firstDate: DateTime(2020),
                                                    lastDate: DateTime(2100),
                                                  );
                                              if (picked != null) {
                                                setState(
                                                  () => _startDate = picked,
                                                );
                                              }
                                            },
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        Text(
                                          '~',
                                          style: TextStyle(
                                            color: Provider.of<ThemeSettings>(
                                              context,
                                            ).fontColor1,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: _buildDatePicker(
                                            label: '終了日',
                                            date: _endDate,
                                            onTap: () async {
                                              final picked =
                                                  await showDatePicker(
                                                    context: context,
                                                    initialDate:
                                                        _endDate ??
                                                        DateTime.now(),
                                                    firstDate: DateTime(2020),
                                                    lastDate: DateTime(2100),
                                                  );
                                              if (picked != null) {
                                                setState(
                                                  () => _endDate = picked,
                                                );
                                              }
                                            },
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 14),
                                    // リセットボタン
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: ElevatedButton.icon(
                                        icon: Icon(Icons.refresh, size: 18),
                                        label: Text('リセット'),
                                        onPressed: () {
                                          setState(() {
                                            _searchKeyword = '';
                                            _selectedBean = null;
                                            _selectedRoast = null;
                                            _startDate = null;
                                            _endDate = null;
                                          });
                                        },
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              Provider.of<ThemeSettings>(
                                                context,
                                              ).buttonColor,
                                          foregroundColor:
                                              Provider.of<ThemeSettings>(
                                                context,
                                              ).fontColor2,
                                          padding: EdgeInsets.symmetric(
                                            horizontal: 16,
                                            vertical: 12,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                          elevation: 4,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),

                          // 記録リスト
                          Expanded(
                            child: _records.isEmpty
                                ? Center(
                                    child: Card(
                                      elevation: 6,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      color: Provider.of<ThemeSettings>(
                                        context,
                                      ).cardBackgroundColor,
                                      child: Padding(
                                        padding: const EdgeInsets.all(40),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.local_drink,
                                              size: 64,
                                              color: Provider.of<ThemeSettings>(
                                                context,
                                              ).iconColor,
                                            ),
                                            SizedBox(height: 16),
                                            Text(
                                              '記録がありません',
                                              style: TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1,
                                              ),
                                            ),
                                            SizedBox(height: 8),
                                            Text(
                                              _isGroupMode
                                                  ? 'グループメンバーが記録を追加すると表示されます'
                                                  : '新しい記録を追加してください',
                                              style: TextStyle(
                                                color: Colors.grey[600],
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  )
                                : filteredRecords.isEmpty
                                ? Center(
                                    child: Card(
                                      elevation: 6,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      color: Provider.of<ThemeSettings>(
                                        context,
                                      ).cardBackgroundColor,
                                      child: Padding(
                                        padding: const EdgeInsets.all(40),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.search_off,
                                              size: 64,
                                              color: Provider.of<ThemeSettings>(
                                                context,
                                              ).iconColor,
                                            ),
                                            SizedBox(height: 16),
                                            Text(
                                              '条件に合う記録がありません',
                                              style: TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1,
                                              ),
                                            ),
                                            SizedBox(height: 8),
                                            Text(
                                              '検索条件を変更してください',
                                              style: TextStyle(
                                                color: Colors.grey[600],
                                              ),
                                              textAlign: TextAlign.center,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  )
                                : _buildResponsiveRecordList(
                                    filteredRecords,
                                    context,
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
        );
      },
    );
  }

  // レスポンシブなレコードリストを構築
  Widget _buildResponsiveRecordList(
    List<Map<String, dynamic>> filteredRecords,
    BuildContext context,
  ) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobileWidth = screenWidth < 768; // スマホ解像度の判定（768px未満）

    if (isMobileWidth) {
      // スマホ解像度の場合は1列のリストビュー
      return ListView.builder(
        padding: EdgeInsets.only(
          left: 8,
          right: 8,
          bottom: MediaQuery.of(context).padding.bottom + 16,
        ),
        itemCount: filteredRecords.length,
        physics: AlwaysScrollableScrollPhysics(),
        itemBuilder: (context, index) {
          final record = filteredRecords[index];
          final selected = _selectedIndexes.contains(_records.indexOf(record));
          return _buildRecordItem(record, selected, _records.indexOf(record));
        },
      );
    } else {
      // デスクトップ解像度の場合は3列のグリッドビュー
      return GridView.builder(
        padding: EdgeInsets.only(
          left: 8,
          right: 8,
          bottom: MediaQuery.of(context).padding.bottom + 16,
        ),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          mainAxisExtent: 110,
        ),
        itemCount: filteredRecords.length,
        itemBuilder: (context, index) {
          final record = filteredRecords[index];
          final selected = _selectedIndexes.contains(_records.indexOf(record));
          return _buildRecordItem(record, selected, _records.indexOf(record));
        },
      );
    }
  }
}
