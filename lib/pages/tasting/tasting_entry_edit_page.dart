import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../../models/tasting_models.dart';
import '../../models/theme_settings.dart';
import '../../widgets/tasting_radar_chart.dart';
import '../../services/tasting_firestore_service.dart';

/// 任意: 単体のエントリ編集用（詳細ページ内フォームを使う想定のため最小）
class TastingEntryEditPage extends StatefulWidget {
  final String groupId;
  final String sessionId;
  final TastingEntry? initial;

  const TastingEntryEditPage({
    super.key,
    required this.groupId,
    required this.sessionId,
    this.initial,
  });

  @override
  State<TastingEntryEditPage> createState() => _TastingEntryEditPageState();
}

class _TastingEntryEditPageState extends State<TastingEntryEditPage> {
  final TextEditingController _commentCtrl = TextEditingController();
  double _bitterness = 3,
      _acidity = 3,
      _body = 3,
      _sweetness = 3,
      _aroma = 3,
      _overall = 3;

  @override
  void initState() {
    super.initState();
    final e = widget.initial;
    if (e != null) {
      _bitterness = e.bitterness;
      _acidity = e.acidity;
      _body = e.body;
      _sweetness = e.sweetness;
      _aroma = e.aroma;
      _overall = e.overall;
      _commentCtrl.text = e.comment;
    }
  }

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;
    final entry = TastingEntry(
      id: uid,
      userId: uid,
      bitterness: _bitterness,
      acidity: _acidity,
      body: _body,
      sweetness: _sweetness,
      aroma: _aroma,
      overall: _overall,
      comment: _commentCtrl.text.trim(),
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    await TastingFirestoreService.upsertEntry(
      widget.groupId,
      widget.sessionId,
      entry,
    );
    if (!mounted) return;
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeSettings>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('エントリを記録'),
        backgroundColor: theme.appBarColor,
        foregroundColor: theme.appBarTextColor,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // リアルタイムプレビュー
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'プレビュー',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.fontColor1,
                      ),
                    ),
                    SizedBox(height: 12),
                    Center(
                      child: SizedBox(
                        width: 160,
                        height: 160,
                        child: TastingRadarChart(
                          acidity: _acidity,
                          bitterness: _bitterness,
                          body: _body,
                          sweetness: _sweetness,
                          aroma: _aroma,
                          size: 160,
                          showLabels: false,
                          theme: theme,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            // 評価セクション
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '評価 (1-5段階)',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.fontColor1,
                      ),
                    ),
                    SizedBox(height: 16),
                    _buildSlider(
                      '苦味',
                      _bitterness,
                      (v) => setState(() => _bitterness = v),
                    ),
                    SizedBox(height: 12),
                    _buildSlider(
                      '酸味',
                      _acidity,
                      (v) => setState(() => _acidity = v),
                    ),
                    SizedBox(height: 12),
                    _buildSlider(
                      'ボディ',
                      _body,
                      (v) => setState(() => _body = v),
                    ),
                    SizedBox(height: 12),
                    _buildSlider(
                      '甘み',
                      _sweetness,
                      (v) => setState(() => _sweetness = v),
                    ),
                    SizedBox(height: 12),
                    _buildSlider(
                      '香り',
                      _aroma,
                      (v) => setState(() => _aroma = v),
                    ),
                    SizedBox(height: 12),
                    _buildSlider(
                      '総合',
                      _overall,
                      (v) => setState(() => _overall = v),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 16),
            // コメントセクション
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'コメント',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.fontColor1,
                      ),
                    ),
                    SizedBox(height: 12),
                    TextField(
                      controller: _commentCtrl,
                      maxLines: 4,
                      decoration: InputDecoration(
                        hintText: 'このコーヒーの感想を記入してください',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(onPressed: _save, child: Text('保存')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(
    String label,
    double value,
    ValueChanged<double> onChanged,
  ) {
    final theme = Provider.of<ThemeSettings>(context, listen: false);
    final color = TastingRadarChart.getColorForValue(value);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: theme.fontColor1,
              ),
            ),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: color.withValues(alpha: 0.4),
                  width: 1,
                ),
              ),
              child: Text(
                value.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 8),
        SliderTheme(
          data: SliderThemeData(
            trackHeight: 8.0,
            thumbShape: RoundSliderThumbShape(
              elevation: 6.0,
              enabledThumbRadius: 12.0,
              pressedElevation: 10.0,
            ),
            overlayShape: RoundSliderOverlayShape(overlayRadius: 16.0),
          ),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
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
            ),
            child: Slider(
              value: value,
              min: 1.0,
              max: 5.0,
              divisions: 8,
              activeColor: color.withValues(alpha: 0.0),
              inactiveColor: Colors.transparent,
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}
