import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../models/theme_settings.dart';
import '../../config/app_config.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({super.key});

  @override
  State<FeedbackPage> createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  String _selectedCategory = '要望・改善案';
  bool _isLoading = false;

  final List<String> _categories = ['要望・改善案', '障害・不具合', 'その他'];

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _sendFeedback() async {
    if (_subjectController.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('件名を入力してください')));
      return;
    }

    if (_messageController.text.trim().isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('メッセージを入力してください')));
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final subject =
          '【RoastPlus】$_selectedCategory: ${_subjectController.text.trim()}';
      final body =
          '''
カテゴリー: $_selectedCategory

メッセージ:
${_messageController.text.trim()}

---
このメッセージは RoastPlus のフィードバックフォームから送信されました。
''';

      final feedbackEmail = AppConfig.feedbackRecipientEmail;
      final Uri emailUri = Uri(
        scheme: 'mailto',
        path: feedbackEmail,
        queryParameters: {'subject': subject, 'body': body},
      );

      final messenger = ScaffoldMessenger.of(context);
      final navigator = Navigator.of(context);

      if (await canLaunchUrl(emailUri)) {
        final result = await launchUrl(
          emailUri,
          mode: LaunchMode.externalApplication,
        );

        if (result) {
          if (!mounted) return;
          messenger.showSnackBar(
            const SnackBar(content: Text('メールアプリを起動しました')),
          );
          navigator.pop();
        } else {
          throw Exception('メールアプリの起動に失敗しました。');
        }
      } else {
        throw Exception('メールアプリを開けませんでした。デバイスにメールアプリがインストールされているか確認してください。');
      }
    } catch (e) {
      // 送信処理で発生したエラー
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('エラーが発生しました: $e'),
            duration: Duration(seconds: 5),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final baseTextStyle = TextStyle(
      fontFamily: themeSettings.fontFamily,
      fontSize: 14 * themeSettings.fontSizeScale,
      color: themeSettings.fontColor1,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'フィードバック',
          style: TextStyle(
            fontFamily: themeSettings.fontFamily,
            fontSize: (20 * themeSettings.fontSizeScale).clamp(16.0, 28.0),
          ),
        ),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
      ),
      body: Container(
        color: themeSettings.backgroundColor,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: 600, // Web迚医〒縺ｮ譛螟ｧ蟷・ｒ蛻ｶ髯・
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
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
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'フィードバックを送信',
                              style: TextStyle(
                                fontSize: 18 * themeSettings.fontSizeScale,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.fontColor1,
                                fontFamily: themeSettings.fontFamily,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              '要望・改善案、バグ報告、その他のご意見をお聞かせください。',
                              style: TextStyle(
                                fontSize: 14,
                                color: themeSettings.fontColor1,
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
                              'カテゴリー',
                              style: TextStyle(
                                fontSize: 16 * themeSettings.fontSizeScale,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.fontColor1,
                                fontFamily: themeSettings.fontFamily,
                              ),
                            ),
                            SizedBox(height: 8),
                            DropdownButtonFormField<String>(
                              initialValue: _selectedCategory,
                              style: TextStyle(
                                fontFamily: themeSettings.fontFamily,
                                fontSize: 16 * themeSettings.fontSizeScale,
                                color: themeSettings.fontColor1,
                              ),
                              decoration: InputDecoration(
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                filled: true,
                                fillColor: themeSettings.inputBackgroundColor,
                              ),
                              items: _categories.map((String category) {
                                return DropdownMenuItem<String>(
                                  value: category,
                                  child: Text(
                                    category,
                                    style: TextStyle(
                                      color: themeSettings.fontColor1,
                                      fontFamily: themeSettings.fontFamily,
                                      fontSize:
                                          16 * themeSettings.fontSizeScale,
                                    ),
                                  ),
                                );
                              }).toList(),
                              onChanged: (String? newValue) {
                                setState(() {
                                  _selectedCategory = newValue!;
                                });
                              },
                            ),
                            SizedBox(height: 16),
                            Text(
                              '件名',
                              style: TextStyle(
                                fontSize: 16 * themeSettings.fontSizeScale,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.fontColor1,
                                fontFamily: themeSettings.fontFamily,
                              ),
                            ),
                            SizedBox(height: 8),
                            TextField(
                              controller: _subjectController,
                              decoration: InputDecoration(
                                hintText: '件名を入力してください',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                filled: true,
                                fillColor: themeSettings.inputBackgroundColor,
                                hintStyle: TextStyle(
                                  color: themeSettings.fontColor1.withValues(
                                    alpha: 0.6,
                                  ),
                                  fontFamily: themeSettings.fontFamily,
                                  fontSize: 14 * themeSettings.fontSizeScale,
                                ),
                              ),
                              style: TextStyle(
                                color: themeSettings.fontColor1,
                                fontFamily: themeSettings.fontFamily,
                                fontSize: 16 * themeSettings.fontSizeScale,
                              ),
                            ),
                            SizedBox(height: 16),
                            Text(
                              'メッセージ',
                              style: TextStyle(
                                fontSize: 16 * themeSettings.fontSizeScale,
                                fontWeight: FontWeight.bold,
                                color: themeSettings.fontColor1,
                                fontFamily: themeSettings.fontFamily,
                              ),
                            ),
                            SizedBox(height: 8),
                            TextField(
                              controller: _messageController,
                              maxLines: 8,
                              decoration: InputDecoration(
                                hintText: '詳細な内容を入力してください',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                filled: true,
                                fillColor: themeSettings.inputBackgroundColor,
                                hintStyle: TextStyle(
                                  color: themeSettings.fontColor1.withValues(
                                    alpha: 0.6,
                                  ),
                                  fontFamily: themeSettings.fontFamily,
                                  fontSize: 14 * themeSettings.fontSizeScale,
                                ),
                              ),
                              style: TextStyle(
                                color: themeSettings.fontColor1,
                                fontFamily: themeSettings.fontFamily,
                                fontSize: 16 * themeSettings.fontSizeScale,
                              ),
                            ),
                            SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _sendFeedback,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: themeSettings.appButtonColor,
                                  foregroundColor: themeSettings.fontColor2,
                                  textStyle: TextStyle(
                                    fontFamily: themeSettings.fontFamily,
                                    fontSize: 16 * themeSettings.fontSizeScale,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: _isLoading
                                    ? SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                themeSettings.fontColor2,
                                              ),
                                        ),
                                      )
                                    : Text(
                                        'フィードバックを送信',
                                        style: TextStyle(
                                          fontFamily: themeSettings.fontFamily,
                                          fontSize:
                                              16 * themeSettings.fontSizeScale,
                                        ),
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
      ),
    );
  }
}
