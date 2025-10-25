import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/theme_settings.dart';

class TastingRadarChart extends StatefulWidget {
  final double acidity; // 酸味 1-5
  final double bitterness; // 苦味 1-5
  final double body; // コク 1-5
  final double sweetness; // 甘み 1-5
  final double aroma; // 香り 1-5
  final double size; // チャートサイズ
  final bool showLabels; // ラベル表示
  final bool showValues; // 値を頂点に表示
  final ThemeSettings theme;

  const TastingRadarChart({
    super.key,
    required this.acidity,
    required this.bitterness,
    required this.body,
    required this.sweetness,
    required this.aroma,
    this.size = 200.0,
    this.showLabels = true,
    this.showValues = false,
    required this.theme,
  });

  @override
  State<TastingRadarChart> createState() => _TastingRadarChartState();

  /// 評価値（1-5）に応じてグラデーションカラーを返す
  static Color getColorForValue(double value) {
    // 1.0-2.0: 青系
    if (value <= 2.0) {
      final t = (value - 1.0) / 1.0;
      return Color.lerp(
        const Color(0xFF2196F3), // 青
        const Color(0xFF4CAF50), // 緑
        t,
      )!;
    }
    // 2.0-3.0: 緑→黄
    if (value <= 3.0) {
      final t = (value - 2.0) / 1.0;
      return Color.lerp(
        const Color(0xFF4CAF50), // 緑
        const Color(0xFFFFEB3B), // 黄
        t,
      )!;
    }
    // 3.0-4.0: 黄→オレンジ
    if (value <= 4.0) {
      final t = (value - 3.0) / 1.0;
      return Color.lerp(
        const Color(0xFFFFEB3B), // 黄
        const Color(0xFFFF9800), // オレンジ
        t,
      )!;
    }
    // 4.0-5.0: オレンジ→赤
    final t = (value - 4.0) / 1.0;
    return Color.lerp(
      const Color(0xFFFF9800), // オレンジ
      const Color(0xFFF44336), // 赤
      t,
    )!;
  }
}

class _TastingRadarChartState extends State<TastingRadarChart>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void didUpdateWidget(TastingRadarChart oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.acidity != widget.acidity ||
        oldWidget.bitterness != widget.bitterness ||
        oldWidget.body != widget.body ||
        oldWidget.sweetness != widget.sweetness ||
        oldWidget.aroma != widget.aroma) {
      _animationController.reset();
      _animationController.forward();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Opacity(
          opacity: _animation.value,
          child: Transform.scale(
            scale: 0.8 + (_animation.value * 0.2),
            child: Container(
              width: widget.size,
              height: widget.size,
              alignment: Alignment.center,
              child: RadarChart(
                RadarChartData(
                  dataSets: [
                    // 基準となる0-5のスケールを固定するためのデータセット（非表示）
                    RadarDataSet(
                      fillColor: Colors.transparent,
                      borderColor: Colors.transparent,
                      entryRadius: 0,
                      dataEntries: [
                        RadarEntry(value: 0.0), // 中心を0に固定
                        RadarEntry(value: 0.0),
                        RadarEntry(value: 0.0),
                        RadarEntry(value: 0.0),
                        RadarEntry(value: 0.0),
                      ],
                      borderWidth: 0,
                    ),
                    // 基準となる5のスケールを固定するためのデータセット（非表示）
                    RadarDataSet(
                      fillColor: Colors.transparent,
                      borderColor: Colors.transparent,
                      entryRadius: 0,
                      dataEntries: [
                        RadarEntry(value: 5.0), // 外周を5に固定
                        RadarEntry(value: 5.0),
                        RadarEntry(value: 5.0),
                        RadarEntry(value: 5.0),
                        RadarEntry(value: 5.0),
                      ],
                      borderWidth: 0,
                    ),
                    // 実際のデータセット
                    RadarDataSet(
                      fillColor: TastingRadarChart.getColorForValue(
                        (widget.acidity +
                                widget.bitterness +
                                widget.body +
                                widget.sweetness +
                                widget.aroma) /
                            5.0,
                      ).withValues(alpha: 0.3),
                      borderColor: TastingRadarChart.getColorForValue(
                        (widget.acidity +
                                widget.bitterness +
                                widget.body +
                                widget.sweetness +
                                widget.aroma) /
                            5.0,
                      ),
                      entryRadius: widget.showValues ? 6 : 4,
                      dataEntries: [
                        RadarEntry(value: widget.acidity * _animation.value),
                        RadarEntry(value: widget.bitterness * _animation.value),
                        RadarEntry(value: widget.body * _animation.value),
                        RadarEntry(value: widget.sweetness * _animation.value),
                        RadarEntry(value: widget.aroma * _animation.value),
                      ],
                      borderWidth: 2,
                    ),
                  ],
                  radarShape: RadarShape.polygon,
                  gridBorderData: BorderSide(
                    color: widget.theme.fontColor1.withValues(alpha: 0.2),
                    width: 1,
                  ),
                  tickBorderData: BorderSide(
                    color: widget.theme.fontColor1.withValues(alpha: 0.1),
                    width: 1,
                  ),
                  radarTouchData: RadarTouchData(enabled: false),
                  titlePositionPercentageOffset: widget.showValues
                      ? 0.22
                      : 0.15,
                  ticksTextStyle: TextStyle(
                    color: widget.theme.fontColor1.withValues(alpha: 0.6),
                    fontSize: widget.size > 200 ? 10 : 8,
                  ),
                  radarBackgroundColor: Colors.transparent,
                  getTitle: (index, angle) {
                    if (!widget.showLabels && !widget.showValues) {
                      return RadarChartTitle(text: '');
                    }
                    const titles = ['酸味', '苦味', 'コク', '甘み', '香り'];
                    final valuesList = [
                      widget.acidity,
                      widget.bitterness,
                      widget.body,
                      widget.sweetness,
                      widget.aroma,
                    ];

                    String titleText = '';
                    if (widget.showValues) {
                      titleText =
                          '${titles[index]}\n${valuesList[index].toStringAsFixed(1)}';
                    } else if (widget.showLabels) {
                      titleText = titles[index];
                    }

                    return RadarChartTitle(
                      text: titleText,
                      angle: 0,
                      positionPercentageOffset: widget.showValues ? 0.22 : 0.15,
                    );
                  },
                  tickCount: 5,
                ),
                duration: const Duration(milliseconds: 1500),
              ),
            ),
          ),
        );
      },
    );
  }
}
