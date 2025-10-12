import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';

class UpcomingFeaturesPage extends StatelessWidget {
  const UpcomingFeaturesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final fontScale = themeSettings.fontSizeScale;
    final fontFamily = themeSettings.fontFamily;
    final accentColor = themeSettings.settingsColor;

    final baseTextStyle = TextStyle(
      fontFamily: fontFamily,
      fontSize: 14 * fontScale,
      color: themeSettings.fontColor1,
      height: 1.5,
    );

    final headingTextStyle = TextStyle(
      fontFamily: fontFamily,
      fontSize: 20 * fontScale,
      fontWeight: FontWeight.bold,
      color: themeSettings.fontColor1,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '今後アップデートで追加予定の機能',
          style: TextStyle(
            fontFamily: fontFamily,
            fontSize: (20 * fontScale).clamp(16.0, 28.0),
          ),
        ),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
      ),
      body: SafeArea(
        child: Container(
          color: themeSettings.backgroundColor,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: 600, // Web版での最大幅を制限
              ),
              child: SingleChildScrollView(
                padding: EdgeInsets.all(16),
                child: DefaultTextStyle.merge(
                  style: baseTextStyle,
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
                          padding: EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: accentColor.withValues(
                                        alpha: 0.12,
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(
                                      Icons.update,
                                      color: accentColor,
                                      size: 24,
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Text('開発予定の機能', style: headingTextStyle),
                                ],
                              ),
                              SizedBox(height: 20),
                              _buildFeatureItem(
                                context,
                                '⏱️ ハンドピックタイマー機能',
                                'ハンドピックをタイマーで管理してくれる機能',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              _buildFeatureItem(
                                context,
                                '📚 欠点豆データベース',
                                '豆の説明や、味にどう影響するかいつでも見れる',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              _buildFeatureItem(
                                context,
                                '💡 豆の端数提案機能',
                                '豆の端数をどう振り分けたらいいか提案してくれる機能',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              _buildFeatureItem(
                                context,
                                '📄 データエクスポート機能',
                                'CSV・PDF形式でデータを出力できる機能',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              _buildFeatureItem(
                                context,
                                '📊 統計機能',
                                '月ごとの焙煎時間やドリップパック作成など、統計がグラフなどでデータ化できる',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              _buildFeatureItem(
                                context,
                                '📷 スケジュール撮影入力機能',
                                'ホワイトボードに書かれたスケジュールを撮影することで、スケジュール入力可能',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              _buildFeatureItem(
                                context,
                                '🧠 コーヒー知識クイズ',
                                'コーヒーに関する知識を楽しく学べるクイズ機能',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              _buildFeatureItem(
                                context,
                                '📚 コーヒー用語辞典',
                                'コーヒー業界で使われる専門用語を調べられる辞典機能',
                                baseTextStyle,
                                fontFamily,
                                fontScale,
                                themeSettings.fontColor1,
                                accentColor,
                              ),
                              SizedBox(height: 24),
                              Container(
                                padding: EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: accentColor.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: accentColor.withValues(alpha: 0.3),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.lightbulb,
                                      color: accentColor,
                                      size: 20,
                                    ),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        'ご要望があれば、フィードバックからお聞かせください！',
                                        style: TextStyle(
                                          fontFamily: fontFamily,
                                          fontSize: 16 * fontScale,
                                          fontWeight: FontWeight.bold,
                                          color: accentColor,
                                        ),
                                      ),
                                    ),
                                  ],
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
        ),
      ),
    );
  }

  Widget _buildFeatureItem(
    BuildContext context,
    String title,
    String description,
    TextStyle baseTextStyle,
    String fontFamily,
    double fontScale,
    Color fontColor,
    Color accentColor,
  ) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: EdgeInsets.only(top: 4),
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: accentColor,
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontFamily: fontFamily,
                    fontSize: 16 * fontScale,
                    fontWeight: FontWeight.bold,
                    color: fontColor,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  description,
                  style: baseTextStyle.copyWith(fontSize: 14 * fontScale),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
