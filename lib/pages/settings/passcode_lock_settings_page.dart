import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/theme_settings.dart';
import '../../services/user_settings_firestore_service.dart';
import '../../services/app_settings_firestore_service.dart';
import '../../services/secure_storage_service.dart';
import '../../services/passcode_recovery_service.dart';
import 'passcode_recovery_setup_page.dart';
import 'passcode_recovery_page.dart';

class PasscodeLockSettingsPage extends StatefulWidget {
  const PasscodeLockSettingsPage({super.key});

  @override
  State<PasscodeLockSettingsPage> createState() =>
      _PasscodeLockSettingsPageState();
}

class _PasscodeLockSettingsPageState extends State<PasscodeLockSettingsPage> {
  final TextEditingController _passcodeController = TextEditingController();
  final TextEditingController _confirmController = TextEditingController();
  String? _savedPasscode; // 表示用（実際の検証はストレージから実行）
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isLockEnabled = false;
  String? _error;
  bool _hasSecurityQuestions = false;

  @override
  void initState() {
    super.initState();
    _loadPasscode();
  }

  Future<void> _loadPasscode() async {
    try {
      // 複数のソースからパスコード設定を取得
      String? passcode;
      bool isLockEnabled = false;

      // 1. UserSettingsFirestoreServiceから取得を試行
      try {
        final userSettings =
            await UserSettingsFirestoreService.getMultipleSettings([
              'passcode',
              'isLockEnabled',
            ]);
        passcode = userSettings['passcode'];
        isLockEnabled = userSettings['isLockEnabled'] ?? false;
      } catch (e) {
        debugPrint('UserSettingsFirestoreServiceからの取得に失敗: $e');
      }

      // 2. AppSettingsFirestoreServiceから取得を試行（フォールバック）
      if (passcode == null && !isLockEnabled) {
        try {
          final appSettings =
              await AppSettingsFirestoreService.getPasscodeSettings();
          if (appSettings != null) {
            passcode = appSettings['passcode'];
            isLockEnabled = appSettings['passcodeEnabled'] ?? false;
          }
        } catch (e) {
          debugPrint('AppSettingsFirestoreServiceからの取得に失敗: $e');
        }
      }

      // 3. Web版ではSecureStorageServiceからも取得を試行
      if (passcode == null && !isLockEnabled) {
        try {
          final hasStoredPasscode = await SecureStorageService.hasPasscode();
          if (hasStoredPasscode) {
            // パスコードが存在する場合は有効とみなす
            isLockEnabled = true;
            passcode = '***'; // 実際のパスコードは表示しない
          }
        } catch (e) {
          debugPrint('SecureStorageServiceからの取得に失敗: $e');
        }
      }

      // セキュリティ質問の存在確認
      final hasQuestions = await PasscodeRecoveryService.hasSecurityQuestions();

      setState(() {
        _savedPasscode = passcode;
        _isLockEnabled = isLockEnabled;
        _hasSecurityQuestions = hasQuestions;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('パスコード設定読み込みエラー: $e');
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _savePasscode() async {
    if (_passcodeController.text != _confirmController.text) {
      setState(() {
        _error = 'パスコードが一致しません';
      });
      return;
    }

    if (_passcodeController.text.length != 4) {
      setState(() {
        _error = 'パスコードは4桁で入力してください';
      });
      return;
    }

    setState(() {
      _isSaving = true;
      _error = null;
    });

    try {
      final passcode = _passcodeController.text;
      bool allSaved = true;
      String? lastError;

      // 1. UserSettingsFirestoreServiceに保存
      try {
        await UserSettingsFirestoreService.saveMultipleSettings({
          'passcode': passcode,
          'isLockEnabled': true,
        });
        debugPrint('UserSettingsFirestoreServiceに保存完了');
      } catch (e) {
        debugPrint('UserSettingsFirestoreService保存エラー: $e');
        allSaved = false;
        lastError = e.toString();
      }

      // 2. AppSettingsFirestoreServiceに保存
      try {
        await AppSettingsFirestoreService.savePasscodeSettings(
          passcodeEnabled: true,
          passcode: passcode,
        );
        debugPrint('AppSettingsFirestoreServiceに保存完了');
      } catch (e) {
        debugPrint('AppSettingsFirestoreService保存エラー: $e');
        allSaved = false;
        lastError = e.toString();
      }

      // 3. SecureStorageServiceにも保存（Web版・ネイティブ版共通）
      try {
        await SecureStorageService.savePasscode(passcode);
        debugPrint('SecureStorageServiceに保存完了');
      } catch (e) {
        debugPrint('SecureStorageService保存エラー: $e');
        // SecureStorageServiceの失敗は致命的ではない
      }

      if (allSaved) {
        setState(() {
          _savedPasscode = passcode;
          _isLockEnabled = true;
          _isSaving = false;
        });

        _passcodeController.clear();
        _confirmController.clear();

        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('パスコードを設定しました')));
        }
      } else {
        setState(() {
          _error = '一部の保存に失敗しました: $lastError';
          _isSaving = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = '保存に失敗しました: $e';
        _isSaving = false;
      });
    }
  }

  Future<void> _disableLock() async {
    setState(() {
      _isSaving = true;
    });

    try {
      bool allDisabled = true;
      String? lastError;

      // 1. UserSettingsFirestoreServiceから無効化
      try {
        await UserSettingsFirestoreService.saveMultipleSettings({
          'passcode': null,
          'isLockEnabled': false,
        });
        debugPrint('UserSettingsFirestoreService無効化完了');
      } catch (e) {
        debugPrint('UserSettingsFirestoreService無効化エラー: $e');
        allDisabled = false;
        lastError = e.toString();
      }

      // 2. AppSettingsFirestoreServiceから無効化
      try {
        await AppSettingsFirestoreService.savePasscodeSettings(
          passcodeEnabled: false,
          passcode: null,
        );
        debugPrint('AppSettingsFirestoreService無効化完了');
      } catch (e) {
        debugPrint('AppSettingsFirestoreService無効化エラー: $e');
        allDisabled = false;
        lastError = e.toString();
      }

      // 3. SecureStorageServiceからも削除
      try {
        await SecureStorageService.deleteSecureData('app_passcode');
        debugPrint('SecureStorageService削除完了');
      } catch (e) {
        debugPrint('SecureStorageService削除エラー: $e');
        // SecureStorageServiceの失敗は致命的ではない
      }

      if (allDisabled) {
        setState(() {
          _savedPasscode = null;
          _isLockEnabled = false;
          _isSaving = false;
        });

        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('パスコードロックを無効にしました')));
        }
      } else {
        setState(() {
          _error = '一部の無効化に失敗しました: $lastError';
          _isSaving = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = '無効化に失敗しました: $e';
        _isSaving = false;
      });
    }
  }

