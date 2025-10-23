import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'dart:async';
import 'pages/business/assignment_board_page.dart' show AssignmentBoard;
import 'package:roastplus/pages/roast/roast_timer_page.dart';
import 'package:roastplus/pages/todo/todo_page.dart';
import 'package:roastplus/pages/drip/drip_counter_page.dart';
import 'package:roastplus/pages/schedule/schedule_page.dart';
import 'pages/home/home_page.dart';
import 'pages/gamification/badge_list_page.dart';
import 'services/sync_firestore_all.dart';
import 'services/todo_notification_service.dart';
import 'services/secure_auth_service.dart';
import 'services/secure_storage_service.dart';
import 'services/app_settings_firestore_service.dart';
import 'services/session_management_service.dart';
import 'services/encrypted_firebase_config_service.dart';
import 'package:provider/provider.dart';
import 'models/theme_settings.dart';
import 'models/group_provider.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'pages/settings/passcode_recovery_page.dart';
import 'services/user_settings_firestore_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'pages/group/group_required_page.dart';
import 'pages/tasting/tasting_record_page.dart';
import 'pages/calendar/calendar_page.dart';
import 'pages/roast/roast_record_list_page.dart';
import 'pages/roast/roast_record_page.dart';
import 'pages/roast/roast_analysis_page.dart';
import 'pages/calculator/calculator_page.dart';
import 'pages/work_progress/work_progress_page.dart';
import 'pages/group/group_list_page.dart';
import 'pages/group/group_info_page.dart';
import 'pages/help/usage_guide_page.dart';
import 'pages/settings/app_settings_page.dart';
import 'dart:developer' as developer;
import 'utils/web_ui_utils.dart';
import 'utils/web_compatibility.dart';
import 'widgets/lottie_animation_widget.dart';
import 'utils/font_optimizer.dart';
import 'pages/auth/email_auth_page.dart';
// navigatorKeyが定義されているファイルをimport

class WorkAssignmentApp extends StatefulWidget {
  const WorkAssignmentApp({super.key});

  @override
  State<WorkAssignmentApp> createState() => _WorkAssignmentAppState();
}

// Web互換性の初期化
void _initializeWebCompatibility() {
  if (WebCompatibility.isWeb) {
    developer.log('Web版互換性モードでアプリ初期化', name: 'WorkAssignmentApp');
  }
}

