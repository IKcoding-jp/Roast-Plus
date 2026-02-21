# Firestore セキュリティルール（RoastPlus実装）

## 現行ルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ===============================
    // ユーザードキュメント（メインデータ）
    // ===============================
    // /users/{userId} - AppData（全機能の統合データ）
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // ===============================
    // サブコレクション（担当表機能）
    // ===============================
    // 全てユーザースコープ: 自分のデータのみアクセス可
    match /users/{userId}/teams/{teamId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/members/{memberId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/managers/{managerId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/taskLabels/{taskLabelId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/assignmentDays/{dayId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/shuffleEvents/{eventId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/shuffleHistory/{historyId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/assignmentSettings/{settingId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/pairExclusions/{exclusionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // ===============================
    // グローバルコレクション
    // ===============================
    // 欠陥豆マスターデータ（全認証ユーザーが読み書き可）
    match /defectBeans/{defectBeanId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## ルール設計の原則

### 1. 認証必須

全ルールに `request.auth != null` を要求。未認証アクセスは一切不可。

### 2. ユーザースコープ

`request.auth.uid == userId` でデータアクセスを本人に制限。他ユーザーのデータは読み取りも不可。

### 3. ワイルドカード不使用

```javascript
// ❌ 危険: サブコレクション全体にワイルドカード
match /users/{userId}/{subcollection=**} {
  allow read, write: if request.auth.uid == userId;
}

// ✅ 安全: 各サブコレクションを明示的に定義
match /users/{userId}/members/{memberId} {
  allow read, write: if request.auth.uid == userId;
}
```

新しいサブコレクション追加時は明示的にルールを追加する。

## ルール変更時のチェックリスト

1. **認証チェック**: `request.auth != null` が全ルールに含まれているか
2. **ユーザースコープ**: 他ユーザーのデータにアクセスできないか
3. **書き込みバリデーション**: 必要に応じてフィールドの型チェックを追加
4. **テスト**: Firebase Emulatorでルールをテスト

```bash
# ローカルテスト
firebase emulators:start --only firestore
```

## バリデーション付きルール（必要に応じて追加）

```javascript
// 例: 書き込みデータのバリデーション
match /users/{userId}/members/{memberId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null
    && request.auth.uid == userId
    && request.resource.data.name is string
    && request.resource.data.name.size() > 0
    && request.resource.data.name.size() <= 50;
  allow update: if request.auth != null
    && request.auth.uid == userId;
  allow delete: if request.auth != null
    && request.auth.uid == userId;
}
```