  // パスコード入力ダイアログ
  Future<bool> _showPasscodeInputDialog() async {
    String input = '';
    String? error;
    return await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (context) {
            return StatefulBuilder(
              builder: (context, setState) {
                return AlertDialog(
                  title: Text('パスコード確認'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('パスコードを入力してください'),
                      SizedBox(height: 12),
                      TextField(
                        autofocus: true,
                        obscureText: true,
                        maxLength: 4,
                        keyboardType: TextInputType.numberWithOptions(
                          decimal: false,
                          signed: false,
                        ),
                        onChanged: (v) {
                          setState(() => input = v);
                        },
                        decoration: InputDecoration(
                          labelText: 'パスコード',
                          errorText: error,
                        ),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: Text('キャンセル'),
                    ),
                    ElevatedButton(
                      onPressed: () async {
                        // パスコード検証を実行
                        final isValid = await _verifyPasscode(input);
                        if (isValid) {
                          Navigator.pop(context, true);
                        } else {
                          setState(() => error = 'パスコードが違います');
                        }
                      },
                      child: Text('OK'),
                    ),
                  ],
                );
              },
            );
          },
        ) ??
        false;
  }

  // パスコード検証
  Future<bool> _verifyPasscode(String inputPasscode) async {
    try {
      // 1. SecureStorageServiceで検証（最優先）
      final secureVerification = await SecureStorageService.verifyPasscode(
        inputPasscode,
      );
      if (secureVerification) {
        debugPrint('SecureStorageServiceでパスコード検証成功');
        return true;
      }

      // 2. UserSettingsFirestoreServiceから取得して検証
      try {
        final userSettings =
            await UserSettingsFirestoreService.getMultipleSettings([
              'passcode',
            ]);
        final storedPasscode = userSettings['passcode'];
        if (storedPasscode != null && inputPasscode == storedPasscode) {
          debugPrint('UserSettingsFirestoreServiceでパスコード検証成功');
          return true;
        }
      } catch (e) {
        debugPrint('UserSettingsFirestoreService検証エラー: $e');
      }

      // 3. AppSettingsFirestoreServiceから取得して検証
      try {
        final appSettings =
            await AppSettingsFirestoreService.getPasscodeSettings();
        if (appSettings != null) {
          final storedPasscode = appSettings['passcode'];
          if (storedPasscode != null && inputPasscode == storedPasscode) {
            debugPrint('AppSettingsFirestoreServiceでパスコード検証成功');
            return true;
          }
        }
      } catch (e) {
        debugPrint('AppSettingsFirestoreService検証エラー: $e');
      }

      debugPrint('パスコード検証失敗: すべてのソースで不一致');
      return false;
    } catch (e) {
      debugPrint('パスコード検証エラー: $e');
      return false;
    }
  }

  Future<void> _requestDisableLock() async {
    final ok = await _showPasscodeInputDialog();
    if (ok) {
      await _disableLock();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('パスコードが正しくありません')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: Text('パスコードロック設定')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text('パスコードロック設定')),
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: 600, // Web版での最大幅を制限
            ),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_isLockEnabled) ...[
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
                                Icon(Icons.lock, color: Colors.green, size: 24),
                                SizedBox(width: 8),
                                Text(
                                  'パスコードロックが有効です',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Provider.of<ThemeSettings>(
                                      context,
                                    ).fontColor1,
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 12),
                            Text(
                              'アプリを開く際にパスコードの入力が必要です',
                              style: TextStyle(
                                fontSize: 14,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                              ),
                            ),
                            SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: Icon(Icons.lock_open),
                                label: Text('パスコードロックを無効にする'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: _isSaving
                                    ? null
                                    : _requestDisableLock,
                              ),
                            ),
                            SizedBox(height: 12),
                            // リカバリー機能のボタン
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    icon: Icon(Icons.security),
                                    label: Text(
                                      _hasSecurityQuestions
                                          ? 'セキュリティ質問を管理'
                                          : 'セキュリティ質問を設定',
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.blue,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    onPressed: () async {
                                      final result = await Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              PasscodeRecoverySetupPage(),
                                        ),
                                      );
                                      if (result == true) {
                                        _loadPasscode(); // ページを再読み込み
                                      }
                                    },
                                  ),
                                ),
                                SizedBox(width: 8),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    icon: Icon(Icons.lock_reset),
                                    label: Text('パスコードをリセット'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.orange,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    onPressed: _hasSecurityQuestions
                                        ? () async {
                                            await Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) =>
                                                    PasscodeRecoveryPage(),
                                              ),
                                            );
                                          }
                                        : null,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ] else ...[
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
                            Text(
                              'パスコードを設定',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Provider.of<ThemeSettings>(
                                  context,
                                ).fontColor1,
                              ),
                            ),
                            SizedBox(height: 16),
                            TextField(
                              controller: _passcodeController,
                              keyboardType: TextInputType.numberWithOptions(
                                decimal: false,
                                signed: false,
                              ),
                              decoration: InputDecoration(
                                labelText: 'パスコード（4桁）',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              maxLength: 4,
                            ),
                            SizedBox(height: 12),
                            TextField(
                              controller: _confirmController,
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
                            ),
                            if (_error != null) ...[
                              SizedBox(height: 8),
                              Text(
                                _error!,
                                style: TextStyle(
                                  color: Colors.red,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                            SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: Icon(Icons.lock),
                                label: Text('パスコードを設定'),
                                style: ElevatedButton.styleFrom(
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: _isSaving ? null : _savePasscode,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
