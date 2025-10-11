import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../services/encrypted_local_storage_service.dart';

class FontSizeSettingsPage extends StatefulWidget {
  const FontSizeSettingsPage({super.key});

  @override
  State<FontSizeSettingsPage> createState() => _FontSizeSettingsPageState();
}

class _FontSizeSettingsPageState extends State<FontSizeSettingsPage> {
  double _fontSizeScale = 1.0;
  String _selectedFontFamily = 'HannariMincho';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final themeSettings = Provider.of<ThemeSettings>(context, listen: false);
      setState(() {
        _fontSizeScale = themeSettings.fontSizeScale;
        // フォントが利用可能なリストにない場合はデフォルトに変更
        if (ThemeSettings.availableFonts.contains(themeSettings.fontFamily)) {
          _selectedFontFamily = themeSettings.fontFamily;
        } else {
          _selectedFontFamily = 'HannariMincho';
          // 設定も更新
          themeSettings.updateFontFamily('HannariMincho');
        }
      });
    });
  }

  void _onFontSizeScaleChanged(double value) {
    setState(() {
      _fontSizeScale = value;
    });
    // ローカル保存のみで、notifyListeners()を呼ばない
    _saveFontSizeScaleLocally(value);
  }

  void _saveFontSizeScaleLocally(double value) async {
    try {
      await EncryptedLocalStorageService.setDouble('fontSizeScale', value);
    } catch (e) {
      debugPrint('ローカル保存エラー: $e');
    }
  }

  void _onFontSizeScaleChangedEnd(double value) {
    // ドラッグ終了時にThemeSettingsを更新
    Provider.of<ThemeSettings>(
      context,
      listen: false,
    ).updateFontSizeScale(value);
  }

  void _onFontFamilyChanged(String newValue) {
    setState(() {
      _selectedFontFamily = newValue;
    });
    // ローカル保存のみで、notifyListeners()を呼ばない
    _saveFontFamilyLocally(newValue);
    // ThemeSettingsを即座に更新
    Provider.of<ThemeSettings>(
      context,
      listen: false,
    ).updateFontFamily(newValue);
  }

  void _saveFontFamilyLocally(String value) async {
    try {
      await EncryptedLocalStorageService.setString('fontFamily', value);
    } catch (e) {
      debugPrint('ローカル保存エラー: $e');
    }
  }

  Widget _buildFontOptionCard({
    required String font,
    required bool isSelected,
    required ThemeSettings themeSettings,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected
              ? themeSettings.buttonColor.withValues(alpha: 0.08)
              : themeSettings.inputBackgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? themeSettings.buttonColor
                : themeSettings.fontColor1.withValues(alpha: 0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    font,
                    style: TextStyle(
                      fontFamily: font,
                      fontWeight: FontWeight.w600,
                      color: themeSettings.fontColor1,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (isSelected)
                  Icon(
                    Icons.check_circle,
                    size: 20,
                    color: themeSettings.buttonColor,
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '焙煎サンプル Aa123',
              style: TextStyle(
                fontFamily: font,
                fontSize: 16,
                color: themeSettings.fontColor1,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    return Scaffold(
      appBar: AppBar(
        title: Text('フォント設定'),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: 600, // Web版での最大幅を制限
            ),
            child: SingleChildScrollView(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    color: themeSettings.cardBackgroundColor,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'フォントファミリー',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: themeSettings.fontColor1,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'アプリ内で使用するフォントを選択できます',
                            style: TextStyle(
                              fontSize: 14,
                              color: themeSettings.fontColor1,
                            ),
                          ),
                          SizedBox(height: 16),
                          LayoutBuilder(
                            builder: (context, constraints) {
                              const spacing = 12.0;
                              final availableWidth =
                                  constraints.maxWidth.isFinite
                                  ? constraints.maxWidth
                                  : 360.0;
                              final columns = availableWidth >= 540
                                  ? 3
                                  : availableWidth >= 360
                                  ? 2
                                  : 1;
                              final totalSpacing = spacing * (columns - 1);
                              final widthForItems =
                                  (availableWidth - totalSpacing)
                                      .clamp(0, double.infinity)
                                      .toDouble();
                              final itemWidth = columns > 0
                                  ? widthForItems / columns
                                  : availableWidth;
                              return Wrap(
                                spacing: spacing,
                                runSpacing: spacing,
                                children: ThemeSettings.availableFonts.map((
                                  font,
                                ) {
                                  final isSelected =
                                      font == _selectedFontFamily;
                                  final cardWidth = columns == 1
                                      ? availableWidth
                                      : itemWidth;
                                  return SizedBox(
                                    width: cardWidth,
                                    child: _buildFontOptionCard(
                                      font: font,
                                      isSelected: isSelected,
                                      themeSettings: themeSettings,
                                      onTap: () => _onFontFamilyChanged(font),
                                    ),
                                  );
                                }).toList(),
                              );
                            },
                          ),
                          SizedBox(height: 16),
                          Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: themeSettings.inputBackgroundColor,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'サンプルテキスト\nこれは現在のフォントのサンプルです。',
                              style: TextStyle(
                                fontFamily: _selectedFontFamily,
                                fontSize: 16,
                                color: themeSettings.fontColor1,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 16),
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    color: themeSettings.cardBackgroundColor,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'フォントサイズ',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: themeSettings.fontColor1,
                            ),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'アプリ内の文字サイズを調整できます',
                            style: TextStyle(
                              fontSize: 14,
                              color: themeSettings.fontColor1,
                            ),
                          ),
                          SizedBox(height: 16),
                          Row(
                            children: [
                              Text(
                                '小',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: themeSettings.fontColor1,
                                ),
                              ),
                              Expanded(
                                child: Slider(
                                  value: _fontSizeScale,
                                  min: 0.8,
                                  max: 1.5,
                                  divisions: 14, // 0.8から1.5まで0.05刻みで14分割
                                  label: '${(_fontSizeScale * 100).round()}%',
                                  activeColor: themeSettings.buttonColor,
                                  inactiveColor: themeSettings.buttonColor
                                      .withValues(alpha: 0.3),
                                  onChanged: (value) {
                                    _onFontSizeScaleChanged(value);
                                  },
                                  onChangeEnd: (value) {
                                    _onFontSizeScaleChangedEnd(value);
                                  },
                                ),
                              ),
                              Text(
                                '大',
                                style: TextStyle(
                                  fontSize: 20,
                                  color: themeSettings.fontColor1,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 8),
                          Center(
                            child: Text(
                              '${(_fontSizeScale * 100).round()}%',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.fontColor1,
                              ),
                            ),
                          ),
                          SizedBox(height: 16),
                          Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: themeSettings.inputBackgroundColor,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'サンプルテキスト\nこれは現在のフォントサイズのサンプルです。',
                              style: TextStyle(
                                fontFamily: _selectedFontFamily,
                                fontSize: 16 * _fontSizeScale,
                                color: themeSettings.fontColor1,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
