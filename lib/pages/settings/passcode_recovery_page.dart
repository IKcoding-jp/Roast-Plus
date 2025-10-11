import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../services/passcode_recovery_service.dart';
import '../../utils/app_logger.dart';

/// パスコードリカバリーページ
class PasscodeRecoveryPage extends StatefulWidget {
  const PasscodeRecoveryPage({super.key});

  @override
  State<PasscodeRecoveryPage> createState() => _PasscodeRecoveryPageState();
}

class _PasscodeRecoveryPageState extends State<PasscodeRecoveryPage> {
  final _formKey = GlobalKey<FormState>();
  final _newPasscodeController = TextEditingController();
  final _confirmPasscodeController = TextEditingController();
  final _answerController = TextEditingController();

  bool _isLoading = true;
  bool _isVerifying = false;
  bool _isResetting = false;
  String? _error;
  String? _success;
  Map<String, String>? _securityQuestions;
  bool _isRecoveryLocked = false;
  String _recoveryMethod = 'questions'; // 'questions' or 'token'

  @override
  void initState() {
    super.initState();
    _loadRecoveryData();
  }

  @override
  void dispose() {
    _newPasscodeController.dispose();
    _confirmPasscodeController.dispose();
    _answerController.dispose();
    super.dispose();
  }

  Future<void> _loadRecoveryData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // セキュリティ質問を取得
      final questions = await PasscodeRecoveryService.getSecurityQuestions();
      if (questions != null) {
        setState(() {
          _securityQuestions = questions;
        });
      }

      // リカバリー試行回数を取得
      final attempts = await PasscodeRecoveryService.getRecoveryAttempts();

      // ロック状態をチェック
      if (attempts >= 3) {
        setState(() {
          _isRecoveryLocked = true;
        });
      }
    } catch (e) {
      AppLogger.error(
        'リカバリーデータの読み込みに失敗しました',
        name: 'PasscodeRecoveryPage',
        error: e,
      );
      setState(() {
        _error = 'データの読み込みに失敗しました';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _verifySecurityAnswers() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isVerifying = true;
      _error = null;
    });

    try {
      final isVerified = await PasscodeRecoveryService.verifySecurityAnswers(
        answer: _answerController.text.trim(),
      );

      if (isVerified) {
        setState(() {
          _success = '認証が成功しました。新しいパスコードを設定してください。';
          _recoveryMethod = 'questions';
        });
      } else {
        setState(() {
          _error = 'セキュリティ質問の回答が正しくありません';
        });
      }
    } catch (e) {
      setState(() {
        _error = '認証に失敗しました: $e';
      });
    } finally {
      setState(() {
        _isVerifying = false;
      });
    }
  }

  Future<void> _resetPasscode() async {
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
      final success = await PasscodeRecoveryService.resetPasscode(
        newPasscode: _newPasscodeController.text,
        recoveryMethod: _recoveryMethod,
      );

      if (success) {
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
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('パスコードリカバリー')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_isRecoveryLocked) {
      return Scaffold(
        appBar: AppBar(title: Text('パスコードリカバリー')),
        body: Container(
          color: Theme.of(context).scaffoldBackgroundColor,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 600),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  color: Provider.of<ThemeSettings>(
                    context,
                  ).cardBackgroundColor,
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.lock_outline, size: 64, color: Colors.red),
                        SizedBox(height: 16),
                        Text(
                          'リカバリー試行回数が上限に達しました',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                        SizedBox(height: 12),
                        Text(
                          'セキュリティのため、30分間リカバリー機能がロックされています。'
                          'しばらく時間をおいてから再度お試しください。',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).fontColor1,
                          ),
                        ),
                        SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          child: Text('戻る'),
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

    if (_securityQuestions == null) {
      return Scaffold(
        appBar: AppBar(title: Text('パスコードリカバリー')),
        body: Container(
          color: Theme.of(context).scaffoldBackgroundColor,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: 600),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  color: Provider.of<ThemeSettings>(
                    context,
                  ).cardBackgroundColor,
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.warning, size: 64, color: Colors.orange),
                        SizedBox(height: 16),
                        Text(
                          'セキュリティ質問が設定されていません',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.orange,
                          ),
                        ),
                        SizedBox(height: 12),
                        Text(
                          'パスコードのリカバリーには、事前にセキュリティ質問の設定が必要です。'
                          '設定ページでセキュリティ質問を設定してください。',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).fontColor1,
                          ),
                        ),
                        SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          child: Text('戻る'),
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

    return Scaffold(
      appBar: AppBar(
        title: Text('パスコードリカバリー'),
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
                                  Icons.security,
                                  color: Colors.blue,
                                  size: 24,
                                ),
                                SizedBox(width: 8),
                                Text(
                                  'セキュリティ質問による認証',
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
                              'パスコードをリセットするために、設定したセキュリティ質問に回答してください。',
                              style: TextStyle(
                                fontSize: 14,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                              ),
                            ),
                            SizedBox(height: 24),

                            // セキュリティ質問
                            _buildQuestionField(
                              question: _securityQuestions!['question']!,
                              controller: _answerController,
                            ),

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

                            if (_success != null) ...[
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

                            SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: Icon(Icons.verified_user),
                                label: Text('認証'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                ),
                                onPressed: _isVerifying
                                    ? null
                                    : _verifySecurityAnswers,
                              ),
                            ),

                            if (_success != null) ...[
                              SizedBox(height: 24),
                              Divider(),
                              SizedBox(height: 16),
                              Text(
                                '新しいパスコードを設定',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Provider.of<ThemeSettings>(
                                    context,
                                  ).fontColor1,
                                ),
                              ),
                              SizedBox(height: 16),
                              TextField(
                                controller: _newPasscodeController,
                                keyboardType: TextInputType.numberWithOptions(
                                  decimal: false,
                                  signed: false,
                                ),
                                decoration: InputDecoration(
                                  labelText: '新しいパスコード（4桁）',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                maxLength: 4,
                                obscureText: true,
                              ),
                              SizedBox(height: 12),
                              TextField(
                                controller: _confirmPasscodeController,
                                keyboardType: TextInputType.numberWithOptions(
                                  decimal: false,
                                  signed: false,
                                ),
                                decoration: InputDecoration(
                                  labelText: 'パスコード確認',
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                maxLength: 4,
                                obscureText: true,
                              ),
                              SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  icon: Icon(Icons.lock_reset),
                                  label: Text('パスコードをリセット'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
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

  Widget _buildQuestionField({
    required String question,
    required TextEditingController controller,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'セキュリティ質問',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Provider.of<ThemeSettings>(context).fontColor1,
          ),
        ),
        SizedBox(height: 4),
        Text(
          question,
          style: TextStyle(
            fontSize: 14,
            color: Provider.of<ThemeSettings>(context).fontColor1,
          ),
        ),
        SizedBox(height: 8),
        TextFormField(
          controller: controller,
          decoration: InputDecoration(
            labelText: '回答',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return '回答を入力してください';
            }
            return null;
          },
        ),
      ],
    );
  }
}