class _WorkAssignmentAppState extends State<WorkAssignmentApp> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    // Web版では通知サービスを初期化しない
    if (!kIsWeb) {
      TodoNotificationService().setNavigatorKey(_navigatorKey);
    }

    // 通知からアプリが起動された時の処理
    _handleNotificationLaunch();
  }

  // フォントファミリーを動的に設定する関数（最適化版）
  String _getFontFamilyWithFallback(String fontFamily) {
    return FontOptimizer.getFontFamilyWithFallback(fontFamily);
  }

  /// 通知からアプリが起動された時の処理
  void _handleNotificationLaunch() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // 通知ペイロードをチェックして適切な画面に遷移
      // この処理は必要に応じて実装
    });
  }

  @override
  Widget build(BuildContext context) {
    // Web互換性の初期化
    _initializeWebCompatibility();

    return Consumer<ThemeSettings>(
      builder: (context, themeSettings, child) {
        return MaterialApp(
          // キーボードイベントのエラーを防ぐための設定
          builder: (context, child) {
            return MediaQuery(
              data: MediaQuery.of(context).copyWith(
                // キーボードイベントの処理を改善
                viewInsets: MediaQuery.of(context).viewInsets,
              ),
              child: GestureDetector(
                // キーボードイベントのエラーを防ぐため、タップでキーボードを閉じる
                onTap: () {
                  FocusScope.of(context).unfocus();
                  // Web版ではユーザーアクティビティ記録をスキップ
                  if (!kIsWeb) {
                    SessionManagementService.recordUserActivity();
                  }
                },
                child: child!,
              ),
            );
          },
          navigatorKey: _navigatorKey,
          title: 'ローストプラス',
          theme: ThemeData(
            fontFamily: _getFontFamilyWithFallback(themeSettings.fontFamily),
            scaffoldBackgroundColor: themeSettings.backgroundColor,
            primaryColor: themeSettings.appBarColor,
            appBarTheme: AppBarTheme(
              backgroundColor: themeSettings.appBarColor,
              foregroundColor: themeSettings.appBarTextColor,
              iconTheme: IconThemeData(
                color: themeSettings.iconColor,
                size: 24,
              ),
              titleTextStyle: TextStyle(
                color: themeSettings.appBarTextColor,
                fontSize: (20 * themeSettings.fontSizeScale).clamp(16.0, 28.0),
                fontWeight: FontWeight.bold,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
            ),
            bottomNavigationBarTheme: BottomNavigationBarThemeData(
              backgroundColor: themeSettings.bottomNavigationColor,
              selectedItemColor: themeSettings.bottomNavigationSelectedColor
                  .withValues(
                    red: themeSettings.bottomNavigationSelectedColor.r,
                    green: themeSettings.bottomNavigationSelectedColor.g,
                    blue: themeSettings.bottomNavigationSelectedColor.b,
                    alpha: 0.7,
                  ),
              unselectedItemColor:
                  themeSettings.bottomNavigationColor.computeLuminance() > 0.5
                  ? Colors.black
                  : Colors.white,
              selectedLabelStyle: TextStyle(
                fontSize: (12 * themeSettings.fontSizeScale).clamp(8.0, 14.0),
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              unselectedLabelStyle: TextStyle(
                fontSize: (12 * themeSettings.fontSizeScale).clamp(8.0, 14.0),
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              type: BottomNavigationBarType.fixed,
            ),
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                backgroundColor: themeSettings.appButtonColor,
                foregroundColor: themeSettings.fontColor2,
                textStyle: TextStyle(
                  fontSize: (18 * themeSettings.fontSizeScale).clamp(
                    14.0,
                    24.0,
                  ),
                  fontFamily: _getFontFamilyWithFallback(
                    themeSettings.fontFamily,
                  ),
                  fontWeight: FontWeight.bold,
                  color: themeSettings.fontColor2,
                ),
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                elevation: 6,
              ),
            ),
            textTheme: TextTheme(
              bodyMedium: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 14 * themeSettings.fontSizeScale,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              bodyLarge: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 16 * themeSettings.fontSizeScale,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              bodySmall: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 12 * themeSettings.fontSizeScale,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              titleLarge: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 22 * themeSettings.fontSizeScale,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              titleMedium: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 18 * themeSettings.fontSizeScale,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              titleSmall: TextStyle(
                color: themeSettings.fontColor1,
                fontSize: 14 * themeSettings.fontSizeScale,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
            ),
            // 追加: ダイアログテーマ
            dialogTheme: DialogThemeData(
              backgroundColor: themeSettings.dialogBackgroundColor,
              titleTextStyle: TextStyle(
                fontSize: 18 * themeSettings.fontSizeScale,
                fontWeight: FontWeight.bold,
                color: themeSettings.dialogTextColor,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              contentTextStyle: TextStyle(
                fontSize: 14 * themeSettings.fontSizeScale,
                color: themeSettings.dialogTextColor,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
            ),
            // 追加: SnackBarテーマ
            snackBarTheme: SnackBarThemeData(
              backgroundColor: themeSettings.cardBackgroundColor,
              contentTextStyle: TextStyle(
                fontSize: 14 * themeSettings.fontSizeScale,
                color: themeSettings.fontColor1,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
            ),
            // 追加: InputDecorationテーマ
            inputDecorationTheme: InputDecorationTheme(
              labelStyle: TextStyle(
                color: themeSettings.fontColor1,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              hintStyle: TextStyle(
                color: themeSettings.fontColor1.withValues(alpha: 0.6),
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              filled: true,
              fillColor: themeSettings.inputBackgroundColor,
            ),
            // 追加: ListTileテーマ
            listTileTheme: ListTileThemeData(
              titleTextStyle: TextStyle(
                color: themeSettings.fontColor1,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
              subtitleTextStyle: TextStyle(
                color: themeSettings.fontColor1.withValues(alpha: 0.7),
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
            ),
            // 追加: Cardテーマ
            cardTheme: CardThemeData(
              color: themeSettings.cardBackgroundColor,
              elevation: 2,
            ),
            iconTheme: IconThemeData(color: themeSettings.iconColor, size: 24),
            drawerTheme: DrawerThemeData(
              backgroundColor: themeSettings.backgroundColor,
            ),
            dividerColor: Colors.black26,
          ),
          home: AuthGate(
            child: PasscodeGate(
              child: MainScaffold(
                key: mainScaffoldKey,
                // ログイン直後に全データ同期
                // ここではなくAuthGateで呼ぶのがベスト
              ),
            ),
          ),
          routes: {
            // 必須のルート（即座に読み込み）
            '/group_required': (context) => const GroupRequiredPage(),
            '/analytics': (context) => HomePage(),

            '/roast': (context) => RoastTimerPage(showBackButton: true),
            '/roast_record': (context) => RoastRecordPage(),
            '/roast_record_list': (context) => RoastRecordListPage(),
            '/roast_analysis': (context) => RoastAnalysisPage(),
            '/drip': (context) => DripCounterPage(),
            '/tasting': (context) => TastingRecordPage(),
            '/work_progress': (context) => WorkProgressPage(),
            '/calendar': (context) => CalendarPage(),
            '/group': (context) => GroupListPage(),
            '/group_info': (context) => GroupInfoPage(),
            '/badges': (context) => BadgeListPage(),
            '/help': (context) => UsageGuidePage(),
            '/settings': (context) => AppSettingsPage(),
            '/assignment_board': (context) => AssignmentBoard(),
            '/todo': (context) => TodoPage(),
            '/calculator': (context) => CalculatorPage(),
          },
        );
      },
    );
  }
}

/// Google認証必須ガード
class AuthGate extends StatefulWidget {
  final Widget child;
  const AuthGate({required this.child, super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  bool _forceRefresh = false;
  User? _currentUser;
  bool _isInitializing = true;

  @override
  void initState() {
    super.initState();

    // Firebase設定の検証
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final isValid =
          await EncryptedFirebaseConfigService.validateConfiguration();
      if (!isValid) {
        developer.log('❌ AuthGate: Firebase設定が無効です', name: 'AuthGate');
      } else {
        developer.log('✅ AuthGate: Firebase設定が有効です', name: 'AuthGate');
      }
    });

    _initializeAuthState();

    // 認証状態のリスナーを追加（エラーハンドリング付き）
    try {
      FirebaseAuth.instance.authStateChanges().listen((User? user) {
        if (mounted) {
          setState(() {
            _currentUser = user;
            _isInitializing = false;
          });
          developer.log(
            'AuthGate: 認証状態リスナー - user: ${user?.email}',
            name: 'AuthGate',
          );

          // ログアウト後の状態変化を確実に検知
          if (user == null) {
            developer.log(
              'AuthGate: ユーザーがログアウトされました - ログイン画面を表示',
              name: 'AuthGate',
            );
          }
        }
      });
    } catch (e) {
      developer.log('AuthGate: 認証状態リスナーの設定でエラー: $e', name: 'AuthGate');
    }
  }

  // 認証状態の初期化
  Future<void> _initializeAuthState() async {
    try {
      // Firebase Authの初期化を待機
      await Future.delayed(const Duration(milliseconds: 100));

      _checkCurrentUser();

      // 初期化完了をマーク
      if (mounted) {
        setState(() {
          _isInitializing = false;
        });
      }
    } catch (e) {
      developer.log('AuthGate: 認証状態初期化エラー: $e', name: 'AuthGate');
      if (mounted) {
        setState(() {
          _isInitializing = false;
        });
      }
    }
  }

  // 現在のユーザーをチェック
  Future<void> _checkCurrentUser() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      if (mounted) {
        setState(() {
          _currentUser = user;
        });
        developer.log('AuthGate: 現在のユーザー: ${user?.email}', name: 'AuthGate');
      }
    } catch (e) {
      developer.log('AuthGate: ユーザーチェックエラー: $e', name: 'AuthGate');
    }
  }

  // 認証状態を強制的に更新するメソッド
  void forceAuthStateRefresh() {
    setState(() {
      _forceRefresh = !_forceRefresh;
    });
    _checkCurrentUser();
  }

  @override
  Widget build(BuildContext context) {
    // 初期化中はローディング表示
    if (_isInitializing) {
      return const LoadingScreen(title: '認証状態を確認中...');
    }

    // すべてのプラットフォームでFirebase Authの状態をチェック
    try {
      return StreamBuilder<User?>(
        stream: FirebaseAuth.instance.authStateChanges(),
        builder: (context, snapshot) {
          // デバッグログを追加
          developer.log(
            'AuthGate: 認証状態変化 - connectionState: ${snapshot.connectionState}, hasData: ${snapshot.hasData}, user: ${snapshot.data?.email}, _currentUser: ${_currentUser?.email}',
            name: 'AuthGate',
          );

          // Play Store版での認証状態を詳細に記録
          if (snapshot.hasError) {
            developer.log(
              'AuthGate: 認証エラー検出: ${snapshot.error}',
              name: 'AuthGate',
            );
            developer.log(
              'AuthGate: エラータイプ: ${snapshot.error.runtimeType}',
              name: 'AuthGate',
            );
          }

          // 認証状態をより厳密にチェック
          final user = snapshot.data ?? _currentUser;

          // ユーザーが存在しない場合はログイン画面を表示
          if (user == null) {
            developer.log('AuthGate: ユーザーがnull - ログイン画面を表示', name: 'AuthGate');
            return const EmailAuthPage();
          }

          // ユーザーが存在するが、メールアドレスが確認されていない場合はログイン画面を表示
          if (user.email == null || user.email!.isEmpty) {
            developer.log('AuthGate: メールアドレスが空 - ログイン画面を表示', name: 'AuthGate');
            return const EmailAuthPage();
          }

          // ネイティブ版では追加の認証状態チェック（非同期処理のため、FutureBuilderで処理）
          if (!kIsWeb) {
            return FutureBuilder<bool>(
              future: SecureAuthService.isUserAuthenticated(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const LoadingScreen(title: '認証状態を確認中...');
                }

                if (snapshot.hasError) {
                  developer.log(
                    'AuthGate: ネイティブ版認証状態チェックエラー: ${snapshot.error}',
                    name: 'AuthGate',
                  );
                  return const EmailAuthPage();
                }

                final isAuthenticated = snapshot.data ?? false;
                if (!isAuthenticated) {
                  developer.log(
                    'AuthGate: ネイティブ版認証状態チェック失敗 - ログイン画面を表示',
                    name: 'AuthGate',
                  );
                  return const EmailAuthPage();
                }

                developer.log(
                  'AuthGate: 認証成功 - 初回ログインチェックに進む',
                  name: 'AuthGate',
                );
                return FirstLoginWrapper(child: widget.child);
              },
            );
          }

          developer.log('AuthGate: 認証成功 - 初回ログインチェックに進む', name: 'AuthGate');
          // ログイン後は初回ログインチェックを行う
          return FirstLoginWrapper(child: widget.child);
        },
      );
    } catch (e) {
      // Firebase初期化エラーの場合はログイン画面を表示
      developer.log('Firebase Auth初期化エラー: $e', name: 'AuthGate');

      // Web版ではFirebaseExceptionの型エラーを特別に処理
      if (kIsWeb && e.toString().contains('JavaScriptObject')) {
        developer.log(
          'Web版: FirebaseException型エラーを検出、ログイン画面を表示',
          name: 'AuthGate',
        );
      }

      return const EmailAuthPage();
    }
  }
}

/// 初回ログインチェックのラッパー（簡略化版）
/// Email認証では新規登録時に表示名を設定するため、DisplayNameSetupPageは不要
class FirstLoginWrapper extends StatelessWidget {
  final Widget child;

  const FirstLoginWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // 直接グループ参加チェックに進む
    return GroupRequiredWrapper(child: child);
  }
}

/// グループ参加必須のラッパー
class GroupRequiredWrapper extends StatefulWidget {
  final Widget child;

  const GroupRequiredWrapper({super.key, required this.child});

  @override
  State<GroupRequiredWrapper> createState() => _GroupRequiredWrapperState();
}

class _GroupRequiredWrapperState extends State<GroupRequiredWrapper> {
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    // GroupProviderの初期化を開始（一度だけ）
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final groupProvider = Provider.of<GroupProvider>(context, listen: false);

      debugPrint('GroupRequiredWrapper: initState開始');
      debugPrint(
        'GroupRequiredWrapper: 初期状態 - groups: ${groupProvider.groups.length}, loading: ${groupProvider.loading}, initialized: ${groupProvider.initialized}, hasGroup: ${groupProvider.hasGroup}',
      );

      // Web版では初期化処理をより慎重に行う
      if (kIsWeb) {
        // Web版では少し待機してから初期化を開始
        await Future.delayed(Duration(milliseconds: 100));
      }

      // データがなく、読み込み中でもない場合のみ初期化
      if (groupProvider.groups.isEmpty &&
          !groupProvider.loading &&
          !groupProvider.initialized) {
        debugPrint('GroupRequiredWrapper: グループデータの初期化を開始');
        await groupProvider.loadUserGroups();
        debugPrint(
          'GroupRequiredWrapper: グループデータの初期化完了 - groups: ${groupProvider.groups.length}, hasGroup: ${groupProvider.hasGroup}',
        );
      } else if (groupProvider.initialized) {
        debugPrint(
          'GroupRequiredWrapper: グループデータは既に初期化済み - groups: ${groupProvider.groups.length}, hasGroup: ${groupProvider.hasGroup}',
        );
      }

      // 初期化完了フラグを設定
      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GroupProvider>(
      builder: (context, groupProvider, child) {
        // GroupProviderが初期化済みで、かつ読み込み中でない場合は初期化完了とみなす
        if (groupProvider.initialized && !groupProvider.loading) {
          _isInitialized = true;
        }

        // 初期化前またはデータ読み込み中の場合はローディング画面を表示
        if (!_isInitialized ||
            groupProvider.loading ||
            !groupProvider.initialized) {
          debugPrint(
            'GroupRequiredWrapper: ローディング画面を表示中 - _isInitialized: $_isInitialized, provider.initialized: ${groupProvider.initialized}, loading: ${groupProvider.loading}, groups: ${groupProvider.groups.length}, hasGroup: ${groupProvider.hasGroup}',
          );
          return const LoadingScreen(title: 'Loading...');
        }

        // 状態が安定するまで少し待機してから判定を行う
        // グループ参加処理直後の不安定な状態を避けるため
        if (groupProvider.initialized && !groupProvider.loading) {
          // 状態が更新されたばかりの場合は少し待機
          Future.delayed(Duration(milliseconds: 300), () {
            if (mounted && !_isInitialized) {
              setState(() {
                _isInitialized = true;
              });
            }
          });
        }

        // グループ参加状態の判定をより慎重に行う
        final hasGroup = groupProvider.hasGroup;
        final currentGroup = groupProvider.currentGroup;
        final groupsCount = groupProvider.groups.length;

        debugPrint(
          'GroupRequiredWrapper: 状態判定 - initialized: ${groupProvider.initialized}, loading: ${groupProvider.loading}, hasGroup: $hasGroup, groupsCount: $groupsCount, currentGroup: ${currentGroup?.name} (ID: ${currentGroup?.id})',
        );

        // グループに参加していない場合はグループ参加ページを表示
        if (!hasGroup) {
          debugPrint(
            'GroupRequiredWrapper: グループ未参加 - GroupRequiredPageを表示 (groups: $groupsCount, currentGroup: ${currentGroup != null ? "存在" : "null"})',
          );
          return const GroupRequiredPage();
        }

        // グループに参加している場合はメイン画面を表示
        debugPrint(
          'GroupRequiredWrapper: グループ参加済み - メイン画面を表示 (グループ名: ${currentGroup?.name})',
        );
        // データ同期は後で自動的に実行されるため、ここでは実行しない
        return widget.child;
      },
    );
  }
}

class PasscodeGate extends StatefulWidget {
  final Widget child;
  const PasscodeGate({required this.child, super.key});

  @override
  State<PasscodeGate> createState() => _PasscodeGateState();
}

class _PasscodeGateState extends State<PasscodeGate>
    with WidgetsBindingObserver {
  bool _unlocked = false;
  bool _loading = true;
  String? _passcode;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _checkPasscode();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    // Web版では通知サービスを停止しない
    if (!kIsWeb) {
      TodoNotificationService().stopNotificationService();
    }
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      // アプリが復帰した時にパスコードロックをチェック
      _checkPasscodeOnResume();
    }
  }

  Future<void> _checkPasscodeOnResume() async {
    // 複数のソースからパスコード設定を取得
    String? code;
    bool isLockEnabled = false;

    // 1. UserSettingsFirestoreServiceから取得を試行
    try {
      final userSettings =
          await UserSettingsFirestoreService.getMultipleSettings([
            'passcode',
            'isLockEnabled',
          ]);
      code = userSettings['passcode'];
      isLockEnabled = userSettings['isLockEnabled'] ?? false;
    } catch (e) {
      debugPrint('UserSettingsFirestoreServiceからの取得に失敗: $e');
    }

    // 2. AppSettingsFirestoreServiceから取得を試行（フォールバック）
    if (code == null && !isLockEnabled) {
      try {
        final appSettings =
            await AppSettingsFirestoreService.getPasscodeSettings();
        if (appSettings != null) {
          code = appSettings['passcode'];
          isLockEnabled = appSettings['passcodeEnabled'] ?? false;
        }
      } catch (e) {
        debugPrint('AppSettingsFirestoreServiceからの取得に失敗: $e');
      }
    }

    // 3. SecureStorageServiceからも取得を試行
    if (code == null && !isLockEnabled) {
      try {
        final hasStoredPasscode = await SecureStorageService.hasPasscode();
        if (hasStoredPasscode) {
          isLockEnabled = true;
          code = '***'; // 実際のパスコードは表示しない
        }
      } catch (e) {
        debugPrint('SecureStorageServiceからの取得に失敗: $e');
      }
    }

    // パスコードが設定されているかチェック
    bool needsAuth = false;
    if (code != null && isLockEnabled) {
      needsAuth = true;
    }

    if (needsAuth && _unlocked) {
      if (mounted) {
        setState(() {
          _unlocked = false;
        });
      }
    }
  }

  Future<void> _checkPasscode() async {
    // 複数のソースからパスコード設定を取得
    String? code;
    bool isLockEnabled = false;

    // 1. UserSettingsFirestoreServiceから取得を試行
    try {
      final userSettings =
          await UserSettingsFirestoreService.getMultipleSettings([
            'passcode',
            'isLockEnabled',
          ]);
      code = userSettings['passcode'];
      isLockEnabled = userSettings['isLockEnabled'] ?? false;
    } catch (e) {
      debugPrint('UserSettingsFirestoreServiceからの取得に失敗: $e');
    }

    // 2. AppSettingsFirestoreServiceから取得を試行（フォールバック）
    if (code == null && !isLockEnabled) {
      try {
        final appSettings =
            await AppSettingsFirestoreService.getPasscodeSettings();
        if (appSettings != null) {
          code = appSettings['passcode'];
          isLockEnabled = appSettings['passcodeEnabled'] ?? false;
        }
      } catch (e) {
        debugPrint('AppSettingsFirestoreServiceからの取得に失敗: $e');
      }
    }

    // 3. SecureStorageServiceからも取得を試行
    if (code == null && !isLockEnabled) {
      try {
        final hasStoredPasscode = await SecureStorageService.hasPasscode();
        if (hasStoredPasscode) {
          isLockEnabled = true;
          code = '***'; // 実際のパスコードは表示しない
        }
      } catch (e) {
        debugPrint('SecureStorageServiceからの取得に失敗: $e');
      }
    }

    // パスコードが設定されているかチェック
    bool needsAuth = false;
    if (code != null && isLockEnabled) {
      needsAuth = true;
    }

    if (mounted) {
      setState(() {
        _passcode = code;
        _loading = false;
        _unlocked = !needsAuth;
      });
    }
  }

  void _onUnlock() {
    if (mounted) {
      setState(() {
        _unlocked = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const LoadingScreen(title: 'Loading...');
    }
    if (!_unlocked) {
      // パスコードが設定されている場合のみ認証画面を表示
      if (_passcode != null && _passcode!.isNotEmpty) {
        return PasscodeInputScreen(
          onUnlock: _onUnlock,
          correctPasscode: _passcode!,
        );
      } else {
        // パスコードが設定されていない場合は直接アプリを表示
        return widget.child;
      }
    }
    return widget.child;
  }
}

class PasscodeInputScreen extends StatefulWidget {
  final VoidCallback onUnlock;
  final String correctPasscode;
  const PasscodeInputScreen({
    required this.onUnlock,
    required this.correctPasscode,
    super.key,
  });

  @override
  State<PasscodeInputScreen> createState() => _PasscodeInputScreenState();
}

class _PasscodeInputScreenState extends State<PasscodeInputScreen> {
  final TextEditingController _controller = TextEditingController();
  String? _error;
  bool _checking = false;

  void _check() async {
    final input = _controller.text.trim();
    if (input.length != 4 || int.tryParse(input) == null) {
      if (mounted) {
        setState(() {
          _error = '4桁の数字で入力してください';
        });
      }
      return;
    }
    if (mounted) {
      setState(() {
        _checking = true;
      });
    }

    // パスコード検証を実行
    final isValid = await _verifyPasscode(input);

    if (mounted) {
      if (isValid) {
        widget.onUnlock();
      } else {
        setState(() {
          _error = 'パスコードが違います';
          _checking = false;
        });
      }
    }
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

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    // デバイスサイズに応じた設定
    final isMobile = screenWidth < 600;
    final isTablet = screenWidth >= 600 && screenWidth < 900;

    // レスポンシブな値の設定
    final cardMaxWidth = 500.0;
    final horizontalPadding = isMobile ? 16.0 : (isTablet ? 32.0 : 48.0);
    final cardPadding = isMobile ? 24.0 : 32.0;
    final cardElevation = isMobile ? 4.0 : 8.0;
    final iconSize = isMobile ? 48.0 : (isTablet ? 56.0 : 64.0);
    final titleFontSize = isMobile ? 16.0 : (isTablet ? 17.0 : 18.0);
    final inputFontSize = isMobile ? 16.0 : (isTablet ? 17.0 : 18.0);
    final buttonHeight = isMobile ? 48.0 : 52.0;
    final spacing = isMobile ? 16.0 : (isTablet ? 20.0 : 24.0);

    return Scaffold(
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: cardMaxWidth),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: Card(
                elevation: cardElevation,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                color: Provider.of<ThemeSettings>(context).cardBackgroundColor,
                child: Padding(
                  padding: EdgeInsets.all(cardPadding),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.lock_outline,
                        size: iconSize,
                        color: Provider.of<ThemeSettings>(context).iconColor,
                      ),
                      SizedBox(height: spacing),
                      Text(
                        'パスコードを入力してください',
                        style: TextStyle(
                          fontSize: titleFontSize,
                          color: Provider.of<ThemeSettings>(context).fontColor1,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: spacing),
                      TextField(
                        controller: _controller,
                        keyboardType: TextInputType.numberWithOptions(
                          decimal: false,
                          signed: false,
                        ),
                        maxLength: 4,
                        obscureText: true,
                        style: TextStyle(
                          fontSize: inputFontSize,
                          color: Provider.of<ThemeSettings>(context).fontColor1,
                        ),
                        decoration: InputDecoration(
                          labelText: 'パスコード',
                          labelStyle: TextStyle(
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).fontColor1,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          errorText: _error,
                          filled: true,
                          fillColor: Provider.of<ThemeSettings>(
                            context,
                          ).inputBackgroundColor,
                          prefixIcon: Icon(
                            Icons.lock_outline,
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).iconColor,
                          ),
                        ),
                        onSubmitted: (_) => _check(),
                        enabled: !_checking,
                      ),
                      SizedBox(height: spacing),
                      SizedBox(
                        width: double.infinity,
                        height: buttonHeight,
                        child: ElevatedButton(
                          onPressed: _checking ? null : _check,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Provider.of<ThemeSettings>(
                              context,
                            ).appButtonColor,
                            foregroundColor: Provider.of<ThemeSettings>(
                              context,
                            ).fontColor2,
                            textStyle: TextStyle(fontSize: isMobile ? 14 : 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: _checking
                              ? SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Text(
                                  '解除',
                                  style: TextStyle(
                                    fontSize: isMobile ? 14 : 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                      SizedBox(height: 12),
                      TextButton(
                        onPressed: () async {
                          // パスコードリカバリーページに遷移
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => PasscodeRecoveryPage(),
                            ),
                          );
                        },
                        child: Text(
                          'パスコードを忘れた場合',
                          style: TextStyle(
                            color: Provider.of<ThemeSettings>(
                              context,
                            ).fontColor1,
                            decoration: TextDecoration.underline,
                            fontSize: isMobile ? 13 : 14,
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

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

// MainScaffoldのグローバルキー
final GlobalKey<MainScaffoldState> mainScaffoldKey =
    GlobalKey<MainScaffoldState>();

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => MainScaffoldState();
}

class MainScaffoldState extends State<MainScaffold> {
  int _selectedIndex = 2; // デフォルトでホーム画面を表示
  final PageController _pageController = PageController(initialPage: 2);

  // ページを遅延読み込みするためのリスト
  final List<Widget> _pages = [
    RoastTimerPage(showBackButton: false), // 焙煎タイマー
    DripCounterPage(key: dripCounterPageKey), // カウンター
    HomePage(), // ホーム（中央）
    SchedulePage(), // スケジュール
    AssignmentBoard(key: assignmentBoardKey), // 担当表
  ];

  @override
  void initState() {
    super.initState();
    // Web互換性の初期化
    _initializeWebCompatibility();
    // 自動同期サービスを初期化
    _initializeAutoSync();
  }

  // フォントファミリーを動的に設定する関数（フォールバック付き）
  String _getFontFamilyWithFallback(String fontFamily) {
    try {
      switch (fontFamily) {
        case 'Noto Sans JP':
          return GoogleFonts.notoSans().fontFamily ?? 'Noto Sans JP';
        case 'ZenMaruGothic':
          return 'ZenMaruGothic';
        case 'utsukushiFONT':
          return 'utsukushiFONT';
        case 'KiwiMaru':
          return 'KiwiMaru';
        case 'HannariMincho':
          return 'HannariMincho';
        case 'Harenosora':
          return 'Harenosora';
        default:
          return GoogleFonts.notoSans().fontFamily ?? 'Noto Sans JP';
      }
    } catch (e) {
      // エラーが発生した場合はデフォルトフォントを返す
      return 'Noto Sans JP';
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _initializeAutoSync() async {
    // グループ作成直後はAutoSyncServiceの初期化をスキップ（クラッシュ防止のため）

    // GroupProviderを初期化（グループデータの監視は後で開始）
    if (mounted) {
      final groupProvider = context.read<GroupProvider>();
      await groupProvider.loadUserGroups();
      // グループデータの監視は後で開始（クラッシュ防止のため）
    }

    // GamificationProviderの初期化は後で実行（クラッシュ防止のため）
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    _pageController.animateToPage(
      index,
      duration: Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
    // ユーザーアクティビティを記録
    SessionManagementService.recordUserActivity();
  }

  // 外部からタブ切り替えを可能にするpublicメソッド
  void switchToTab(int index) {
    _onItemTapped(index);
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<GroupProvider>(
      builder: (context, groupProvider, child) {
        // グループに参加していない場合はGroupRequiredPageを表示
        if (!groupProvider.hasGroup) {
          return const GroupRequiredPage();
        }

        // WEB版とモバイル版で異なるレイアウトを適用
        if (WebUIUtils.isWeb) {
          return _buildWebLayout();
        } else {
          return _buildMobileLayout();
        }
      },
    );
  }

  /// WEB版用のレイアウトを構築
  Widget _buildWebLayout() {
    final themeSettings = Provider.of<ThemeSettings>(context);
    final isSmallMobile = WebUIUtils.isSmallMobile(context);
    final isMediumMobile = WebUIUtils.isMediumMobile(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(isSmallMobile ? 6 : 8),
              decoration: BoxDecoration(
                color: themeSettings.iconColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(isSmallMobile ? 6 : 8),
              ),
              child: Icon(
                Icons.local_cafe,
                color: themeSettings.iconColor,
                size: isSmallMobile ? 20 : 24,
              ),
            ),
            SizedBox(width: isSmallMobile ? 8 : 12),
            Text(
              'ローストプラス',
              style: TextStyle(
                color: themeSettings.appBarTextColor,
                fontSize:
                    (isSmallMobile ? 18 : (isMediumMobile ? 20 : 22)) *
                    WebUIUtils.getFontSizeScale(context),
                fontWeight: FontWeight.bold,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: themeSettings.appBarColor,
        foregroundColor: themeSettings.appBarTextColor,
        elevation: 0,
        toolbarHeight: isSmallMobile ? 56 : (isMediumMobile ? 63 : 70),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(
            bottom: Radius.circular(isSmallMobile ? 12 : 16),
          ),
        ),
      ),
      body: WebUIUtils.responsiveContainer(
        context: context,
        child: _pages[_selectedIndex],
      ),
    );
  }

  /// モバイル版用のレイアウトを構築（従来の実装）
  Widget _buildMobileLayout() {
    final themeSettings = Provider.of<ThemeSettings>(context);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            SizedBox(width: 8),
            Text(
              'ローストプラス',
              style: TextStyle(
                color: themeSettings.appBarTextColor,
                fontSize: MediaQuery.of(context).size.height < 600 ? 16 : 18,
                fontFamily: _getFontFamilyWithFallback(
                  themeSettings.fontFamily,
                ),
              ),
            ),
          ],
        ),
        toolbarHeight: MediaQuery.of(context).size.height < 600 ? 48 : 56,
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Web版では寄付者チェックをスキップ
            PageView(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _selectedIndex = index;
                });
              },
              children: _pages,
            ),
          ],
        ),
      ),
      bottomNavigationBar: Consumer<ThemeSettings>(
        builder: (context, themeSettings, child) {
          final fontSize = (12 * themeSettings.fontSizeScale).clamp(8.0, 14.0);

          // 画面サイズに応じてボトムナビゲーションの高さを調整
          final screenHeight = MediaQuery.of(context).size.height;
          final screenWidth = MediaQuery.of(context).size.width;

          // 小さい画面では高さを小さく、アイコンサイズも調整
          double barHeight;
          double iconSize;

          if (screenHeight < 600) {
            // 非常に小さい画面（iPhone SE等）
            barHeight = 48.0;
            iconSize = 20.0;
          } else if (screenHeight < 700) {
            // 小さい画面
            barHeight = 52.0;
            iconSize = 22.0;
          } else if (screenHeight < 800) {
            // 中程度の画面
            barHeight = 56.0;
            iconSize = 24.0;
          } else {
            // 大きい画面
            barHeight = (56 + (themeSettings.fontSizeScale - 1.0) * 20).clamp(
              56.0,
              80.0,
            );
            iconSize = 24.0;
          }

          // 幅が狭い場合はフォントサイズを小さく
          final adjustedFontSize = screenWidth < 360
              ? fontSize * 0.8
              : fontSize;

          return SafeArea(
            child: Container(
              height: barHeight,
              decoration: BoxDecoration(
                color: themeSettings.bottomNavigationColor,
                border: Border(
                  top: BorderSide(
                    color: themeSettings.fontColor1.withValues(alpha: 0.1),
                    width: 0.5,
                  ),
                ),
              ),
              child: BottomNavigationBar(
                type: BottomNavigationBarType.fixed,
                currentIndex: _selectedIndex,
                onTap: _onItemTapped,
                backgroundColor: Colors.transparent,
                elevation: 0,
                selectedItemColor: themeSettings.bottomNavigationSelectedColor,
                unselectedItemColor:
                    themeSettings.bottomNavigationUnselectedColor,
                selectedLabelStyle: TextStyle(
                  fontSize: adjustedFontSize,
                  fontFamily: _getFontFamilyWithFallback(
                    themeSettings.fontFamily,
                  ),
                  fontWeight: FontWeight.w600,
                ),
                unselectedLabelStyle: TextStyle(
                  fontSize: adjustedFontSize,
                  fontFamily: _getFontFamilyWithFallback(
                    themeSettings.fontFamily,
                  ),
                  fontWeight: FontWeight.w400,
                ),
                items: [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.local_fire_department, size: iconSize),
                    label: '焙煎タイマー',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.local_cafe, size: iconSize),
                    label: 'カウンター',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.home, size: iconSize),
                    label: 'ホーム',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.pending_actions, size: iconSize),
                    label: 'スケジュール',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.group, size: iconSize),
                    label: '担当表',
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
