import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../services/passcode_recovery_service.dart';
import '../../utils/app_logger.dart';

/// パスコードリカバリー設定ページ
class PasscodeRecoverySetupPage extends StatefulWidget {
  const PasscodeRecoverySetupPage({super.key});

  @override
  State<PasscodeRecoverySetupPage> createState() =>
      _PasscodeRecoverySetupPageState();
}

class _PasscodeRecoverySetupPageState extends State<PasscodeRecoverySetupPage> {
  final _formKey = GlobalKey<FormState>();
  final _answerController = TextEditingController();

  bool _isLoading = false;
  bool _isSaving = false;
  String? _error;
  bool _hasExistingQuestions = false;
  String? _selectedQuestion;
  String? _customQuestion;

  // セキュリティ質問の選択肢
  static const List<String> _securityQuestions = [
    'あなたの出身地はどこですか？',
    'あなたの最初のペットの名前は何ですか？',
    'あなたの母親の旧姓は何ですか？',
    'あなたの最初の学校の名前は何ですか？',
    'あなたの好きな食べ物は何ですか？',
    'あなたの趣味は何ですか？',
    'あなたの好きな色は何ですか？',
    'あなたの誕生日はいつですか？',
    'あなたの好きな映画は何ですか？',
    'あなたの好きな本は何ですか？',
    'カスタム質問（自分で入力）',
  ];

  @override
  void initState() {
    super.initState();
    _checkExistingQuestions();
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  Future<void> _checkExistingQuestions() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final questions = await PasscodeRecoveryService.getSecurityQuestions();
      if (questions != null) {
        setState(() {
          _hasExistingQuestions = true;
          _selectedQuestion = questions['question'] ?? '';
          // 既存の質問が選択肢にない場合はカスタム質問として扱う
          if (!_securityQuestions.contains(_selectedQuestion)) {
            _customQuestion = _selectedQuestion;
            _selectedQuestion = 'カスタム質問（自分で入力）';
          }
        });
      }
    } catch (e) {
      AppLogger.error(
        'セキュリティ質問の確認に失敗しました',
        name: 'PasscodeRecoverySetupPage',
        error: e,
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _saveSecurityQuestions() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSaving = true;
      _error = null;
    });

    try {
      String question;
      if (_selectedQuestion == 'カスタム質問（自分で入力）') {
        question = _customQuestion?.trim() ?? '';
        if (question.isEmpty) {
          setState(() {
            _error = 'カスタム質問を入力してください';
          });
          return;
        }
      } else {
        question = _selectedQuestion ?? '';
      }

      await PasscodeRecoveryService.setSecurityQuestions(
        question: question,
        answer: _answerController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              _hasExistingQuestions ? 'セキュリティ質問を更新しました' : 'セキュリティ質問を設定しました',
            ),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() {
        _error = '保存に失敗しました: $e';
      });
    } finally {
      setState(() {
        _isSaving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('パスコードリカバリー設定')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('パスコードリカバリー設定'),
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
                                  'セキュリティ質問の設定',
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
                              'パスコードを忘れた場合に使用するセキュリティ質問を設定してください。'
                              'これらの質問は、パスコードのリセット時に本人確認に使用されます。',
                              style: TextStyle(
                                fontSize: 14,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                              ),
                            ),
                            SizedBox(height: 24),

                            // セキュリティ質問の選択
                            _buildQuestionSelector(),
                            SizedBox(height: 20),

                            // 回答入力
                            _buildAnswerField(),

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

                            SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: Icon(Icons.save),
                                label: Text(
                                  _hasExistingQuestions ? '更新' : '設定',
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                ),
                                onPressed: _isSaving
                                    ? null
                                    : _saveSecurityQuestions,
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

  Widget _buildQuestionSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'セキュリティ質問',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Provider.of<ThemeSettings>(context).fontColor1,
          ),
        ),
        SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: _selectedQuestion,
          decoration: InputDecoration(
            labelText: '質問を選択してください',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          items: _securityQuestions.map((String question) {
            return DropdownMenuItem<String>(
              value: question,
              child: Text(question),
            );
          }).toList(),
          onChanged: (String? newValue) {
            setState(() {
              _selectedQuestion = newValue;
              if (newValue != 'カスタム質問（自分で入力）') {
                _customQuestion = null;
              }
            });
          },
          validator: (value) {
            if (value == null || value.isEmpty) {
              return '質問を選択してください';
            }
            return null;
          },
        ),
        if (_selectedQuestion == 'カスタム質問（自分で入力）') ...[
          SizedBox(height: 12),
          TextFormField(
            initialValue: _customQuestion,
            decoration: InputDecoration(
              labelText: 'カスタム質問を入力してください',
              hintText: '例: あなたの出身地はどこですか？',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onChanged: (value) {
              _customQuestion = value;
            },
            validator: (value) {
              if (_selectedQuestion == 'カスタム質問（自分で入力）' &&
                  (value == null || value.trim().isEmpty)) {
                return 'カスタム質問を入力してください';
              }
              return null;
            },
          ),
        ],
      ],
    );
  }

  Widget _buildAnswerField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '回答',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Provider.of<ThemeSettings>(context).fontColor1,
          ),
        ),
        SizedBox(height: 8),
        TextFormField(
          controller: _answerController,
          decoration: InputDecoration(
            labelText: '回答を入力してください',
            hintText: '質問の回答を入力してください',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return '回答を入力してください';
            }
            if (value.trim().length < 2) {
              return '回答は2文字以上で入力してください';
            }
            return null;
          },
        ),
      ],
    );
  }
}
