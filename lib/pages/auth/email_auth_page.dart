import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../models/theme_settings.dart';
import '../../services/secure_auth_service.dart';
import 'dart:developer' as developer;

/// メールアドレス認証画面（新規登録・ログイン）
class EmailAuthPage extends StatefulWidget {
  const EmailAuthPage({super.key});

  @override
  State<EmailAuthPage> createState() => _EmailAuthPageState();
}

class _EmailAuthPageState extends State<EmailAuthPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _signUpFormKey = GlobalKey<FormState>();
  final _signInFormKey = GlobalKey<FormState>();

  // 新規登録用
  final _signUpEmailController = TextEditingController();
  final _signUpPasswordController = TextEditingController();
  final _signUpDisplayNameController = TextEditingController();

  // ログイン用
  final _signInEmailController = TextEditingController();
  final _signInPasswordController = TextEditingController();

  bool _isLoading = false;
  String? _errorMessage;
  bool _obscureSignUpPassword = true;
  bool _obscureSignInPassword = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _errorMessage = null; // タブ切り替え時にエラーメッセージをクリア
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _signUpEmailController.dispose();
    _signUpPasswordController.dispose();
    _signUpDisplayNameController.dispose();
    _signInEmailController.dispose();
    _signInPasswordController.dispose();
    super.dispose();
  }

  /// 新規登録処理
  Future<void> _handleSignUp() async {
    if (!_signUpFormKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      developer.log(
        'メールアドレスでの新規登録を開始: ${_signUpEmailController.text.trim()}',
        name: 'EmailAuthPage',
      );

      await SecureAuthService.signUpWithEmail(
        _signUpEmailController.text.trim(),
        _signUpPasswordController.text,
        _signUpDisplayNameController.text.trim(),
      );

      developer.log('新規登録が完了しました', name: 'EmailAuthPage');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('アカウントを作成しました'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }

      // 認証成功後、AuthGateが自動的に次の画面に遷移します
    } on FirebaseAuthException catch (e) {
      developer.log('新規登録エラー: ${e.code}', name: 'EmailAuthPage');
      String errorMsg;
      switch (e.code) {
        case 'email-already-in-use':
          errorMsg = 'このメールアドレスは既に使用されています';
          break;
        case 'invalid-email':
          errorMsg = 'メールアドレスの形式が正しくありません';
          break;
        case 'operation-not-allowed':
          errorMsg = 'メールアドレス認証が有効化されていません';
          break;
        case 'weak-password':
          errorMsg = 'パスワードが脆弱です。より強力なパスワードを設定してください';
          break;
        default:
          errorMsg = '新規登録に失敗しました: ${e.message}';
      }
      if (mounted) {
        setState(() {
          _errorMessage = errorMsg;
        });
      }
    } catch (e) {
      developer.log('新規登録で予期しないエラー: $e', name: 'EmailAuthPage');
      if (mounted) {
        setState(() {
          _errorMessage = '予期しないエラーが発生しました。もう一度お試しください。';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// ログイン処理
  Future<void> _handleSignIn() async {
    if (!_signInFormKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      developer.log(
        'メールアドレスでのログインを開始: ${_signInEmailController.text.trim()}',
        name: 'EmailAuthPage',
      );

      await SecureAuthService.signInWithEmail(
        _signInEmailController.text.trim(),
        _signInPasswordController.text,
      );

      developer.log('ログインが完了しました', name: 'EmailAuthPage');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('ログインしました'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }

      // 認証成功後、AuthGateが自動的に次の画面に遷移します
    } on FirebaseAuthException catch (e) {
      developer.log('ログインエラー: ${e.code}', name: 'EmailAuthPage');
      String errorMsg;
      switch (e.code) {
        case 'user-not-found':
          errorMsg = 'このメールアドレスは登録されていません';
          break;
        case 'wrong-password':
          errorMsg = 'パスワードが正しくありません';
          break;
        case 'invalid-email':
          errorMsg = 'メールアドレスの形式が正しくありません';
          break;
        case 'user-disabled':
          errorMsg = 'このアカウントは無効化されています';
          break;
        case 'invalid-credential':
          errorMsg = 'メールアドレスまたはパスワードが正しくありません';
          break;
        default:
          errorMsg = 'ログインに失敗しました: ${e.message}';
      }
      if (mounted) {
        setState(() {
          _errorMessage = errorMsg;
        });
      }
    } catch (e) {
      developer.log('ログインで予期しないエラー: $e', name: 'EmailAuthPage');
      if (mounted) {
        setState(() {
          _errorMessage = '予期しないエラーが発生しました。もう一度お試しください。';
        });
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
    final screenWidth = MediaQuery.of(context).size.width;
    final isWeb = screenWidth > 600;

    return Scaffold(
      backgroundColor: themeSettings.backgroundColor,
      appBar: AppBar(
        title: const Text('ローストプラス'),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
        automaticallyImplyLeading: false,
        bottom: TabBar(
          controller: _tabController,
          labelColor: themeSettings.appBarTextColor,
          unselectedLabelColor: themeSettings.appBarTextColor.withValues(
            alpha: 0.6,
          ),
          indicatorColor: themeSettings.appBarTextColor,
          tabs: const [
            Tab(text: '新規登録'),
            Tab(text: 'ログイン'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: isWeb ? 40.0 : 24.0,
                vertical: 24.0,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: isWeb ? 500 : double.infinity,
                  ),
                  child: _buildSignUpForm(themeSettings),
                ),
              ),
            ),
            SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: isWeb ? 40.0 : 24.0,
                vertical: 24.0,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    maxWidth: isWeb ? 500 : double.infinity,
                  ),
                  child: _buildSignInForm(themeSettings),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 新規登録フォーム
  Widget _buildSignUpForm(ThemeSettings themeSettings) {
    return Form(
      key: _signUpFormKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),

          // アイコン
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: themeSettings.iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(
                color: themeSettings.iconColor.withValues(alpha: 0.3),
                width: 2,
              ),
            ),
            child: Icon(
              Icons.person_add,
              size: 40,
              color: themeSettings.iconColor,
            ),
          ),

          const SizedBox(height: 24),

          // タイトル
          Text(
            'アカウントを作成',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 32),

          // 表示名入力フィールド
          TextFormField(
            controller: _signUpDisplayNameController,
            decoration: InputDecoration(
              labelText: '表示名（名字）',
              hintText: '例: 田中、佐藤',
              prefixIcon: Icon(Icons.person, color: themeSettings.iconColor),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: themeSettings.iconColor,
                  width: 2,
                ),
              ),
              filled: true,
              fillColor: themeSettings.cardBackgroundColor,
            ),
            style: TextStyle(
              fontSize: 16,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return '表示名を入力してください';
              }
              if (value.trim().length < 2) {
                return '表示名は2文字以上で入力してください';
              }
              if (value.trim().length > 30) {
                return '表示名は30文字以内で入力してください';
              }
              return null;
            },
          ),

          const SizedBox(height: 16),

          // メールアドレス入力フィールド
          TextFormField(
            controller: _signUpEmailController,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              labelText: 'メールアドレス',
              hintText: 'example@email.com',
              prefixIcon: Icon(Icons.email, color: themeSettings.iconColor),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: themeSettings.iconColor,
                  width: 2,
                ),
              ),
              filled: true,
              fillColor: themeSettings.cardBackgroundColor,
            ),
            style: TextStyle(
              fontSize: 16,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'メールアドレスを入力してください';
              }
              final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
              if (!emailRegex.hasMatch(value.trim())) {
                return 'メールアドレスの形式が正しくありません';
              }
              return null;
            },
          ),

          const SizedBox(height: 16),

          // パスワード入力フィールド
          TextFormField(
            controller: _signUpPasswordController,
            obscureText: _obscureSignUpPassword,
            decoration: InputDecoration(
              labelText: 'パスワード',
              hintText: '6文字以上',
              prefixIcon: Icon(Icons.lock, color: themeSettings.iconColor),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureSignUpPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: themeSettings.iconColor,
                ),
                onPressed: () {
                  setState(() {
                    _obscureSignUpPassword = !_obscureSignUpPassword;
                  });
                },
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: themeSettings.iconColor,
                  width: 2,
                ),
              ),
              filled: true,
              fillColor: themeSettings.cardBackgroundColor,
            ),
            style: TextStyle(
              fontSize: 16,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'パスワードを入力してください';
              }
              if (value.length < 6) {
                return 'パスワードは6文字以上で入力してください';
              }
              return null;
            },
          ),

          const SizedBox(height: 16),

          // エラーメッセージ
          if (_errorMessage != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 14,
                        fontFamily: themeSettings.fontFamily,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 24),

          // 新規登録ボタン
          SizedBox(
            height: 56,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleSignUp,
              style: ElevatedButton.styleFrom(
                backgroundColor: themeSettings.iconColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
              child: _isLoading
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          '作成中...',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            fontFamily: themeSettings.fontFamily,
                          ),
                        ),
                      ],
                    )
                  : Text(
                      'アカウントを作成',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        fontFamily: themeSettings.fontFamily,
                      ),
                    ),
            ),
          ),

          const SizedBox(height: 16),

          // 注意事項
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.blue.withValues(alpha: 0.3),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.blue, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'アカウント作成後、グループの作成または参加が必要です',
                    style: TextStyle(
                      color: Colors.blue.shade700,
                      fontSize: 14,
                      fontFamily: themeSettings.fontFamily,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// ログインフォーム
  Widget _buildSignInForm(ThemeSettings themeSettings) {
    return Form(
      key: _signInFormKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),

          // アイコン
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: themeSettings.iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: Border.all(
                color: themeSettings.iconColor.withValues(alpha: 0.3),
                width: 2,
              ),
            ),
            child: Icon(Icons.login, size: 40, color: themeSettings.iconColor),
          ),

          const SizedBox(height: 24),

          // タイトル
          Text(
            'ログイン',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: 32),

          // メールアドレス入力フィールド
          TextFormField(
            controller: _signInEmailController,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              labelText: 'メールアドレス',
              hintText: 'example@email.com',
              prefixIcon: Icon(Icons.email, color: themeSettings.iconColor),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: themeSettings.iconColor,
                  width: 2,
                ),
              ),
              filled: true,
              fillColor: themeSettings.cardBackgroundColor,
            ),
            style: TextStyle(
              fontSize: 16,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'メールアドレスを入力してください';
              }
              return null;
            },
          ),

          const SizedBox(height: 16),

          // パスワード入力フィールド
          TextFormField(
            controller: _signInPasswordController,
            obscureText: _obscureSignInPassword,
            decoration: InputDecoration(
              labelText: 'パスワード',
              prefixIcon: Icon(Icons.lock, color: themeSettings.iconColor),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureSignInPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: themeSettings.iconColor,
                ),
                onPressed: () {
                  setState(() {
                    _obscureSignInPassword = !_obscureSignInPassword;
                  });
                },
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: themeSettings.iconColor,
                  width: 2,
                ),
              ),
              filled: true,
              fillColor: themeSettings.cardBackgroundColor,
            ),
            style: TextStyle(
              fontSize: 16,
              color: themeSettings.fontColor1,
              fontFamily: themeSettings.fontFamily,
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'パスワードを入力してください';
              }
              return null;
            },
          ),

          const SizedBox(height: 16),

          // エラーメッセージ
          if (_errorMessage != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 14,
                        fontFamily: themeSettings.fontFamily,
                      ),
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 24),

          // ログインボタン
          SizedBox(
            height: 56,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleSignIn,
              style: ElevatedButton.styleFrom(
                backgroundColor: themeSettings.iconColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 2,
              ),
              child: _isLoading
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          'ログイン中...',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            fontFamily: themeSettings.fontFamily,
                          ),
                        ),
                      ],
                    )
                  : Text(
                      'ログイン',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        fontFamily: themeSettings.fontFamily,
                      ),
                    ),
            ),
          ),

          const SizedBox(height: 16),

          // 補足情報
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.orange.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.orange.withValues(alpha: 0.3),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.help_outline, color: Colors.orange, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'アカウントをお持ちでない場合は、新規登録タブから作成してください',
                    style: TextStyle(
                      color: Colors.orange.shade800,
                      fontSize: 14,
                      fontFamily: themeSettings.fontFamily,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
