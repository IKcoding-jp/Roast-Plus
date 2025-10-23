# "Trying to render a disposed EngineFlutterView" エラー修正ガイド

## エラーの原因

このエラーは Flutter の Web 版で発生する重大な問題で、以下の複合的な原因により引き起こされます：

### 1. **非同期操作のタイミング問題**
- UI フレームワークがビューを破棄した後も、バックグラウンド処理がレンダリングを試みる
- WidgetsBinding.instance.addPostFrameCallback() のコールバックがウィジェット破棄後に実行される

### 2. **StreamSubscription のリソースリーク**
- Firebase Firestore のリスナーが dispose() で正しくキャンセルされていない
- メモリ内の参照が残り続ける

### 3. **Provider の状態管理の問題**
- notifyListeners() が破棄済みの Provider で呼ばれる
- mounted チェックが不十分

### 4. **バックグラウンドサービスの不適切なクリーンアップ**
- Web アンロード時にサービスが正しく終了されない
- タイマーが cancel されずに残る

## 実施した修正

### 修正1: GroupProvider の disposed フラグ追加

```dart
class GroupProvider extends ChangeNotifier {
  // ... 他のプロパティ ...
  
  // Disposed状態をトラッキング
  bool _disposed = false;
  
  @override
  void dispose() {
    _disposed = true;  // 最初にフラグを設定
    // 監視を停止
    for (final sub in _groupWatchers.values) {
      sub.cancel();
    }
    // ... 他のクリーンアップ ...
    super.dispose();
  }
}
```

### 修正2: _safeNotifyListeners() の2段階チェック

```dart
void _safeNotifyListeners() {
  try {
    // 1段階目: 即座にチェック
    if (_disposed) {
      return;
    }
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      try {
        // 2段階目: コールバック実行時に再度チェック
        if (!_disposed) {
          notifyListeners();
        }
      } catch (e) {
        if (!_disposed) {
          debugPrint('GroupProvider: notifyListenersエラー: $e');
        }
      }
    });
  } catch (e) {
    if (!_disposed) {
      debugPrint('GroupProvider: _safeNotifyListenersエラー: $e');
    }
  }
}
```

### 修正3: AuthGate のリスナー管理

```dart
class _AuthGateState extends State<AuthGate> {
  StreamSubscription<User?>? _authStateSubscription;
  
  @override
  void initState() {
    super.initState();
    
    // リスナーを StreamSubscription として保存
    _authStateSubscription = FirebaseAuth.instance.authStateChanges().listen(
      (User? user) {
        if (mounted) {  // mounted チェック必須
          setState(() {
            _currentUser = user;
          });
        }
      },
      onError: (e) {
        if (mounted) {
          debugPrint('Error: $e');
        }
      },
    );
  }
  
  @override
  void dispose() {
    // リスナーを明示的にキャンセル
    _authStateSubscription?.cancel();
    super.dispose();
  }
}
```

### 修正4: addPostFrameCallback のガード強化

```dart
WidgetsBinding.instance.addPostFrameCallback((_) async {
  // 1段階目: コールバック開始時のチェック
  if (!mounted) return;
  
  // 非同期処理
  await someAsyncOperation();
  
  // 2段階目: 非同期完了後のチェック
  if (!mounted) return;
  
  // UI更新
  setState(() {
    // ...
  });
});
```

### 修正5: バックグラウンドサービスのエラーハンドリング

```dart
void _initializeBackgroundServices() async {
  WidgetsBinding.instance.addObserver(
    LifecycleEventHandler(
      detachedCallBack: () async {
        // 各サービスの停止を try-catch で保護
        try {
          TodoNotificationService().stopNotificationService();
        } catch (e) {
          developer.log('通知サービス停止エラー: $e', name: 'Main');
        }
        
        try {
          AutoSyncService.dispose();
        } catch (e) {
          developer.log('AutoSyncService停止エラー: $e', name: 'Main');
        }
      },
    ),
  );
}
```

### 修正6: Provider の dispose メソッド追加

```dart
class ThemeSettings extends ChangeNotifier {
  StreamSubscription? _fontSettingsSubscription;
  StreamSubscription? _themeSettingsSubscription;
  
  @override
  void dispose() {
    // すべてのStreamSubscriptionをキャンセル
    _fontSettingsSubscription?.cancel();
    _themeSettingsSubscription?.cancel();
    super.dispose();
  }
}
```

## ベストプラクティス

### 1. 常に mounted チェックを行う

```dart
// ❌ 悪い例
Future<void> loadData() async {
  final data = await fetchData();
  setState(() {
    this.data = data;
  });
}

// ✅ 良い例
Future<void> loadData() async {
  final data = await fetchData();
  if (mounted) {
    setState(() {
      this.data = data;
    });
  }
}
```

### 2. StreamSubscription は必ずキャンセルする

```dart
// ❌ 悪い例
stream.listen((value) {
  // ...
});

// ✅ 良い例
StreamSubscription? subscription;

@override
void initState() {
  super.initState();
  subscription = stream.listen((value) {
    if (mounted) {
      setState(() { /* ... */ });
    }
  });
}

@override
void dispose() {
  subscription?.cancel();
  super.dispose();
}
```

### 3. Provider は dispose() を必ず実装

```dart
class MyProvider extends ChangeNotifier {
  StreamSubscription? _listener;
  
  @override
  void dispose() {
    _listener?.cancel();
    super.dispose();
  }
}
```

### 4. Web 版は特に注意

Web では以下の点に注意：

- ブラウザタブのクローズ時に急激に破棄される
- コンソールエラーが出ていても見落とす可能性がある
- addPostFrameCallback は予測不可能なタイミングで実行される

## テスト方法

修正の検証:

1. **Web 版でテスト**
   - ブラウザの開発者ツール (F12) を開く
   - コンソールで "disposed" エラーが出ないか確認

2. **タブクローズテスト**
   - アプリを起動してからタブを閉じる
   - エラーログに disposed エラーが出ないか確認

3. **高速ナビゲーション**
   - 複数の画面を高速で切り替える
   - エラーが出ないか確認

## 参考資料

- [Flutter WidgetsBinding ドキュメント](https://api.flutter.dev/flutter/widgets/WidgetsBinding-class.html)
- [Dart StreamSubscription](https://api.dart.dev/stable/2.18.0/dart-async/StreamSubscription-class.html)
- [Firebase Firestore Listeners](https://firebase.google.com/docs/firestore/query-data/listen)

## トラブルシューティング

### まだエラーが出る場合

1. ブラウザキャッシュをクリア（Ctrl+Shift+Delete）
2. Flutter clean を実行: `flutter clean`
3. 再ビルド: `flutter build web --release`
4. コンソールに他のエラーが出ていないか確認

### エラーメッセージの詳細

```
════════ Exception caught by scheduler library ═════════════════════════════════
Assertion failed: org-dartlang-sdk:///lib/_engine/engine/window.dart:99:12
!isDisposed
"Trying to render a disposed EngineFlutterView."
```

このメッセージは、Flutter Engine がビューを描画しようとしたときにそのビューが既に破棄されていることを示しています。

---

**作成日**: 2025-10-23
**対象バージョン**: 0.7.20+33 以降
