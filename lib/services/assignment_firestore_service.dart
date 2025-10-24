import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';

class AssignmentFirestoreService {
  static final _firestore = FirebaseFirestore.instance;
  static final _auth = FirebaseAuth.instance;

  // リトライ設定
  static const int _maxRetries = 3;
  static const Duration _retryDelay = Duration(seconds: 2);
  static const Duration _timeout = Duration(seconds: 30);

  static String? get _uid => _auth.currentUser?.uid;

  /// リトライ機能付きの操作実行
  static Future<T> _retryOperation<T>(Future<T> Function() operation) async {
    int retryCount = 0;
    while (true) {
      try {
        return await operation().timeout(_timeout);
      } catch (e) {
        retryCount++;
        developer.log(
          '担当表操作失敗 (試行 $retryCount/$_maxRetries): $e',
          name: 'AssignmentFirestoreService',
          error: e,
        );

        if (retryCount >= _maxRetries) {
          developer.log(
            '担当表操作: 最大リトライ回数に達しました',
            name: 'AssignmentFirestoreService',
          );
          rethrow;
        }

        // リトライ前に少し待機
        await Future.delayed(_retryDelay);
        developer.log('担当表操作: リトライ中...', name: 'AssignmentFirestoreService');
      }
    }
  }

  /// 担当表のメンバー・ラベルを保存
  static Future<void> saveAssignmentMembers({
    required List<String> aMembers,
    required List<String> bMembers,
    required List<String> leftLabels,
    required List<String> rightLabels,
  }) async {
    if (_uid == null) throw Exception('未ログイン');
    await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentMembers')
        .doc('assignment')
        .set({
          'aMembers': aMembers,
          'bMembers': bMembers,
          'leftLabels': leftLabels,
          'rightLabels': rightLabels,
          'savedAt': FieldValue.serverTimestamp(),
        });
  }

  /// 担当表の班データ（新しい形式）を保存
  static Future<void> saveAssignmentTeams({
    required List<Map<String, dynamic>> teams,
    required List<String> leftLabels,
    required List<String> rightLabels,
  }) async {
    if (_uid == null) throw Exception('未ログイン');
    await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentMembers')
        .doc('assignment')
        .set({
          'teams': teams,
          'leftLabels': leftLabels,
          'rightLabels': rightLabels,
          'savedAt': FieldValue.serverTimestamp(),
        });
  }

  /// 担当表のメンバー・ラベルを取得
  static Future<Map<String, dynamic>?> loadAssignmentMembers() async {
    return _retryOperation(() async {
      if (_uid == null) throw Exception('未ログイン');

      developer.log('担当表データ取得開始', name: 'AssignmentFirestoreService');

      // Web版ではFirestoreの初期化を確実に行う
      if (kIsWeb) {
        try {
          // まず現在の接続をクリーンアップ
          await _firestore.disableNetwork();
          await Future.delayed(Duration(milliseconds: 500));

          // ネットワークを再有効化
          await _firestore.enableNetwork();
          developer.log(
            'Web版: Firestoreネットワーク再有効化完了',
            name: 'AssignmentFirestoreService',
          );

          // 少し待機して接続を安定させる
          await Future.delayed(Duration(milliseconds: 1000));
        } catch (e) {
          developer.log(
            'Web版: Firestoreネットワーク有効化エラー: $e',
            name: 'AssignmentFirestoreService',
          );
          // エラーが発生しても続行
        }
      }

      final doc = await _firestore
          .collection('users')
          .doc(_uid)
          .collection('assignmentMembers')
          .doc('assignment')
          .get()
          .timeout(_timeout);

      if (!doc.exists) {
        developer.log('担当表データが存在しません', name: 'AssignmentFirestoreService');
        return null;
      }

      developer.log('担当表データ取得成功', name: 'AssignmentFirestoreService');
      return doc.data();
    });
  }

  /// 担当表のメンバー・ラベルデータをクリア
  static Future<void> clearAssignmentMembers() async {
    if (_uid == null) throw Exception('未ログイン');
    await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentMembers')
        .doc('assignment')
        .delete();
  }

  /// 担当履歴を保存
  static Future<void> saveAssignmentHistory({
    required String dateKey,
    required List<String> assignments,
    required List<String> leftLabels,
    required List<String> rightLabels,
  }) async {
    if (_uid == null) throw Exception('未ログイン');
    await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentHistory')
        .doc(dateKey)
        .set({
          'assignments': assignments,
          'leftLabels': leftLabels,
          'rightLabels': rightLabels,
          'savedAt': FieldValue.serverTimestamp(),
        });
  }

  /// 担当履歴を取得
  static Future<List<String>?> loadAssignmentHistory(String dateKey) async {
    return _retryOperation(() async {
      if (_uid == null) throw Exception('未ログイン');

      developer.log('担当履歴取得開始: $dateKey', name: 'AssignmentFirestoreService');

      final doc = await _firestore
          .collection('users')
          .doc(_uid)
          .collection('assignmentHistory')
          .doc(dateKey)
          .get()
          .timeout(_timeout);

      if (!doc.exists) {
        developer.log(
          '担当履歴が存在しません: $dateKey',
          name: 'AssignmentFirestoreService',
        );
        return null;
      }

      final data = doc.data();
      if (data == null || data['assignments'] == null) {
        developer.log(
          '担当履歴データが無効です: $dateKey',
          name: 'AssignmentFirestoreService',
        );
        return null;
      }

      developer.log('担当履歴取得成功: $dateKey', name: 'AssignmentFirestoreService');
      return List<String>.from(data['assignments']);
    });
  }

  /// 担当履歴とラベル情報を取得
  static Future<Map<String, dynamic>?> loadAssignmentHistoryWithLabels(
    String dateKey,
  ) async {
    if (_uid == null) throw Exception('未ログイン');
    final doc = await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentHistory')
        .doc(dateKey)
        .get();
    if (!doc.exists) return null;
    final data = doc.data();
    if (data == null) return null;
    return {
      'assignments': data['assignments'] != null
          ? List<String>.from(data['assignments'])
          : [],
      'leftLabels': data['leftLabels'] != null
          ? List<String>.from(data['leftLabels'])
          : [],
      'rightLabels': data['rightLabels'] != null
          ? List<String>.from(data['rightLabels'])
          : [],
    };
  }

  /// 担当履歴を削除
  static Future<void> deleteAssignmentHistory(String dateKey) async {
    if (_uid == null) throw Exception('未ログイン');
    await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentHistory')
        .doc(dateKey)
        .delete();
  }

  /// 指定した日付の担当履歴をすべて削除
  static Future<void> deleteAllAssignmentHistory({
    required String dateKey,
  }) async {
    if (_uid == null) throw Exception('未ログイン');
    await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentHistory')
        .doc(dateKey)
        .delete();
  }

  /// 担当履歴を全件取得
  static Future<Map<String, List<String>>> loadAllAssignmentHistory() async {
    if (_uid == null) throw Exception('未ログイン');
    final snapshot = await _firestore
        .collection('users')
        .doc(_uid)
        .collection('assignmentHistory')
        .orderBy('savedAt', descending: true)
        .get();
    final result = <String, List<String>>{};
    for (final doc in snapshot.docs) {
      final data = doc.data();
      if (data['assignments'] != null) {
        result[doc.id] = List<String>.from(data['assignments']);
      }
    }
    return result;
  }
}
