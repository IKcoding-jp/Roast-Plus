import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:async';
import 'package:roastplus/models/roast_record.dart';
import 'package:roastplus/services/roast_record_firestore_service.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../models/group_provider.dart';
import '../../widgets/bean_name_with_sticker.dart';

class RoastAnalysisPage extends StatelessWidget {
  const RoastAnalysisPage({super.key});

  int _parseTimeToSeconds(String time) {
    final parts = time.split(':');
    if (parts.length != 2) return 0;
    final min = int.tryParse(parts[0]) ?? 0;
    final sec = int.tryParse(parts[1]) ?? 0;
    return min * 60 + sec;
  }

  String _formatSeconds(int seconds) {
    final min = (seconds ~/ 60).toString().padLeft(2, '0');
    final sec = (seconds % 60).toString().padLeft(2, '0');
    return '$min:$sec';
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    // スマホならカラム幅を均等、タブレットなら少し余裕を持たせる
    final isWide = width > 600;
    final isMobile = width < 400;
    List<double> colFlex;
    if (isWide) {
      colFlex = [1.5, 2, 1.5, 1];
    } else if (isMobile) {
      colFlex = [1.0, 1.2, 1.2, 0.8];
    } else {
      colFlex = [2, 2.5, 2, 1.5];
    }
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Icon(
              Icons.analytics,
              color: Provider.of<ThemeSettings>(context).iconColor,
            ),
            SizedBox(width: 8),
            Text(
              '焙煎分析',
              style: TextStyle(
                fontFamily: Provider.of<ThemeSettings>(context).fontFamily,
                fontSize:
                    (20 * Provider.of<ThemeSettings>(context).fontSizeScale)
                        .clamp(16.0, 28.0),
              ),
            ),
          ],
        ),
        backgroundColor: Provider.of<ThemeSettings>(context).appBarColor,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: kIsWeb ? 1000 : double.infinity,
            ),
            child: Consumer<GroupProvider>(
              builder: (context, groupProvider, child) {
                // グループに参加している場合はグループの記録も取得
                Stream<List<RoastRecord>> recordsStream;
                if (groupProvider.groups.isNotEmpty) {
                  // 個人の記録とグループの記録を結合
                  final personalStream =
                      RoastRecordFirestoreService.getRecordsStream();
                  final groupStream =
                      RoastRecordFirestoreService.getGroupRecordsStream(
                        groupProvider.groups.first.id,
                      );

                  // 両方のストリームを監視して結合
                  recordsStream = personalStream
                      .asBroadcastStream()
                      .map((personalRecords) {
                        return personalRecords;
                      })
                      .asyncMap((personalRecords) async {
                        final groupRecords = await groupStream.first;
                        // 重複を避けるため、IDでフィルタリング
                        final personalIds = personalRecords
                            .map((r) => r.id)
                            .toSet();
                        final uniqueGroupRecords = groupRecords
                            .where((r) => !personalIds.contains(r.id))
                            .toList();
                        return [...personalRecords, ...uniqueGroupRecords];
                      });
                } else {
                  // グループに参加していない場合は個人の記録のみ
                  recordsStream =
                      RoastRecordFirestoreService.getRecordsStream();
                }

                return StreamBuilder<List<RoastRecord>>(
                  stream: recordsStream,
                  builder: (context, snapshot) {
                    if (snapshot.hasError) {
                      return Center(child: Text('エラーが発生しました'));
                    }
                    if (snapshot.connectionState == ConnectionState.waiting) {
                      return Center(child: CircularProgressIndicator());
                    }

                    final records = snapshot.data ?? [];
                    if (records.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.coffee,
                              size: 64,
                              color: Provider.of<ThemeSettings>(
                                context,
                              ).iconColor,
                            ),
                            SizedBox(height: 16),
                            Text(
                              '焙煎記録がありません',
                              style: TextStyle(
                                fontSize: 18,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    // 豆の種類ごとにグループ化
                    final Map<String, List<RoastRecord>> beanGroups = {};
                    for (final r in records) {
                      beanGroups.putIfAbsent(r.bean, () => []).add(r);
                    }
                    // 表示順を指定
                    final List<String> preferredOrder = [
                      'ブラジル',
                      'コロンビア',
                      'エチオピア',
                      'ペルー',
                    ];
                    final List<String> beanNames = [];
                    for (final name in preferredOrder) {
                      if (beanGroups.containsKey(name)) beanNames.add(name);
                    }
                    for (final name in beanGroups.keys) {
                      if (!preferredOrder.contains(name)) beanNames.add(name);
                    }

                    return SingleChildScrollView(
                      padding: EdgeInsets.only(
                        left: 16,
                        right: 16,
                        top: 16,
                        bottom: MediaQuery.of(context).padding.bottom + 16,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Center(
                            child: ConstrainedBox(
                              constraints: BoxConstraints(
                                maxWidth: isMobile ? width - 32 : 700,
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Provider.of<ThemeSettings>(context)
                                          .iconColor
                                          .withValues(
                                            alpha: 0.12,
                                          ), // テーマのアイコン色を薄く反映
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(
                                      Icons.analytics,
                                      color: Provider.of<ThemeSettings>(
                                        context,
                                      ).iconColor,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      '豆の種類ごとに平均焙煎時間を表示',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontColor1,
                                        fontFamily: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontFamily,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          ...beanNames.map((bean) {
                            final beanRecords = beanGroups[bean]!;
                            // (重さ,煎り度)ごとにグループ化
                            final Map<String, List<RoastRecord>> group = {};
                            for (final r in beanRecords) {
                              final key = '${r.weight}|${r.roast}';
                              group.putIfAbsent(key, () => []).add(r);
                            }
                            // ソート用: 煎り度の順序リスト
                            final roastOrder = ['浅煎り', '中煎り', '中深煎り', '深煎り'];
                            final sortedEntries = group.entries.toList()
                              ..sort((a, b) {
                                final aParts = a.key.split('|');
                                final bParts = b.key.split('|');
                                final aWeight = int.tryParse(aParts[0]) ?? 0;
                                final bWeight = int.tryParse(bParts[0]) ?? 0;
                                if (aWeight != bWeight) {
                                  return aWeight.compareTo(bWeight);
                                }
                                final aRoast = aParts[1];
                                final bRoast = bParts[1];
                                final aRoastIdx = roastOrder.indexOf(aRoast);
                                final bRoastIdx = roastOrder.indexOf(bRoast);
                                return aRoastIdx.compareTo(bRoastIdx);
                              });
                            final rows = sortedEntries.map((entry) {
                              final keyParts = entry.key.split('|');
                              final weight = keyParts[0];
                              final roast = keyParts[1];

                              final times = entry.value
                                  .map((r) => _parseTimeToSeconds(r.time))
                                  .where((s) => s > 0)
                                  .toList();
                              final avgSec = times.isNotEmpty
                                  ? (times.reduce((a, b) => a + b) ~/
                                        times.length)
                                  : 0;
                              return TableRow(
                                children: [
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: isMobile ? 4 : 8,
                                    ),
                                    child: Text(
                                      '$weight g',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        color: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontColor1,
                                        fontFamily: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontFamily,
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: isMobile ? 4 : 8,
                                    ),
                                    child: Text(
                                      roast,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        color: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontColor1,
                                        fontFamily: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontFamily,
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: isMobile ? 4 : 8,
                                    ),
                                    child: Text(
                                      times.isNotEmpty
                                          ? _formatSeconds(avgSec)
                                          : '-',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontColor1,
                                        fontFamily: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontFamily,
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      vertical: 8,
                                      horizontal: isMobile ? 4 : 8,
                                    ),
                                    child: Text(
                                      '${entry.value.length}件',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        color: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontColor1,
                                        fontFamily: Provider.of<ThemeSettings>(
                                          context,
                                        ).fontFamily,
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            }).toList();

                            return Center(
                              child: ConstrainedBox(
                                constraints: BoxConstraints(
                                  maxWidth: isMobile ? width - 32 : 700,
                                ),
                                child: Card(
                                  elevation: 4,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  color: Provider.of<ThemeSettings>(
                                    context,
                                  ).cardBackgroundColor,
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        BeanNameWithSticker(
                                          beanName: bean,
                                          textStyle: TextStyle(
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                            color: Provider.of<ThemeSettings>(
                                              context,
                                            ).fontColor1,
                                            fontFamily:
                                                Provider.of<ThemeSettings>(
                                                  context,
                                                ).fontFamily,
                                          ),
                                          stickerSize: 20.0,
                                        ),
                                        const SizedBox(height: 16),
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          child: Table(
                                            border: TableBorder(
                                              top: BorderSide(
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1.withValues(
                                                      alpha: 0.2,
                                                    ),
                                                width: 1,
                                              ),
                                              bottom: BorderSide(
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1.withValues(
                                                      alpha: 0.2,
                                                    ),
                                                width: 1,
                                              ),
                                              left: BorderSide(
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1.withValues(
                                                      alpha: 0.2,
                                                    ),
                                                width: 1,
                                              ),
                                              right: BorderSide(
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1.withValues(
                                                      alpha: 0.2,
                                                    ),
                                                width: 1,
                                              ),
                                              horizontalInside: BorderSide(
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1.withValues(
                                                      alpha: 0.1,
                                                    ),
                                                width: 0.5,
                                              ),
                                              verticalInside: BorderSide(
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1.withValues(
                                                      alpha: 0.1,
                                                    ),
                                                width: 0.5,
                                              ),
                                            ),
                                            columnWidths: {
                                              0: FlexColumnWidth(
                                                colFlex[0].toDouble(),
                                              ),
                                              1: FlexColumnWidth(
                                                colFlex[1].toDouble(),
                                              ),
                                              2: FlexColumnWidth(
                                                colFlex[2].toDouble(),
                                              ),
                                              3: FlexColumnWidth(
                                                colFlex[3].toDouble(),
                                              ),
                                            },
                                            defaultVerticalAlignment:
                                                TableCellVerticalAlignment
                                                    .middle,
                                            children: [
                                              TableRow(
                                                decoration: BoxDecoration(
                                                  color:
                                                      Provider.of<
                                                            ThemeSettings
                                                          >(context)
                                                          .appBarColor
                                                          .withValues(
                                                            alpha: 0.15,
                                                          ),
                                                  borderRadius:
                                                      BorderRadius.only(
                                                        topLeft:
                                                            Radius.circular(8),
                                                        topRight:
                                                            Radius.circular(8),
                                                      ),
                                                ),
                                                children: [
                                                  Padding(
                                                    padding:
                                                        EdgeInsets.symmetric(
                                                          vertical: 10,
                                                          horizontal: isMobile
                                                              ? 2
                                                              : 4,
                                                        ),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .center,
                                                      children: [
                                                        Icon(
                                                          Icons.scale,
                                                          size: 16,
                                                          color:
                                                              Provider.of<
                                                                    ThemeSettings
                                                                  >(context)
                                                                  .fontColor1,
                                                        ),
                                                        SizedBox(width: 4),
                                                        Text(
                                                          '重さ',
                                                          style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontColor1,
                                                            fontSize: 15,
                                                            fontFamily:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontFamily,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  Padding(
                                                    padding:
                                                        EdgeInsets.symmetric(
                                                          vertical: 10,
                                                          horizontal: isMobile
                                                              ? 2
                                                              : 4,
                                                        ),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .center,
                                                      children: [
                                                        Icon(
                                                          Icons
                                                              .local_fire_department,
                                                          size: 16,
                                                          color:
                                                              Provider.of<
                                                                    ThemeSettings
                                                                  >(context)
                                                                  .fontColor1,
                                                        ),
                                                        SizedBox(width: 4),
                                                        Text(
                                                          '煎り度',
                                                          style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontColor1,
                                                            fontSize: 15,
                                                            fontFamily:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontFamily,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  Padding(
                                                    padding:
                                                        EdgeInsets.symmetric(
                                                          vertical: 10,
                                                          horizontal: isMobile
                                                              ? 2
                                                              : 4,
                                                        ),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .center,
                                                      children: [
                                                        Icon(
                                                          Icons.timer,
                                                          size: 16,
                                                          color:
                                                              Provider.of<
                                                                    ThemeSettings
                                                                  >(context)
                                                                  .fontColor1,
                                                        ),
                                                        SizedBox(width: 4),
                                                        Text(
                                                          '平均時間',
                                                          style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontColor1,
                                                            fontSize: 15,
                                                            fontFamily:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontFamily,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  Padding(
                                                    padding:
                                                        EdgeInsets.symmetric(
                                                          vertical: 10,
                                                          horizontal: isMobile
                                                              ? 2
                                                              : 4,
                                                        ),
                                                    child: Row(
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .center,
                                                      children: [
                                                        Icon(
                                                          Icons
                                                              .format_list_numbered,
                                                          size: 16,
                                                          color:
                                                              Provider.of<
                                                                    ThemeSettings
                                                                  >(context)
                                                                  .fontColor1,
                                                        ),
                                                        SizedBox(width: 4),
                                                        Text(
                                                          '件数',
                                                          style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontColor1,
                                                            fontSize: 15,
                                                            fontFamily:
                                                                Provider.of<
                                                                      ThemeSettings
                                                                    >(context)
                                                                    .fontFamily,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              ...rows,
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }),
                          const SizedBox(height: 24),
                          // おすすめ焙煎タイマーについての説明
                          Center(
                            child: ConstrainedBox(
                              constraints: BoxConstraints(
                                maxWidth: isMobile ? width - 32 : 700,
                              ),
                              child: Card(
                                elevation: 4,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).cardBackgroundColor,
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Color(
                                            0xFFFF8225,
                                          ).withValues(alpha: 0.12),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: Icon(
                                          Icons.recommend,
                                          color: Color(0xFFFF8225),
                                          size: 20,
                                        ),
                                      ),
                                      SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'おすすめ焙煎タイマー',
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1,
                                                fontFamily:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontFamily,
                                              ),
                                            ),
                                            SizedBox(height: 4),
                                            Text(
                                              '同じ焙煎記録が2件以上あると、おすすめの焙煎時間を提案できるようになります。たくさん記録を集めましょう！',
                                              style: TextStyle(
                                                fontSize: 14,
                                                color:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontColor1.withValues(
                                                      alpha: 0.8,
                                                    ),
                                                fontFamily:
                                                    Provider.of<ThemeSettings>(
                                                      context,
                                                    ).fontFamily,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
