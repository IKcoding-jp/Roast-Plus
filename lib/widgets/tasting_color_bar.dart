import 'package:flutter/material.dart';
import '../models/theme_settings.dart';
import 'tasting_radar_chart.dart';

class TastingColorBar extends StatefulWidget {
  final String label; // ラベル（例：酸味）
  final double value; // 評価値 1-5
  final double maxValue; // 最大値（デフォルト 5）
  final bool showLabel; // ラベル表示
  final ThemeSettings theme;
  final TextStyle? labelStyle;
  final TextStyle? valueStyle;

  const TastingColorBar({
    super.key,
    required this.label,
    required this.value,
    this.maxValue = 5.0,
    this.showLabel = true,
    required this.theme,
    this.labelStyle,
    this.valueStyle,
  });

  @override
  State<TastingColorBar> createState() => _TastingColorBarState();
}

class _TastingColorBarState extends State<TastingColorBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
  }

  @override
  void didUpdateWidget(TastingColorBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
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
    final percentage = (widget.value / widget.maxValue).clamp(0.0, 1.0);
    final color = TastingRadarChart.getColorForValue(widget.value);

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final animatedPercentage = percentage * _animation.value;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ラベルと数値
            if (widget.showLabel)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    widget.label,
                    style:
                        widget.labelStyle ??
                        TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: widget.theme.fontColor1,
                        ),
                  ),
                  Text(
                    widget.value.toStringAsFixed(1),
                    style:
                        widget.valueStyle ??
                        TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                  ),
                ],
              ),
            if (widget.showLabel) const SizedBox(height: 6),

            // カラーバー
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Container(
                height: 24,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: widget.theme.fontColor1.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Stack(
                  children: [
                    // グラデーション背景
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFF2196F3), // 青
                            const Color(0xFF4CAF50), // 緑
                            const Color(0xFFFFEB3B), // 黄
                            const Color(0xFFFF9800), // オレンジ
                            const Color(0xFFF44336), // 赤
                          ],
                          stops: const [0, 0.25, 0.5, 0.75, 1.0],
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    // 評価値までのフィル
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: FractionallySizedBox(
                        widthFactor: animatedPercentage,
                        child: Container(
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    // グロウエフェクト
                    FractionallySizedBox(
                      widthFactor: animatedPercentage,
                      child: Container(
                        decoration: BoxDecoration(
                          boxShadow: [
                            BoxShadow(
                              color: color.withValues(alpha: 0.4),
                              blurRadius: 8,
                              spreadRadius: 2,
                            ),
                          ],
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// シンプル版：ラベルなしのコンパクトなカラーバー
class CompactTastingColorBar extends StatelessWidget {
  final double value; // 評価値 1-5
  final double maxValue; // 最大値（デフォルト 5）
  final ThemeSettings theme;
  final double height;

  const CompactTastingColorBar({
    super.key,
    required this.value,
    this.maxValue = 5.0,
    required this.theme,
    this.height = 8,
  });

  @override
  Widget build(BuildContext context) {
    final percentage = (value / maxValue).clamp(0.0, 1.0);
    final color = TastingRadarChart.getColorForValue(value);

    return ClipRRect(
      borderRadius: BorderRadius.circular(height / 2),
      child: Container(
        height: height,
        width: double.infinity,
        decoration: BoxDecoration(
          color: theme.fontColor1.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(height / 2),
        ),
        child: Stack(
          children: [
            // グラデーション背景
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF2196F3), // 青
                    const Color(0xFF4CAF50), // 緑
                    const Color(0xFFFFEB3B), // 黄
                    const Color(0xFFFF9800), // オレンジ
                    const Color(0xFFF44336), // 赤
                  ],
                  stops: const [0, 0.25, 0.5, 0.75, 1.0],
                ),
                borderRadius: BorderRadius.circular(height / 2),
              ),
            ),
            // 評価値までのフィル
            FractionallySizedBox(
              widthFactor: percentage,
              child: Container(
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(height / 2),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
