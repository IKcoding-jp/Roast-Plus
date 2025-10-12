import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';

class CreatorMessagePage extends StatelessWidget {
  const CreatorMessagePage({super.key});

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final fontScale = themeSettings.fontSizeScale;
    final fontFamily = themeSettings.fontFamily;

    final baseTextStyle = TextStyle(
      fontFamily: fontFamily,
      fontSize: 14 * fontScale,
      color: themeSettings.fontColor1,
      height: 1.6,
    );

    final headingTextStyle = TextStyle(
      fontFamily: fontFamily,
      fontSize: 20 * fontScale,
      fontWeight: FontWeight.bold,
      color: themeSettings.fontColor1,
    );

    final accentColor = themeSettings.iconColor;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '制作者からのメッセージ',
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
                                      Icons.coffee,
                                      color: accentColor,
                                      size: 24,
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Text('ローストプラスについて', style: headingTextStyle),
                                ],
                              ),
                              SizedBox(height: 20),
                              Text(
                                'はじめまして！このアプリを作ったIKです☕\n\n'
                                '僕は、BYSNで実際に働いている従業員の一人です。\n'
                                '日々の業務の中で、「この作業、もっとラクにできたらいいのに」'
                                '「こういうの記録できたら便利だな」って思ったことを、'
                                '少しずつ形にしたいと思いこのアプリを作りました。\n\n'
                                '同じようにBYSNでがんばってる仲間のみなさんにとっても、'
                                '使いやすくて役立つアプリになってくれたらうれしいです！\n\n'
                                'なるべくシンプルでスッキリした画面にこだわってます。\n\n'
                                'まだまだ改善の余地はたくさんありますが、'
                                'これからもどんどんアップデートしていく予定です。\n\n'
                                '「こんな機能あったらいいな」「ここ直してほしい」って声があれば、'
                                'フィードバックから気軽に教えてもらえたらうれしいです！\n\n'
                                '最後まで読んでくれて、ありがとうございます。',
                                style: baseTextStyle.copyWith(
                                  fontSize: 16 * fontScale,
                                ),
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
                                      Icons.favorite,
                                      color: accentColor,
                                      size: 20,
                                    ),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        '一緒にお仕事がんばりましょう！',
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
}
