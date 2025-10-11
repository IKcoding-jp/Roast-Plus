import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../services/passcode_recovery_service.dart';
import '../../utils/security_config.dart';

/// 管理者によるパスコードリセットページ
class AdminPasscodeResetPage extends StatefulWidget {
  const AdminPasscodeResetPage({super.key});

  @override
  State<AdminPasscodeResetPage> createState() => _AdminPasscodeResetPageState();
}

class _AdminPasscodeResetPageState extends State<AdminPasscodeResetPage> {
  final _formKey = GlobalKey<FormState>();
  final _adminPasswordController = TextEditingController();
  final _newPasscodeController = TextEditingController();
  final _confirmPasscodeController = TextEditingController();

  bool _isLoading = false;
  bool _isResetting = false;
  String? _error;
  String? _success;
  bool _isAdminAuthenticated = false;

  @override
  void dispose() {
    _adminPasswordController.dispose();
    _newPasscodeController.dispose();
    _confirmPasscodeController.dispose();
    super.dispose();
  }

  Future<void> _authenticateAdmin() async {
    if (_adminPasswordController.text.trim().isEmpty) {
      setState(() {
        _error = '管理者パスワードを入力してください';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // 管理者パスワードの検証（実際の実装では適切な管理者認証を使用）
      const adminPasswordHash = 'admin_password_hash'; // 実際の実装では適切なハッシュを使用

      if (!SecurityConfig.verifyPassword(
        _adminPasswordController.text.trim(),
        adminPasswordHash,
      )) {
        setState(() {
          _error = '管理者パスワードが正しくありません';
        });
        return;
      }

      setState(() {
        _isAdminAuthenticated = true;
        _success = '管理者認証が成功しました';
      });
    } catch (e) {
      setState(() {
        _error = '管理者認証に失敗しました: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _resetPasscode() async {
    if (!_formKey.currentState!.validate()) return;

    if (_newPasscodeController.text != _confirmPasscodeController.text) {
      setState(() {
        _error = 'パスコードが一致しません';
      });
      return;
    }

    if (_newPasscodeController.text.length != 4) {
      setState(() {
        _error = 'パスコードは4桁で入力してください';
      });
      return;
    }

    setState(() {
      _isResetting = true;
      _error = null;
    });

    try {
      final success = await PasscodeRecoveryService.adminResetPasscode(
        adminPassword: _adminPasswordController.text.trim(),
        newPasscode: _newPasscodeController.text,
      );

      if (success) {
        setState(() {
          _success = 'パスコードが正常にリセットされました';
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('パスコードがリセットされました'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.pop(context);
        }
      } else {
        setState(() {
          _error = 'パスコードのリセットに失敗しました';
        });
      }
    } catch (e) {
      setState(() {
        _error = 'パスコードのリセットに失敗しました: $e';
      });
    } finally {
      setState(() {
        _isResetting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('管理者によるパスコードリセット'),
        backgroundColor: Provider.of<ThemeSettings>(context).appBarColor,
      ),
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 600),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      color: Provider.of<ThemeSettings>(
                        context,
                      ).cardBackgroundColor,
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.admin_panel_settings,
                                  color: Colors.purple,
                                  size: 24,
                                ),
                                SizedBox(width: 8),
                                Text(
                                  '管理者によるパスコードリセット',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Provider.of<ThemeSettings>(
                                      context,
                                    ).fontColor1,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 16),
                            Text(
                              'この機能は管理者のみが使用できます。'
                              'パスコードを忘れたユーザーのアカウントをリセットするために使用してください。',
                              style: TextStyle(
                                fontSize: 14,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                              ),
                            ),
                            SizedBox(height: 24),

                            if (!_isAdminAuthenticated) ...[
                              TextFormField(
                                controller: _adminPasswordController,
                                obscureText: true,
                                decoration: InputDecoration(
                                  labelText: '管理者パスワード',
                                  hintText: '管理者パスワードを入力してください',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  prefixIcon: Icon(Icons.lock),
                                ),
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return '管理者パスワードを入力してください';
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  icon: Icon(Icons.verified_user),
                                  label: Text('管理者認証'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.purple,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: EdgeInsets.symmetric(vertical: 16),
                                  ),
                                  onPressed: _isLoading
                                      ? null
                                      : _authenticateAdmin,
                                ),
                              ),
                            ] else ...[
                              Container(
                                padding: EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.green.shade200,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.check_circle,
                                      color: Colors.green,
                                      size: 20,
                                    ),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        '管理者認証が完了しました',
                                        style: TextStyle(color: Colors.green),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(height: 24),
                              TextFormField(
                                controller: _newPasscodeController,
                                keyboardType: TextInputType.numberWithOptions(
                                  decimal: false,
                                  signed: false,
                                ),
                                obscureText: true,
                                decoration: InputDecoration(
                                  labelText: '新しいパスコード（4桁）',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  prefixIcon: Icon(Icons.lock),
                                ),
                                maxLength: 4,
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return '新しいパスコードを入力してください';
                                  }
                                  if (value.length != 4) {
                                    return 'パスコードは4桁で入力してください';
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 12),
                              TextFormField(
                                controller: _confirmPasscodeController,
                                keyboardType: TextInputType.numberWithOptions(
                                  decimal: false,
                                  signed: false,
                                ),
                                obscureText: true,
                                decoration: InputDecoration(
                                  labelText: 'パスコード確認',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  prefixIcon: Icon(Icons.lock_outline),
                                ),
                                maxLength: 4,
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return 'パスコード確認を入力してください';
                                  }
                                  if (value != _newPasscodeController.text) {
                                    return 'パスコードが一致しません';
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 24),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  icon: Icon(Icons.lock_reset),
                                  label: Text('パスコードをリセット'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.red,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    padding: EdgeInsets.symmetric(vertical: 16),
                                  ),
                                  onPressed: _isResetting
                                      ? null
                                      : _resetPasscode,
                                ),
                              ),
                            ],

                            if (_error != null) ...[
                              SizedBox(height: 16),
                              Container(
                                padding: EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.red.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.red.shade200,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.error,
                                      color: Colors.red,
                                      size: 20,
                                    ),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _error!,
                                        style: TextStyle(color: Colors.red),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],

                            if (_success != null && _isAdminAuthenticated) ...[
                              SizedBox(height: 16),
                              Container(
                                padding: EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.green.shade50,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: Colors.green.shade200,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.check_circle,
                                      color: Colors.green,
                                      size: 20,
                                    ),
                                    SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _success!,
                                        style: TextStyle(color: Colors.green),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
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
