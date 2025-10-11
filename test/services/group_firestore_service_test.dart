import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:roastplus/services/group_firestore_service.dart';
import 'package:roastplus/models/group_models.dart';

import 'group_firestore_service_test.mocks.dart';

@GenerateMocks([
  FirebaseFirestore,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  WriteBatch,
  FirebaseAuth,
  User,
])
void main() {
  group('GroupFirestoreService - 担当履歴削除機能', () {
    late MockFirebaseFirestore mockFirestore;
    late MockFirebaseAuth mockAuth;
    late MockUser mockUser;
    late MockCollectionReference mockUsersCollection;
    late MockCollectionReference mockAssignmentHistoryCollection;
    late MockDocumentReference mockUserDoc;
    late MockQuerySnapshot mockQuerySnapshot;
    late MockWriteBatch mockBatch;

    setUp(() {
      mockFirestore = MockFirebaseFirestore();
      mockAuth = MockFirebaseAuth();
      mockUser = MockUser();
      mockUsersCollection = MockCollectionReference();
      mockAssignmentHistoryCollection = MockCollectionReference();
      mockUserDoc = MockDocumentReference();
      mockQuerySnapshot = MockQuerySnapshot();
      mockBatch = MockWriteBatch();

      // 基本的なモック設定
      when(mockUser.uid).thenReturn('test-user-id');
      when(mockAuth.currentUser).thenReturn(mockUser);
      when(mockFirestore.collection('users')).thenReturn(mockUsersCollection);
      when(mockUsersCollection.doc(any)).thenReturn(mockUserDoc);
      when(mockUserDoc.collection('assignmentHistory'))
          .thenReturn(mockAssignmentHistoryCollection);
      when(mockFirestore.batch()).thenReturn(mockBatch);
    });

    test('担当履歴が存在する場合、正常に削除される', () async {
      // Arrange
      final mockDoc1 = MockDocumentReference();
      final mockDoc2 = MockDocumentReference();
      final mockDocs = [mockDoc1, mockDoc2];
      
      when(mockQuerySnapshot.docs).thenReturn(mockDocs);
      when(mockAssignmentHistoryCollection.get())
          .thenAnswer((_) async => mockQuerySnapshot);
      when(mockBatch.commit()).thenAnswer((_) async {});

      final members = [
        GroupMember(
          uid: 'user1',
          email: 'user1@example.com',
          role: GroupRole.member,
          joinedAt: DateTime.now(),
        ),
        GroupMember(
          uid: 'user2',
          email: 'user2@example.com',
          role: GroupRole.member,
          joinedAt: DateTime.now(),
        ),
      ];

      // Act
      await GroupFirestoreService.deleteGroup('test-group-id');

      // Assert
      verify(mockAssignmentHistoryCollection.get()).called(2); // 2人のメンバー
      verify(mockBatch.delete(mockDoc1)).called(1);
      verify(mockBatch.delete(mockDoc2)).called(1);
      verify(mockBatch.commit()).called(2);
    });

    test('担当履歴が存在しない場合、削除処理をスキップする', () async {
      // Arrange
      when(mockQuerySnapshot.docs).thenReturn([]);
      when(mockAssignmentHistoryCollection.get())
          .thenAnswer((_) async => mockQuerySnapshot);

      final members = [
            GroupMember(
              uid: 'user1',
              email: 'user1@example.com',
              role: GroupRole.member,
              joinedAt: DateTime.now(),
            ),
          ];

      // Act
      await GroupFirestoreService.deleteGroup('test-group-id');

      // Assert
      verify(mockAssignmentHistoryCollection.get()).called(1);
      verifyNever(mockBatch.delete(any));
      verifyNever(mockBatch.commit());
    });

    test('担当履歴削除でエラーが発生した場合、他のメンバーの処理は続行される', () async {
      // Arrange
      final mockDoc = MockDocumentReference();
      when(mockQuerySnapshot.docs).thenReturn([mockDoc]);
      when(mockAssignmentHistoryCollection.get())
          .thenAnswer((_) async => mockQuerySnapshot);
      when(mockBatch.commit()).thenThrow(Exception('削除エラー'));

      final members = [
        GroupMember(
          uid: 'user1',
          email: 'user1@example.com',
          role: GroupRole.member,
          joinedAt: DateTime.now(),
        ),
        GroupMember(
          uid: 'user2',
          email: 'user2@example.com',
          role: GroupRole.member,
          joinedAt: DateTime.now(),
        ),
      ];

      // Act & Assert
      // エラーが発生しても例外が投げられないことを確認
      expect(
        () async => await GroupFirestoreService.deleteGroup('test-group-id'),
        returnsNormally,
      );

      // 両方のメンバーに対して処理が実行されることを確認
      verify(mockAssignmentHistoryCollection.get()).called(2);
    });

    test('グループ削除時に担当履歴削除が呼び出される', () async {
      // Arrange
      final group = Group(
        id: 'test-group-id',
        name: 'テストグループ',
        description: 'テスト用グループ',
        createdBy: 'test-user-id',
        createdAt: DateTime.now(),
        members: [
          GroupMember(
            uid: 'user1',
            email: 'user1@example.com',
            role: GroupRole.admin,
            joinedAt: DateTime.now(),
          ),
        ],
      );

      when(mockQuerySnapshot.docs).thenReturn([]);
      when(mockAssignmentHistoryCollection.get())
          .thenAnswer((_) async => mockQuerySnapshot);

      // Act
      await GroupFirestoreService.deleteGroup('test-group-id');

      // Assert
      // 担当履歴削除処理が呼び出されることを確認
      verify(mockAssignmentHistoryCollection.get()).called(1);
    });
  });
}
