---
name: flutter-dart-patterns
description: Flutter/Dart開発パターンとベストプラクティス。状態管理、UI実装、クロスプラットフォーム対応に使用。Flutter、Dart、モバイルアプリ、Riverpod、iOS、Android開発時に使用。
---

# Flutter/Dart 開発パターンスキル

Flutterアプリケーション開発のベストプラクティス、状態管理、クロスプラットフォーム対応をまとめています。

---

## このスキルを使用するタイミング

- Flutterウィジェットを実装するとき
- 状態管理（Riverpod/Provider）を設定するとき
- iOS/Android固有の問題を解決するとき
- PWA対応を実装するとき
- アプリのビルド・リリースを行うとき

---

## 1. プロジェクト構造

### 1.1 推奨ディレクトリ構成

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   ├── extensions/
│   ├── utils/
│   └── theme/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── home/
│       ├── data/
│       ├── domain/
│       └── presentation/
├── shared/
│   ├── widgets/
│   ├── providers/
│   └── services/
└── l10n/
```

### 1.2 Feature構造

```
feature_name/
├── data/
│   ├── datasources/
│   ├── models/
│   └── repositories/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
└── presentation/
    ├── pages/
    ├── widgets/
    └── providers/
```

---

## 2. 状態管理（Riverpod）

### 2.1 Provider定義

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 単純な値
final counterProvider = StateProvider<int>((ref) => 0);

// 非同期データ
final userProvider = FutureProvider<User>((ref) async {
  final repository = ref.watch(userRepositoryProvider);
  return repository.getCurrentUser();
});

// StateNotifier
final settingsProvider = StateNotifierProvider<SettingsNotifier, SettingsState>((ref) {
  return SettingsNotifier();
});
```

### 2.2 StateNotifier パターン

```dart
class SettingsState {
  final ThemeMode themeMode;
  final bool notificationsEnabled;

  const SettingsState({
    this.themeMode = ThemeMode.system,
    this.notificationsEnabled = true,
  });

  SettingsState copyWith({
    ThemeMode? themeMode,
    bool? notificationsEnabled,
  }) {
    return SettingsState(
      themeMode: themeMode ?? this.themeMode,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
    );
  }
}

class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier() : super(const SettingsState());

  void setThemeMode(ThemeMode mode) {
    state = state.copyWith(themeMode: mode);
  }

  void toggleNotifications() {
    state = state.copyWith(notificationsEnabled: !state.notificationsEnabled);
  }
}
```

### 2.3 Consumer使用

```dart
class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final notifier = ref.read(settingsProvider.notifier);

    return Scaffold(
      body: SwitchListTile(
        title: const Text('通知'),
        value: settings.notificationsEnabled,
        onChanged: (_) => notifier.toggleNotifications(),
      ),
    );
  }
}
```

---

## 3. UIパターン

### 3.1 レスポンシブレイアウト

```dart
class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget desktop;

  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    required this.desktop,
  });

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 650;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 650 &&
      MediaQuery.of(context).size.width < 1100;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 1100;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1100) {
          return desktop;
        } else if (constraints.maxWidth >= 650) {
          return tablet ?? mobile;
        } else {
          return mobile;
        }
      },
    );
  }
}
```

### 3.2 カスタムウィジェット

```dart
class AppCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;

  const AppCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Material(
      color: theme.cardColor,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}
```

### 3.3 ローディング・エラー状態

```dart
class AsyncValueWidget<T> extends StatelessWidget {
  final AsyncValue<T> value;
  final Widget Function(T data) data;
  final Widget? loading;
  final Widget Function(Object error, StackTrace stack)? error;

  const AsyncValueWidget({
    super.key,
    required this.value,
    required this.data,
    this.loading,
    this.error,
  });

  @override
  Widget build(BuildContext context) {
    return value.when(
      data: data,
      loading: () => loading ?? const Center(child: CircularProgressIndicator()),
      error: (e, stack) => error?.call(e, stack) ?? Center(
        child: Text('エラーが発生しました: $e'),
      ),
    );
  }
}
```

---

## 4. クロスプラットフォーム対応

### 4.1 プラットフォーム判定

```dart
import 'dart:io';
import 'package:flutter/foundation.dart';

class PlatformHelper {
  static bool get isWeb => kIsWeb;
  static bool get isAndroid => !kIsWeb && Platform.isAndroid;
  static bool get isIOS => !kIsWeb && Platform.isIOS;
  static bool get isMobile => isAndroid || isIOS;
  static bool get isDesktop => !kIsWeb && (Platform.isWindows || Platform.isMacOS || Platform.isLinux);
}
```

### 4.2 iOS固有の問題対応

```dart
// SafeAreaの使用
SafeArea(
  child: Scaffold(
    body: ...,
  ),
)

// ノッチ対応
MediaQuery.of(context).padding.top

// iOSスタイルのナビゲーション
CupertinoPageRoute(
  builder: (context) => DetailPage(),
)
```

### 4.3 PWA対応

```dart
// web/manifest.json の設定
{
  "name": "My App",
  "short_name": "App",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "icons": [
    {
      "src": "icons/Icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/Icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 5. エラーハンドリング

### 5.1 Result型パターン

```dart
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends Result<T> {
  final String message;
  final Object? error;
  const Failure(this.message, [this.error]);
}

// 使用例
Future<Result<User>> getUser(String id) async {
  try {
    final user = await repository.getUser(id);
    return Success(user);
  } catch (e) {
    return Failure('ユーザーの取得に失敗しました', e);
  }
}
```

### 5.2 グローバルエラーハンドリング

```dart
void main() {
  FlutterError.onError = (details) {
    // Crashlyticsに送信など
    debugPrint('Flutter Error: ${details.exception}');
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    debugPrint('Platform Error: $error');
    return true;
  };

  runApp(const MyApp());
}
```

---

## 6. ビルド・リリース

### 6.1 バージョン更新

```yaml
# pubspec.yaml
version: 1.3.1+42
# 形式: MAJOR.MINOR.PATCH+BUILD_NUMBER
```

### 6.2 AABビルド（Android）

```bash
# リリースビルド
flutter build appbundle --release

# 出力先: build/app/outputs/bundle/release/app-release.aab
```

### 6.3 iOSビルド

```bash
# アーカイブ作成
flutter build ios --release

# Xcodeで開いてアーカイブ
open ios/Runner.xcworkspace
```

---

## 7. パフォーマンス最適化

### 7.1 const使用

```dart
// ✅ Good
const Text('Hello');
const SizedBox(height: 16);
const EdgeInsets.all(8);

// ❌ Bad (不要なリビルド)
Text('Hello');
SizedBox(height: 16);
EdgeInsets.all(8);
```

### 7.2 ListView最適化

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ItemWidget(item: items[index]);
  },
)
```

### 7.3 画像最適化

```dart
Image.network(
  imageUrl,
  cacheWidth: 300,
  cacheHeight: 300,
  fit: BoxFit.cover,
)
```

---

## AI アシスタント指示

このスキルが有効な場合：

1. **プラットフォーム確認**: iOS/Android/Web固有の問題かを確認
2. **状態管理の選択**: 適切なProvider種類を選択
3. **UIパターン適用**: レスポンシブ・アクセシビリティを考慮
4. **パフォーマンス意識**: constの使用、リビルド最小化

**必ず守ること**:
- Dart MCP Serverツールを活用する
- `flutter analyze` でエラーチェック
- クロスプラットフォームテスト

**避けること**:
- プラットフォーム固有コードの直接記述（条件分岐を使う）
- 過度なStateの使用
- constミス
