import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../models/group_provider.dart';
import '../../services/group_invitation_service.dart';
import 'group_create_page.dart';
import '../../app.dart';

class GroupRequiredPage extends StatelessWidget {
  const GroupRequiredPage({super.key});

  @override
  Widget build(BuildContext context) {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final isWeb = screenWidth > 600;

    return Scaffold(
      backgroundColor: themeSettings.backgroundColor,
      appBar: AppBar(
        title: Text('グループ参加が必要です'),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
        automaticallyImplyLeading: false, // 戻るボタンを無効化
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: isWeb ? 40.0 : 16.0,
              vertical: 24.0,
            ),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: isWeb ? 500 : double.infinity,
              ),
              child: Column(
                children: [
                  const SizedBox(height: 20),

                  // アイコン
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      color: themeSettings.iconColor.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: themeSettings.iconColor.withValues(alpha: 0.3),
                        width: 2,
                      ),
                    ),
                    child: Icon(
                      Icons.group_work,
                      size: 35,
                      color: themeSettings.iconColor,
                    ),
                  ),

                  const SizedBox(height: 16),

                  // タイトル
                  Text(
                    'グループ参加が必要です',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: themeSettings.fontColor1,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 16),

                  // 説明文
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: themeSettings.cardBackgroundColor,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: themeSettings.iconColor.withValues(alpha: 0.2),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.info_outline,
                          size: 24,
                          color: themeSettings.iconColor,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'ローストプラスを利用するには、\nグループの参加が必須です',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: themeSettings.fontColor1,
                            height: 1.3,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // アクションボタン
                  if (isWeb) ...[
                    // Web版では横並びレイアウト
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => const GroupCreatePage(),
                                ),
                              );
                            },
                            icon: Icon(Icons.add_circle_outline, size: 20),
                            label: Text(
                              'グループ作成',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: themeSettings.buttonColor,
                              foregroundColor: themeSettings.fontColor2,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 2,
                            ),
                          ),
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () {
                              _showInvitationCodeDialog(context, themeSettings);
                            },
                            icon: Icon(Icons.vpn_key, size: 20),
                            label: Text(
                              '招待コード入力',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: themeSettings.appButtonColor,
                              foregroundColor: themeSettings.fontColor2,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              elevation: 2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    // モバイル版では縦並びレイアウト
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const GroupCreatePage(),
                            ),
                          );
                        },
                        icon: Icon(Icons.add_circle_outline, size: 22),
                        label: Text(
                          '新しいグループを作成',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: themeSettings.buttonColor,
                          foregroundColor: themeSettings.fontColor2,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 2,
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // 招待コード入力ボタン
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          _showInvitationCodeDialog(context, themeSettings);
                        },
                        icon: Icon(Icons.vpn_key, size: 22),
                        label: Text(
                          '招待コードでグループに参加',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: themeSettings.appButtonColor,
                          foregroundColor: themeSettings.fontColor2,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 2,
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 20),

                  // グループ機能の簡潔な説明
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: themeSettings.memberBackgroundColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: themeSettings.iconColor.withValues(alpha: 0.1),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(
                              Icons.lightbulb_outline,
                              size: 18,
                              color: themeSettings.iconColor,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              'グループ機能',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: themeSettings.fontColor1,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        _buildCompactFeatureItem('焙煎記録の共有・比較', themeSettings),
                        _buildCompactFeatureItem('試飲感想の交換', themeSettings),
                        _buildCompactFeatureItem('ドリップカウンター', themeSettings),
                        _buildCompactFeatureItem('スケジュール管理', themeSettings),
                        _buildCompactFeatureItem('バッジシステム', themeSettings),
                        _buildCompactFeatureItem('データ共有・同期', themeSettings),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // 補足情報
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: Colors.blue.withValues(alpha: 0.3),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.tips_and_updates,
                          size: 16,
                          color: Colors.blue,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'グループ機能では、仲間とデータを共有して業務をより効率的にできます',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.blue.shade700,
                              height: 1.2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// 招待コード入力ダイアログを表示
  void _showInvitationCodeDialog(
    BuildContext context,
    ThemeSettings themeSettings,
  ) {
    final TextEditingController codeController = TextEditingController();
    bool isLoading = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Row(
            children: [
              Icon(Icons.vpn_key, color: themeSettings.iconColor),
              SizedBox(width: 8),
              Text(
                '招待コード入力',
                style: TextStyle(
                  color: themeSettings.fontColor1,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'グループの招待コードを入力してください',
                style: TextStyle(color: themeSettings.fontColor1, fontSize: 14),
              ),
              SizedBox(height: 16),
              TextField(
                controller: codeController,
                decoration: InputDecoration(
                  labelText: '招待コード',
                  hintText: '8文字の英数字',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: Icon(Icons.vpn_key),
                ),
                style: TextStyle(fontFamily: 'monospace', letterSpacing: 1),
                textAlign: TextAlign.center,
                maxLength: 8,
                textCapitalization: TextCapitalization.characters,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: isLoading ? null : () => Navigator.of(context).pop(),
              child: Text('キャンセル'),
            ),
            ElevatedButton(
              onPressed: isLoading
                  ? null
                  : () async {
                      final code = codeController.text.trim().toUpperCase();
                      if (code.isEmpty || code.length != 8) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('8文字の招待コードを入力してください')),
                        );
                        return;
                      }

                      setState(() {
                        isLoading = true;
                      });

                      try {
                        final success =
                            await GroupInvitationService.joinGroupWithInvitationCode(
                              code,
                            );

                        if (success) {
                          // ダイアログを閉じる
                          if (!context.mounted) return;
                          Navigator.of(context).pop();

                          // GroupProviderの状態を明示的に更新
                          final groupProvider = context.read<GroupProvider>();
                          await groupProvider.loadUserGroups();

                          // スナックバーを表示
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('グループに参加しました！'),
                              backgroundColor: Colors.green,
                            ),
                          );

                          // 状態の更新を確実に反映させるため少し待機
                          await Future.delayed(Duration(milliseconds: 500));

                          // MainScaffoldに直接遷移（GroupRequiredWrapperを経由しない）
                          if (!context.mounted) return;
                          Navigator.of(context).pushAndRemoveUntil(
                            MaterialPageRoute(
                              builder: (context) =>
                                  MainScaffold(key: mainScaffoldKey),
                            ),
                            (route) => false,
                          );
                        } else if (!success) {
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('招待コードが無効です'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      } catch (e) {
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('エラーが発生しました: ${e.toString()}'),
                            backgroundColor: Colors.red,
                          ),
                        );
                      } finally {
                        setState(() {
                          isLoading = false;
                        });
                      }
                    },
              child: isLoading
                  ? SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text('参加'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompactFeatureItem(String title, ThemeSettings themeSettings) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Container(
            width: 5,
            height: 5,
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: themeSettings.iconColor,
              shape: BoxShape.circle,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: themeSettings.fontColor1.withValues(alpha: 0.8),
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }
}
