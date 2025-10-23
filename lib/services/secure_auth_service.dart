import 'dart:developer' as developer;
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

/// セキュアな認証サービス
/// Firebase Email/Password認証を管理するセキュアな認証サービス
class SecureAuthService {
  static const String _logName = 'SecureAuthService';
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  /// メールアドレスとパスワードで新規登録
  static Future<UserCredential> signUpWithEmail(
    String email,
    String password,
    String displayName,
  ) async {
    try {
      developer.log('メールアドレスでの新規登録を開始: $email', name: _logName);

      // Firebase Authで新規ユーザーを作成
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = userCredential.user;
      if (user == null) {
        throw Exception('ユーザーの作成に失敗しました');
      }

      developer.log('Firebase Auth登録完了: ${user.uid}', name: _logName);

      // 表示名をFirebase Authのプロフィールに設定
      await user.updateDisplayName(displayName);
      await user.reload();

      developer.log('表示名を設定: $displayName', name: _logName);

      // Firestoreにユーザー情報を保存
      await _firestore.collection('users').doc(user.uid).set({
        'displayName': displayName,
        'email': email,
        'createdAt': FieldValue.serverTimestamp(),
        'lastLogin': FieldValue.serverTimestamp(),
        'loginProvider': 'Email',
      });

      developer.log('Firestoreにユーザー情報を保存完了', name: _logName);

      // セキュリティイベントを記録
      await logSecurityEvent('email_signup_success');

      developer.log('新規登録が完了しました', name: _logName);
      return userCredential;
    } catch (e) {
      developer.log('新規登録でエラーが発生: $e', name: _logName);
      rethrow;
    }
  }

  /// メールアドレスとパスワードでログイン
  static Future<UserCredential> signInWithEmail(
    String email,
    String password,
  ) async {
    try {
      developer.log('メールアドレスでのログインを開始: $email', name: _logName);

      // Firebase Authでログイン
      final userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = userCredential.user;
      if (user == null) {
        throw Exception('ログインに失敗しました');
      }

      developer.log('Firebase Authログイン完了: ${user.uid}', name: _logName);

      // Firestoreのユーザー情報を更新（最終ログイン時刻）
      await _firestore.collection('users').doc(user.uid).update({
        'lastLogin': FieldValue.serverTimestamp(),
      });

      developer.log('最終ログイン時刻を更新', name: _logName);

      // セキュリティイベントを記録
      await logSecurityEvent('email_login_success');

      developer.log('ログインが完了しました', name: _logName);
      return userCredential;
    } catch (e) {
      developer.log('ログインでエラーが発生: $e', name: _logName);
      rethrow;
    }
  }

  /// セキュアなサインアウト
  static Future<void> signOut() async {
    try {
      developer.log('サインアウトを開始', name: _logName);

      // Firebaseからサインアウト
      await _auth.signOut();

      developer.log('サインアウトが完了しました', name: _logName);
    } catch (e) {
      developer.log('サインアウトでエラーが発生: $e', name: _logName);
      rethrow;
    }
  }

  /// 現在のユーザーの認証状態を確認
  static Future<bool> isUserAuthenticated() async {
    try {
      final user = _auth.currentUser;
      if (user == null) {
        developer.log('認証状態確認: ユーザーがnull', name: _logName);
        return false;
      }

      developer.log('認証状態確認: ユーザーが存在 - ${user.email}', name: _logName);
      return true;
    } catch (e) {
      developer.log('認証状態の確認に失敗: $e', name: _logName);
      return false;
    }
  }

  /// 認証状態を強制的に更新
  static Future<void> forceAuthStateRefresh() async {
    try {
      developer.log('認証状態の強制更新を開始', name: _logName);

      // 現在のユーザーを再取得
      await _auth.currentUser?.reload();
      final user = _auth.currentUser;

      developer.log('認証状態強制更新完了 - user: ${user?.email}', name: _logName);
    } catch (e) {
      developer.log('認証状態の強制更新でエラー: $e', name: _logName);
    }
  }

  /// セキュリティ監査ログを記録
  static Future<void> logSecurityEvent(
    String event, {
    Map<String, dynamic>? details,
  }) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      await _firestore
          .collection('users')
          .doc(user.uid)
          .collection('security_logs')
          .add({
            'event': event,
            'details': details ?? {},
            'timestamp': FieldValue.serverTimestamp(),
            'userAgent': 'flutter_app',
          });

      developer.log('セキュリティイベントを記録: $event', name: _logName);
    } catch (e) {
      developer.log('セキュリティログの記録に失敗: $e', name: _logName);
    }
  }

  /// 認証セッションの更新
  static Future<void> refreshAuthSession() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return;

      // ユーザー情報をリロード
      await user.reload();

      // セキュリティログを記録
      await logSecurityEvent('session_refreshed');

      developer.log('認証セッションを更新しました', name: _logName);
    } catch (e) {
      developer.log('セッションの更新に失敗: $e', name: _logName);
    }
  }

  /// パスワードリセットメールを送信
  static Future<void> sendPasswordResetEmail(String email) async {
    try {
      developer.log('パスワードリセットメール送信: $email', name: _logName);

      await _auth.sendPasswordResetEmail(email: email);

      developer.log('パスワードリセットメールを送信しました', name: _logName);
    } catch (e) {
      developer.log('パスワードリセットメール送信でエラー: $e', name: _logName);
      rethrow;
    }
  }
}
