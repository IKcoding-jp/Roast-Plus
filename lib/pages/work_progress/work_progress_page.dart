import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';

import '../../models/work_progress_models.dart';
import '../../models/theme_settings.dart';
import '../../utils/theme_font_utils.dart';
import '../../widgets/bean_name_with_sticker.dart';
import 'work_progress_edit_page.dart';
import '../../models/group_provider.dart';
import '../../models/group_models.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:async';

class WorkProgressPage extends StatefulWidget {
  const WorkProgressPage({super.key});

  @override
  State<WorkProgressPage> createState() => _WorkProgressPageState();
}

class _WorkProgressPageState extends State<WorkProgressPage>
    with WidgetsBindingObserver {
  Stream? _groupWorkProgressStream;
  StreamSubscription? _groupWorkProgressSubscription;
  StreamSubscription<DocumentSnapshot>? _settingsSubscription;
  bool _canEdit = true;
  GroupProvider? _groupProvider;
  String? _currentGroupId;
  bool _setupScheduled = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final provider = context.read<GroupProvider>();
    if (_groupProvider != provider) {
      _groupProvider?.removeListener(_onGroupProviderChanged);
      _groupProvider = provider;
      _groupProvider?.addListener(_onGroupProviderChanged);
    }
    // ビルド完了後に初期セットアップを実行
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _setupWorkProgressAndSettingsListener();
      }
    });
  }

  void _setupWorkProgressAndSettingsListener() {
    final groupProvider = context.read<GroupProvider>();
    final workProgressProvider = context.read<WorkProgressProvider>();
    final newGroupId = groupProvider.currentGroup?.id;
    if (_currentGroupId == newGroupId) return;
    _currentGroupId = newGroupId;
    _settingsSubscription?.cancel();
    _groupWorkProgressSubscription?.cancel();

    if (newGroupId != null) {
      _settingsSubscription = FirebaseFirestore.instance
          .collection('groups')
          .doc(newGroupId)
          .snapshots()
          .listen((doc) {
            if (!mounted) return;
            final settings = doc.data()?['settings'];
            if (settings != null && settings['dataPermissions'] != null) {
              final dataPermissions =
                  settings['dataPermissions'] as Map<String, dynamic>;
              final accessStr =
                  dataPermissions['work_progress'] ??
                  dataPermissions['taskStatus'];
              final access = AccessLevel.values.firstWhere(
                (e) => e.name == accessStr,
                orElse: () => AccessLevel.adminLeader,
              );
              final groupRole = groupProvider.getCurrentUserRole();
              if (groupRole != null) {
                bool canEdit = false;
                if (access == AccessLevel.allMembers) {
                  canEdit = true;
                } else if (access == AccessLevel.adminLeader) {
                  canEdit =
                      groupRole == GroupRole.admin ||
                      groupRole == GroupRole.leader;
                } else if (access == AccessLevel.adminOnly) {
                  canEdit = groupRole == GroupRole.admin;
                }
                setState(() {
                  _canEdit = canEdit;
                });
              }
              groupProvider.updateCurrentGroupSettings(settings);
            }
          });

      _groupWorkProgressStream = FirebaseFirestore.instance
          .collection('groups')
          .doc(newGroupId)
          .collection('work_progress')
          .orderBy('createdAt', descending: true)
          .snapshots();
      _groupWorkProgressSubscription = _groupWorkProgressStream!.listen((
        snapshot,
      ) {
        if (!mounted) return;
        final docs = (snapshot as QuerySnapshot).docs;
        final records = docs.map((doc) {
          final data = doc.data() as Map<String, dynamic>;
          data['id'] = doc.id;
          return WorkProgress.fromMap(data);
        }).toList();
        // ビルド中でないことを確認してから更新
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            workProgressProvider.replaceAll(records);
          }
        });
      });
      workProgressProvider.loadWorkProgress(groupId: newGroupId);
    } else {
      workProgressProvider.loadWorkProgress();
    }
  }

  void _onGroupProviderChanged() {
    if (!mounted) return;
    if (_setupScheduled) return;
    _setupScheduled = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _setupScheduled = false;
      if (mounted) {
        _setupWorkProgressAndSettingsListener();
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _groupWorkProgressSubscription?.cancel();
    _settingsSubscription?.cancel();
    _groupProvider?.removeListener(_onGroupProviderChanged);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      final groupProvider = context.read<GroupProvider>();
      final workProgressProvider = context.read<WorkProgressProvider>();
      if (groupProvider.hasGroup) {
        _groupWorkProgressSubscription?.cancel();
        _groupWorkProgressStream = FirebaseFirestore.instance
            .collection('groups')
            .doc(groupProvider.currentGroup!.id)
            .collection('work_progress')
            .orderBy('createdAt', descending: true)
            .snapshots();
        _groupWorkProgressSubscription = _groupWorkProgressStream!.listen((
          snapshot,
        ) {
          if (!mounted) return;
          final docs = (snapshot as QuerySnapshot).docs;
          final records = docs.map((doc) {
            final data = doc.data() as Map<String, dynamic>;
            data['id'] = doc.id;
            return WorkProgress.fromMap(data);
          }).toList();
          // ビルド中でないことを確認してから更新
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              workProgressProvider.replaceAll(records);
            }
          });
        });
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            workProgressProvider.loadWorkProgress(
              groupId: groupProvider.currentGroup!.id,
            );
          }
        });
      } else {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            workProgressProvider.loadWorkProgress();
          }
        });
      }
    }
  }

  String _getStageDisplayName(WorkStage stage) {
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

  String _getStatusDisplayName(WorkStatus status) {
    switch (status) {
      case WorkStatus.before:
        return '前';
      case WorkStatus.inProgress:
        return '途中';
      case WorkStatus.after:
        return '済';
    }
  }

  IconData _getStatusIcon(WorkStatus status, WorkStage stage) {
    switch (status) {
      case WorkStatus.before:
        return Icons.close;
      case WorkStatus.inProgress:
        return Icons.timelapse;
      case WorkStatus.after:
        return _getStageIcon(stage);
    }
  }

  Color _getStatusColor(
    BuildContext context,
    WorkStatus status,
    WorkStage stage,
  ) {
    switch (status) {
      case WorkStatus.before:
        return Colors.grey;
      case WorkStatus.inProgress:
        return Colors.orange;
      case WorkStatus.after:
        return _getStageColor(context, stage);
    }
  }

  Color _getStatusBgColor(
    BuildContext context,
    WorkStatus status,
    WorkStage stage,
  ) {
    switch (status) {
      case WorkStatus.before:
        return Colors.grey.withValues(alpha: 0.08);
      case WorkStatus.inProgress:
        return Colors.orange.withValues(alpha: 0.12);
      case WorkStatus.after:
        return _getStageColor(context, stage).withValues(alpha: 0.18);
    }
  }

  IconData _getStageIcon(WorkStage stage) {
    switch (stage) {
      case WorkStage.handpick:
        return Icons.pan_tool_alt;
      case WorkStage.roast:
        return Icons.local_fire_department;
      case WorkStage.afterPick:
        return Icons.check_circle_outline;
      case WorkStage.mill:
        return Icons.coffee;
      case WorkStage.dripPack:
        return Icons.local_cafe;
      case WorkStage.sticker:
        return Icons.emoji_emotions;
      case WorkStage.threeWayBag:
        return Icons.shopping_bag;
      case WorkStage.packaging:
        return Icons.all_inbox;
      case WorkStage.shipping:
        return Icons.local_shipping;
    }
  }

  Color _getStageColor(BuildContext context, WorkStage stage) {
    switch (stage) {
      case WorkStage.handpick:
        return const Color(0xFFB7C29A);
      case WorkStage.roast:
        return Colors.deepOrange;
      case WorkStage.afterPick:
        return const Color(0xFF6F4E37);
      case WorkStage.mill:
        return const Color(0xFF4B2E19);
      case WorkStage.dripPack:
        final brightness = Theme.of(context).brightness;
        return brightness == Brightness.dark
            ? const Color(0xFFEEEEEE)
            : Colors.white;
      case WorkStage.sticker:
        return const Color(0xFFE5DDBE);
      case WorkStage.threeWayBag:
        return const Color(0xFFC0C0C0);
      case WorkStage.packaging:
        return const Color(0xFFD2B48C);
      case WorkStage.shipping:
        return Colors.blue;
    }
  }

  Color _getStageTextColor(BuildContext context, WorkStage stage) {
    if (stage == WorkStage.dripPack) {
      final brightness = Theme.of(context).brightness;
      return brightness == Brightness.dark ? Colors.black : Colors.black87;
    }
    return _getStageColor(context, stage);
  }

  Widget _buildWebLayout(
    BuildContext context,
    ThemeSettings themeSettings,
    WorkProgressProvider workProgressProvider,
    GroupProvider groupProvider,
    bool canEdit,
  ) {
    if (workProgressProvider.isLoading &&
        workProgressProvider.workProgressList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: themeSettings.iconColor),
            SizedBox(height: 16),
            Text(
              '読み込み中...',
              style: TextStyle(fontSize: 16, color: themeSettings.fontColor1),
            ),
          ],
        ),
      );
    }

    if (workProgressProvider.workProgressList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.work_outline,
              size: 64,
              color: themeSettings.iconColor.withValues(alpha: 0.5),
            ),
            SizedBox(height: 16),
            Text(
              '作業状況記録がありません',
              style: TextStyle(fontSize: 18, color: themeSettings.fontColor1),
            ),
            SizedBox(height: 8),
            if (canEdit)
              Text(
                '右下のボタンから新しい記録を作成してください',
                style: TextStyle(
                  fontSize: 14,
                  color: themeSettings.fontColor1.withValues(alpha: 0.7),
                ),
              ),
          ],
        ),
      );
    }

    final screenWidth = MediaQuery.sizeOf(context).width;
    if (screenWidth <= 600) {
      return _buildMobileLayout(
        themeSettings,
        workProgressProvider,
        groupProvider,
        canEdit,
      );
    }

    final maxWidth = 1000.0;
    final padding = 16.0;
    final spacing = 16.0;

    final availableWidth = (screenWidth - padding * 2).clamp(320.0, maxWidth);
    int columns = 3;
    double cardWidth = (availableWidth - (columns - 1) * spacing) / columns;

    while (columns > 1 && cardWidth < 240) {
      columns--;
      cardWidth = (availableWidth - (columns - 1) * spacing) / columns;
    }

    return SingleChildScrollView(
      padding: EdgeInsets.all(padding),
      child: Center(
        child: SizedBox(
          width: screenWidth > maxWidth ? maxWidth : availableWidth,
          child: columns == 1
              ? Column(
                  mainAxisSize: MainAxisSize.min,
                  children: workProgressProvider.workProgressList
                      .map(
                        (workProgress) => Padding(
                          padding: EdgeInsets.only(bottom: spacing),
                          child: _buildWorkProgressCard(
                            workProgress,
                            themeSettings,
                            groupProvider,
                            canEdit,
                            workProgressProvider,
                          ),
                        ),
                      )
                      .toList(),
                )
              : _buildMasonryLayout(
                  workProgressProvider.workProgressList,
                  themeSettings,
                  groupProvider,
                  canEdit,
                  workProgressProvider,
                  columns: columns,
                  cardWidth: cardWidth,
                  spacing: spacing,
                ),
        ),
      ),
    );
  }

  Widget _buildMasonryLayout(
    List<WorkProgress> workProgressList,
    ThemeSettings themeSettings,
    GroupProvider groupProvider,
    bool canEdit,
    WorkProgressProvider workProgressProvider, {
    int columns = 3,
    double cardWidth = 300.0,
    double spacing = 16.0,
  }) {
    final columnHeights = List<double>.filled(columns, 0);
    final columnChildren = List.generate(columns, (_) => <Widget>[]);

    for (final workProgress in workProgressList) {
      int shortestColumnIndex = 0;
      double minHeight = columnHeights[0];
      for (int i = 1; i < columns; i++) {
        if (columnHeights[i] < minHeight) {
          minHeight = columnHeights[i];
          shortestColumnIndex = i;
        }
      }

      final card = SizedBox(
        width: cardWidth,
        child: _buildWorkProgressCard(
          workProgress,
          themeSettings,
          groupProvider,
          canEdit,
          workProgressProvider,
        ),
      );

      columnChildren[shortestColumnIndex].add(
        Padding(
          padding: EdgeInsets.only(bottom: spacing),
          child: card,
        ),
      );
      columnHeights[shortestColumnIndex] +=
          _estimateCardHeight(workProgress) + spacing;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(columns, (index) {
        return Expanded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: columnChildren[index],
          ),
        );
      }),
    );
  }

  double _estimateCardHeight(WorkProgress workProgress) {
    double height = 120.0; // 基本の高さ

    // メモがある場合は高さを追加
    if (workProgress.notes != null && workProgress.notes!.isNotEmpty) {
      final lines = (workProgress.notes!.length / 30).ceil(); // 1行約30文字と仮定
      height += lines * 20.0; // 1行あたり20px
    }

    // ステータスがある場合は高さを追加
    if (workProgress.stageStatus.isNotEmpty) {
      height += 30.0;
    }

    if (_hasQuantity(workProgress)) {
      height += 24.0;
    }

    return height;
  }

  bool _hasQuantity(WorkProgress workProgress) {
    final unit = workProgress.quantityUnit?.trim() ?? '';
    return workProgress.quantity != null && unit.isNotEmpty;
  }

  String _formatQuantityValue(double quantity) {
    if (quantity % 1 == 0) {
      return quantity.toStringAsFixed(0);
    }
    return quantity.toString();
  }

  Widget _buildQuantityChip(
    String display,
    ThemeSettings themeSettings, {
    double fontSize = 13,
    EdgeInsets padding = const EdgeInsets.symmetric(
      horizontal: 10,
      vertical: 4,
    ),
  }) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: themeSettings.fontColor1.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        display,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          color: themeSettings.fontColor1,
        ),
      ),
    );
  }

  Widget _buildWorkProgressCard(
    WorkProgress workProgress,
    ThemeSettings themeSettings,
    GroupProvider groupProvider,
    bool canEdit,
    WorkProgressProvider workProgressProvider,
  ) {
    final hasNotes =
        workProgress.notes != null && workProgress.notes!.isNotEmpty;
    final hasQuantity = _hasQuantity(workProgress);
    final quantityValue = hasQuantity
        ? _formatQuantityValue(workProgress.quantity!)
        : null;
    final quantityUnit = hasQuantity ? workProgress.quantityUnit! : null;
    final quantityDisplay =
        (hasQuantity && quantityValue != null && quantityUnit != null)
        ? '$quantityValue $quantityUnit'
        : null;

    return Card(
      elevation: 3,
      color: themeSettings.cardBackgroundColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: canEdit && groupProvider.currentGroup != null
            ? () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => WorkProgressEditPage(
                      workProgress: workProgress,
                      groupId: groupProvider.currentGroup!.id,
                    ),
                  ),
                ).then((result) {
                  if (result == true) {
                    workProgressProvider.loadWorkProgress(
                      groupId: groupProvider.currentGroup!.id,
                    );
                  }
                });
              }
            : null,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: BeanNameWithSticker(
                            beanName: workProgress.beanName,
                            textStyle: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: themeSettings.fontColor1,
                            ),
                            stickerSize: 16.0,
                          ),
                        ),
                        if (quantityDisplay != null) ...[
                          SizedBox(width: 6),
                          _buildQuantityChip(quantityDisplay, themeSettings),
                        ],
                      ],
                    ),
                  ),
                  if (canEdit)
                    PopupMenuButton<String>(
                      onSelected: (value) async {
                        if (value == 'edit') {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => WorkProgressEditPage(
                                workProgress: workProgress,
                                groupId: groupProvider.hasGroup
                                    ? groupProvider.currentGroup!.id
                                    : null,
                              ),
                            ),
                          ).then((result) {
                            if (result == true) {
                              if (groupProvider.hasGroup) {
                                workProgressProvider.loadWorkProgress(
                                  groupId: groupProvider.currentGroup!.id,
                                );
                              } else if (groupProvider.groups.isNotEmpty) {
                                workProgressProvider.loadWorkProgress(
                                  groupId: groupProvider.groups.first.id,
                                );
                              } else {
                                workProgressProvider.loadWorkProgress();
                              }
                            }
                          });
                        } else if (value == 'delete') {
                          final confirmed = await showDialog<bool>(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: Text('削除確認'),
                              content: Text('この作業状況記録を削除しますか？'),
                              actions: [
                                TextButton(
                                  onPressed: () =>
                                      Navigator.pop(context, false),
                                  child: Text('キャンセル'),
                                ),
                                TextButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  child: Text('削除'),
                                ),
                              ],
                            ),
                          );

                          if (!mounted) return;

                          if (confirmed == true) {
                            final messenger = ScaffoldMessenger.of(context);
                            try {
                              await workProgressProvider.deleteWorkProgress(
                                workProgress.id,
                                groupId: groupProvider.hasGroup
                                    ? groupProvider.currentGroup!.id
                                    : null,
                              );
                              if (!mounted) return;
                              messenger.showSnackBar(
                                SnackBar(content: Text('削除しました')),
                              );
                            } catch (e) {
                              if (!mounted) return;
                              messenger.showSnackBar(
                                SnackBar(content: Text('削除に失敗しました')),
                              );
                            }
                          }
                        }
                      },
                      itemBuilder: (context) => [
                        PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit, size: 16),
                              SizedBox(width: 8),
                              Text('編集'),
                            ],
                          ),
                        ),
                        PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(
                                Icons.delete,
                                size: 16,
                                color: themeSettings.iconColor,
                              ),
                              SizedBox(width: 8),
                              Text(
                                '削除',
                                style: TextStyle(
                                  color: themeSettings.iconColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      child: Icon(
                        Icons.more_vert,
                        color: themeSettings.iconColor,
                        size: 18,
                      ),
                    ),
                ],
              ),
              SizedBox(height: 8),
              if (workProgress.stageStatus.isNotEmpty) ...[
                Builder(
                  builder: (context) {
                    final stage = workProgress.stageStatus.keys.first;
                    final status = workProgress.stageStatus.values.first;
                    return Container(
                      width: double.infinity,
                      padding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusBgColor(context, status, stage),
                        border: Border.all(
                          color: stage == WorkStage.dripPack
                              ? _getStageTextColor(context, stage)
                              : _getStatusColor(context, status, stage),
                          width: 1,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _getStatusIcon(status, stage),
                            color: stage == WorkStage.dripPack
                                ? _getStageTextColor(context, stage)
                                : _getStatusColor(context, status, stage),
                            size: 18,
                          ),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '${_getStageDisplayName(stage)} ${_getStatusDisplayName(status)}',
                              style: TextStyle(
                                fontSize: 14,
                                color: stage == WorkStage.dripPack
                                    ? _getStageTextColor(context, stage)
                                    : _getStatusColor(context, status, stage),
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
                SizedBox(height: 8),
              ],
              Text(
                '作成日: ${workProgress.createdAt.toString().substring(0, 16)}',
                style: TextStyle(
                  fontSize: 12,
                  color: themeSettings.fontColor1.withValues(alpha: 0.7),
                ),
              ),
              if (hasNotes) ...[
                SizedBox(height: 8),
                Container(
                  padding: EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: themeSettings.fontColor1.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.note,
                        size: 14,
                        color: themeSettings.fontColor1.withValues(alpha: 0.6),
                      ),
                      SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          workProgress.notes!,
                          style: TextStyle(
                            fontSize: 12,
                            color: themeSettings.fontColor1.withValues(
                              alpha: 0.8,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                SizedBox(height: 2),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMobileLayout(
    ThemeSettings themeSettings,
    WorkProgressProvider workProgressProvider,
    GroupProvider groupProvider,
    bool canEdit,
  ) {
    if (workProgressProvider.isLoading &&
        workProgressProvider.workProgressList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: themeSettings.iconColor),
            SizedBox(height: 16),
            Text(
              '読み込み中...',
              style: TextStyle(fontSize: 16, color: themeSettings.fontColor1),
            ),
          ],
        ),
      );
    }

    if (workProgressProvider.workProgressList.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.work_outline,
              size: 64,
              color: themeSettings.iconColor.withValues(alpha: 0.5),
            ),
            SizedBox(height: 16),
            Text(
              '作業状況記録がありません',
              style: TextStyle(fontSize: 18, color: themeSettings.fontColor1),
            ),
            SizedBox(height: 8),
            if (canEdit)
              Text(
                '右下のボタンから新しい記録を作成してください',
                style: TextStyle(
                  fontSize: 14,
                  color: themeSettings.fontColor1.withValues(alpha: 0.7),
                ),
              ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: workProgressProvider.workProgressList.length,
      itemBuilder: (context, index) {
        final workProgress = workProgressProvider.workProgressList[index];
        final hasQuantity = _hasQuantity(workProgress);
        final quantityValue = hasQuantity
            ? _formatQuantityValue(workProgress.quantity!)
            : null;
        final quantityUnit = hasQuantity ? workProgress.quantityUnit! : null;
        final quantityDisplay =
            (hasQuantity && quantityValue != null && quantityUnit != null)
            ? '$quantityValue $quantityUnit'
            : null;
        return Card(
          margin: EdgeInsets.only(bottom: 12),
          elevation: 4,
          color: themeSettings.cardBackgroundColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: InkWell(
            onTap: canEdit && groupProvider.currentGroup != null
                ? () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => WorkProgressEditPage(
                          workProgress: workProgress,
                          groupId: groupProvider.currentGroup!.id,
                        ),
                      ),
                    ).then((result) {
                      if (result == true) {
                        workProgressProvider.loadWorkProgress(
                          groupId: groupProvider.currentGroup!.id,
                        );
                      }
                    });
                  }
                : null,
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            BeanNameWithSticker(
                              beanName: workProgress.beanName,
                              textStyle: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.fontColor1,
                              ),
                              stickerSize: 18.0,
                            ),
                            if (quantityDisplay != null) ...[
                              SizedBox(height: 6),
                              _buildQuantityChip(
                                quantityDisplay,
                                themeSettings,
                                fontSize: 12,
                                padding: EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      if (workProgress.stageStatus.isNotEmpty) ...[
                        SizedBox(width: 8),
                        Builder(
                          builder: (context) {
                            final stage = workProgress.stageStatus.keys.first;
                            final status =
                                workProgress.stageStatus.values.first;
                            return Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: _getStatusBgColor(
                                  context,
                                  status,
                                  stage,
                                ),
                                border: Border.all(
                                  color: stage == WorkStage.dripPack
                                      ? _getStageTextColor(context, stage)
                                      : _getStatusColor(context, status, stage),
                                  width: 1.5,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    _getStatusIcon(status, stage),
                                    color: stage == WorkStage.dripPack
                                        ? _getStageTextColor(context, stage)
                                        : _getStatusColor(
                                            context,
                                            status,
                                            stage,
                                          ),
                                    size: 18,
                                  ),
                                  SizedBox(width: 6),
                                  Text(
                                    '${_getStageDisplayName(stage)} ${_getStatusDisplayName(status)}',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: stage == WorkStage.dripPack
                                          ? _getStageTextColor(context, stage)
                                          : _getStatusColor(
                                              context,
                                              status,
                                              stage,
                                            ),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                      Spacer(),
                      if (canEdit)
                        PopupMenuButton<String>(
                          onSelected: (value) async {
                            if (value == 'edit') {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => WorkProgressEditPage(
                                    workProgress: workProgress,
                                    groupId: groupProvider.hasGroup
                                        ? groupProvider.currentGroup!.id
                                        : null,
                                  ),
                                ),
                              ).then((result) {
                                if (result == true) {
                                  if (groupProvider.hasGroup) {
                                    workProgressProvider.loadWorkProgress(
                                      groupId: groupProvider.currentGroup!.id,
                                    );
                                  } else if (groupProvider.groups.isNotEmpty) {
                                    workProgressProvider.loadWorkProgress(
                                      groupId: groupProvider.groups.first.id,
                                    );
                                  } else {
                                    workProgressProvider.loadWorkProgress();
                                  }
                                }
                              });
                            } else if (value == 'delete') {
                              final confirmed = await showDialog<bool>(
                                context: context,
                                builder: (context) => AlertDialog(
                                  title: Text('削除確認'),
                                  content: Text('この作業状況記録を削除しますか？'),
                                  actions: [
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.pop(context, false),
                                      child: Text('キャンセル'),
                                    ),
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.pop(context, true),
                                      child: Text('削除'),
                                    ),
                                  ],
                                ),
                              );

                              if (!mounted) return;

                              if (confirmed == true) {
                                final messenger = ScaffoldMessenger.of(
                                  this.context,
                                );
                                try {
                                  await workProgressProvider.deleteWorkProgress(
                                    workProgress.id,
                                    groupId: groupProvider.hasGroup
                                        ? groupProvider.currentGroup!.id
                                        : null,
                                  );
                                  if (!mounted) return;
                                  messenger.showSnackBar(
                                    SnackBar(content: Text('削除しました')),
                                  );
                                } catch (e) {
                                  if (!mounted) return;
                                  messenger.showSnackBar(
                                    SnackBar(content: Text('削除に失敗しました')),
                                  );
                                }
                              }
                            }
                          },
                          itemBuilder: (context) => [
                            PopupMenuItem(
                              value: 'edit',
                              child: Row(
                                children: [
                                  Icon(Icons.edit, size: 20),
                                  SizedBox(width: 8),
                                  Text('編集'),
                                ],
                              ),
                            ),
                            PopupMenuItem(
                              value: 'delete',
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.delete,
                                    size: 20,
                                    color: Colors.red,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    '削除',
                                    style: TextStyle(color: Colors.red),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          child: Icon(
                            Icons.more_vert,
                            color: themeSettings.iconColor,
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Text(
                    '作成日: ${workProgress.createdAt.toString().substring(0, 16)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: themeSettings.fontColor1.withValues(alpha: 0.7),
                    ),
                  ),
                  if (workProgress.notes != null &&
                      workProgress.notes!.isNotEmpty) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: themeSettings.fontColor1.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.note,
                            size: 16,
                            color: themeSettings.fontColor1.withValues(
                              alpha: 0.6,
                            ),
                          ),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              workProgress.notes!,
                              style: TextStyle(
                                fontSize: 13,
                                color: themeSettings.fontColor1.withValues(
                                  alpha: 0.8,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
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
    final workProgressProvider = context.watch<WorkProgressProvider>();
    final groupProvider = context.watch<GroupProvider>();

    final canEdit = _canEdit;
    final baseTheme = Theme.of(context);
    final themedData = buildThemeWithFontFamily(baseTheme, themeSettings);

    return Theme(
      data: themedData,
      child: Scaffold(
        appBar: AppBar(
          title: Row(
            children: [
              Text(
                '作業状況記録',
                style: TextStyle(
                  fontFamily: themeSettings.fontFamily,
                  fontSize: (20 * themeSettings.fontSizeScale).clamp(
                    16.0,
                    28.0,
                  ),
                ),
              ),
              Consumer<GroupProvider>(
                builder: (context, groupProvider, _) {
                  if (groupProvider.groups.isNotEmpty) {
                    return Container(
                      margin: EdgeInsets.only(left: 12),
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: themeSettings.iconColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: themeSettings.iconColor),
                      ),
                      child: Icon(
                        Icons.groups,
                        size: 18,
                        color: themeSettings.iconColor,
                      ),
                    );
                  } else {
                    return SizedBox.shrink();
                  }
                },
              ),
            ],
          ),
          backgroundColor: themeSettings.appBarColor,
          foregroundColor: themeSettings.appBarTextColor,
        ),
        body: kIsWeb
            ? _buildWebLayout(
                context,
                themeSettings,
                workProgressProvider,
                groupProvider,
                canEdit,
              )
            : _buildMobileLayout(
                themeSettings,
                workProgressProvider,
                groupProvider,
                canEdit,
              ),
        floatingActionButton: canEdit
            ? FloatingActionButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => WorkProgressEditPage(
                        groupId: groupProvider.currentGroup?.id,
                      ),
                    ),
                  ).then((result) {
                    if (result == true) {
                      if (groupProvider.hasGroup) {
                        workProgressProvider.loadWorkProgress(
                          groupId: groupProvider.currentGroup!.id,
                        );
                      } else if (groupProvider.groups.isNotEmpty) {
                        workProgressProvider.loadWorkProgress(
                          groupId: groupProvider.groups.first.id,
                        );
                      } else {
                        workProgressProvider.loadWorkProgress();
                      }
                    }
                  });
                },
                backgroundColor: themeSettings.buttonColor,
                foregroundColor: themeSettings.fontColor2,
                child: Icon(Icons.add),
              )
            : null,
      ),
    );
  }
}
