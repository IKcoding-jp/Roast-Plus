import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import 'custom_theme_settings_page.dart';
import 'dart:async'; // Added for Timer

class ThemeSettingsPage extends StatefulWidget {
  const ThemeSettingsPage({super.key});

  @override
  State<ThemeSettingsPage> createState() => _ThemeSettingsPageState();
}

class _ThemeSettingsPageState extends State<ThemeSettingsPage> {
  Map<String, Map<String, Color>> _customThemes = {};
  bool _isLoading = true;

  @override
  void dispose() {
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _loadCustomThemes();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // テーマ変更時の読み込み表示を防ぐため、この呼び出しを削除
  }

  Future<void> _loadCustomThemes() async {
    final customThemes = await ThemeSettings.getCustomThemes();
    if (mounted) {
      setState(() {
        _customThemes = customThemes;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(
            'テーマ設定',
            style: TextStyle(
              fontFamily: themeSettings.fontFamily,
              fontSize: (20 * themeSettings.fontSizeScale).clamp(16.0, 28.0),
            ),
          ),
          backgroundColor: themeSettings.appBarColor,
        ),
        body: Container(
          color: themeSettings.backgroundColor,
          child: const Center(child: CircularProgressIndicator()),
        ),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'テーマ設定',
          style: TextStyle(
            fontFamily: themeSettings.fontFamily,
            fontSize: (20 * themeSettings.fontSizeScale).clamp(16.0, 28.0),
          ),
        ),
        backgroundColor: themeSettings.appBarColor,
        actions: [
          IconButton(
            icon: Icon(Icons.tune, color: themeSettings.appBarTextColor),
            onPressed: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const CustomThemeSettingsPage(),
                ),
              );
              if (result == true) {
                await _loadCustomThemes();
              }
            },
            tooltip: 'カスタム設定',
          ),
        ],
      ),
      body: Container(
        color: themeSettings.backgroundColor,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: 600, // Web版での最大幅を制限
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ListView(
                children: [
                  _buildPresetSection(context, themeSettings),
                  const SizedBox(height: 24),
                  _buildCustomThemesSection(context, themeSettings),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPresetSection(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: themeSettings.cardBackgroundColor,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.palette, color: themeSettings.iconColor),
                const SizedBox(width: 8),
                Text(
                  'プリセットテーマ',
                  style: TextStyle(
                    fontSize: 18 * themeSettings.fontSizeScale,
                    fontWeight: FontWeight.bold,
                    color: themeSettings.fontColor1,
                    fontFamily: themeSettings.fontFamily,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 基本テーマ（全員利用可能）
            _buildThemeCategory(
              context,
              themeSettings,
              '基本 ⚙️',
              ['デフォルト', 'ダーク', 'ライト'],
              Icons.settings,
              isBasic: true,
            ),

            const SizedBox(height: 16),

            // パステル系テーマ
            _buildThemeCategory(context, themeSettings, 'パステル 🌸', [
              'ピンク',
              'ブルー',
              'グリーン',
              'イエロー',
              'パープル',
              'ピーチ',
            ], Icons.brush),

            const SizedBox(height: 16),

            // 暖色系テーマ
            _buildThemeCategory(context, themeSettings, '暖色系 🧡', [
              'レッド',
              'オレンジ',
              'タンジェリン',
              'アンバー',
              'パンプキン',
              'サンセット',
            ], Icons.wb_sunny),

            const SizedBox(height: 16),

            // 寒色系テーマ
            _buildThemeCategory(context, themeSettings, '寒色系 💙', [
              'オーシャン',
              'ネイビー',
              'フォレスト',
              'ティール',
              'ミントグリーン',
            ], Icons.water_drop),

            const SizedBox(height: 16),

            // コーヒー系テーマ
            _buildThemeCategory(context, themeSettings, 'コーヒー ☕', [
              'ブラウン',
              'ベージュ',
              'エスプレッソ',
              'カプチーノ',
              'キャラメル',
            ], Icons.local_cafe),

            const SizedBox(height: 16),

            // エレガント系テーマ
            _buildThemeCategory(context, themeSettings, 'エレガント 💎', [
              'サクラ',
              'ラベンダー',
              'ゴールド',
              'シルバー',
            ], Icons.auto_awesome),
          ],
        ),
      ),
    );
  }

  Widget _buildThemeCategory(
    BuildContext context,
    ThemeSettings themeSettings,
    String categoryName,
    List<String> themeNames,
    IconData categoryIcon, {
    bool isBasic = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          categoryName,
          style: TextStyle(
            fontSize: 16 * themeSettings.fontSizeScale,
            fontWeight: FontWeight.w600,
            color: themeSettings.fontColor1,
            fontFamily: themeSettings.fontFamily,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: themeNames.map((presetName) {
            return _PresetButton(
              presetName: presetName,
              onPressed: () {
                themeSettings.applyPreset(presetName);
              },
              isDisabled: false,
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildCustomThemesSection(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: themeSettings.cardBackgroundColor,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.folder, color: themeSettings.iconColor),
                const SizedBox(width: 8),
                Text(
                  'カスタムテーマ',
                  style: TextStyle(
                    fontSize: 18 * themeSettings.fontSizeScale,
                    fontWeight: FontWeight.bold,
                    color: themeSettings.fontColor1,
                    fontFamily: themeSettings.fontFamily,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_customThemes.isEmpty)
              Center(
                child: Text(
                  'カスタムテーマがありません',
                  style: TextStyle(
                    color: themeSettings.fontColor1,
                    fontSize: 16 * themeSettings.fontSizeScale,
                    fontFamily: themeSettings.fontFamily,
                  ),
                ),
              )
            else
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _customThemes.keys.map((themeName) {
                  return _CustomThemeButton(
                    themeName: themeName,
                    onPressed: () {
                      themeSettings.applyCustomTheme(themeName);
                    },
                    onDelete: () async {
                      await ThemeSettings.deleteCustomTheme(themeName);
                      await _loadCustomThemes();
                    },
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }
}

class _PresetButton extends StatelessWidget {
  final String presetName;
  final VoidCallback onPressed;
  final bool isDisabled;

  const _PresetButton({
    required this.presetName,
    required this.onPressed,
    this.isDisabled = false,
  });

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final preset = ThemeSettings.presets[presetName];
    final isLight = presetName == 'ライト';

    // アイコン色の決定（ボタン色と背景色のコントラストを考慮）
    final backgroundColor =
        preset?['buttonColor'] ?? preset?['appButtonColor'] ?? Colors.grey;
    final luminance = backgroundColor.computeLuminance();
    final iconColor = luminance > 0.5 ? Colors.black87 : Colors.white;

    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color:
                (preset?['buttonColor'] ??
                        preset?['appButtonColor'] ??
                        Colors.grey)
                    .withValues(alpha: isDisabled ? 0.2 : 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          ElevatedButton(
            onPressed: isDisabled ? null : onPressed,
            style: ElevatedButton.styleFrom(
              textStyle: TextStyle(
                fontFamily: themeSettings.fontFamily,
                fontSize: 14 * themeSettings.fontSizeScale,
                fontWeight: FontWeight.w600,
              ),
              backgroundColor: isLight
                  ? Colors.white
                  : (preset?['buttonColor'] ??
                        preset?['appButtonColor'] ??
                        Colors.grey),
              foregroundColor: isLight
                  ? Colors.black87
                  : (preset?['fontColor2'] ?? Colors.white),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // テーマに応じたアイコンとプレビュー色
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        preset?['backgroundColor'] ?? Colors.grey[100]!,
                        preset?['iconColor'] ?? Colors.grey,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    border: Border.all(
                      color: iconColor.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Icon(
                    _getThemeIcon(presetName),
                    color: iconColor,
                    size: 14,
                  ),
                ),
                const SizedBox(width: 12),
                Flexible(
                  child: Text(
                    presetName,
                    style: TextStyle(
                      fontSize: 14 * themeSettings.fontSizeScale,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                      fontFamily: themeSettings.fontFamily,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          // 無効化された場合のオーバーレイ
          if (isDisabled)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  color: Colors.black.withValues(alpha: 0.3),
                ),
                child: Center(
                  child: Icon(Icons.lock, size: 20, color: Colors.white),
                ),
              ),
            ),
        ],
      ),
    );
  }

  IconData _getThemeIcon(String themeName) {
    switch (themeName) {
      case 'デフォルト':
        return Icons.home;
      case 'ダーク':
        return Icons.dark_mode;
      case 'ライト':
        return Icons.light_mode;
      case 'ブラウン':
        return Icons.coffee;
      case 'ベージュ':
        return Icons.local_cafe;
      case 'エスプレッソ':
        return Icons.coffee_maker;
      case 'カプチーノ':
        return Icons.coffee;
      case 'レッド':
        return Icons.favorite;
      case 'オレンジ':
        return Icons.circle;
      case 'タンジェリン':
        return Icons.set_meal;
      case 'アンバー':
        return Icons.star;
      case 'キャラメル':
        return Icons.emoji_food_beverage;
      case 'パンプキン':
        return Icons.emoji_nature;
      case 'フォレスト':
        return Icons.forest;
      case 'ティール':
        return Icons.water;
      case 'ミントグリーン':
        return Icons.eco;
      case 'オーシャン':
        return Icons.waves;
      case 'ネイビー':
        return Icons.sailing;

      case 'サクラ':
        return Icons.local_florist;
      case 'ラベンダー':
        return Icons.auto_awesome;
      case 'ゴールド':
        return Icons.star;
      case 'シルバー':
        return Icons.star_border;
      case 'サンセット':
        return Icons.wb_sunny;

      case 'ピンク':
        return Icons.favorite_border;
      case 'ブルー':
        return Icons.water_drop;
      case 'グリーン':
        return Icons.eco;
      case 'イエロー':
        return Icons.wb_sunny_outlined;
      case 'パープル':
        return Icons.auto_awesome_outlined;
      case 'ピーチ':
        return Icons.local_florist_outlined;

      default:
        return Icons.palette;
    }
  }
}

class _CustomThemeButton extends StatelessWidget {
  final String themeName;
  final VoidCallback onPressed;
  final VoidCallback onDelete;

  const _CustomThemeButton({
    required this.themeName,
    required this.onPressed,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    return GestureDetector(
      onLongPress: onDelete,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          textStyle: TextStyle(
            fontFamily: themeSettings.fontFamily,
            fontSize: 14 * themeSettings.fontSizeScale,
            fontWeight: FontWeight.w500,
          ),
          backgroundColor: Colors.grey.shade300,
          foregroundColor: Colors.black87,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.palette, color: Colors.black87, size: 20),
            const SizedBox(width: 8),
            Text(
              themeName,
              style: TextStyle(
                fontSize: 14 * themeSettings.fontSizeScale,
                fontWeight: FontWeight.w500,
                fontFamily: themeSettings.fontFamily,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ColorPickerDialog extends StatefulWidget {
  final Color initialColor;
  final String label;
  const _ColorPickerDialog({required this.initialColor, required this.label});

  @override
  State<_ColorPickerDialog> createState() => _ColorPickerDialogState();
}

class _ColorPickerDialogState extends State<_ColorPickerDialog> {
  late Color _color;
  late ThemeSettings themeSettings;

  @override
  void initState() {
    super.initState();
    _color = widget.initialColor;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    themeSettings = Provider.of<ThemeSettings>(context, listen: false);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: themeSettings.cardBackgroundColor,
      title: Text(
        '${widget.label}の色を選択',
        style: TextStyle(color: themeSettings.fontColor1),
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 現在の色と選択中の色の比較
            Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        '現在の色',
                        style: TextStyle(
                          color: themeSettings.fontColor1,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: widget.initialColor,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: themeSettings.fontColor1.withValues(
                              alpha: 0.3,
                            ),
                            width: 1,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    children: [
                      Text(
                        '選択中の色',
                        style: TextStyle(
                          color: themeSettings.fontColor1,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: _color,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: themeSettings.fontColor1.withValues(
                              alpha: 0.3,
                            ),
                            width: 1,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // 色選択器
            MaterialPicker(
              pickerColor: _color,
              onColorChanged: (c) => setState(() => _color = c),
              enableLabel: false,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          style: TextButton.styleFrom(
            foregroundColor: themeSettings.fontColor1,
          ),
          child: const Text('キャンセル'),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, _color),
          style: ElevatedButton.styleFrom(
            backgroundColor: themeSettings.appButtonColor,
            foregroundColor: themeSettings.fontColor2,
          ),
          child: const Text('決定'),
        ),
      ],
    );
  }
}
