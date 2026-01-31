# Firestore セキュリティルール

## 基本ルール

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザードキュメント
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // ローストデータ
    match /roasts/{roastId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## 高度なルール

### バリデーション付きルール

```javascript
match /roasts/{roastId} {
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.name is string
    && request.resource.data.name.size() > 0
    && request.resource.data.name.size() <= 100
    && request.resource.data.createdAt == request.time;

  allow update: if request.auth != null
    && resource.data.userId == request.auth.uid
    && request.resource.data.userId == resource.data.userId
    && request.resource.data.updatedAt == request.time;
}
```

### ロールベースアクセス制御

```javascript
match /posts/{postId} {
  function isAdmin() {
    return request.auth != null
      && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  }

  function isOwner() {
    return request.auth != null
      && resource.data.userId == request.auth.uid;
  }

  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update, delete: if isOwner() || isAdmin();
}
```

### カスタム関数

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return request.auth.uid == userId;
}

function isValidTimestamp(timestamp) {
  return timestamp == request.time;
}

match /roasts/{roastId} {
  allow read: if isAuthenticated() && isOwner(resource.data.userId);
  allow create: if isAuthenticated()
    && isOwner(request.resource.data.userId)
    && isValidTimestamp(request.resource.data.createdAt);
}
```

## テスト

ローカルでセキュリティルールをテスト:

```bash
npm install -g @firebase/rules-unit-testing

firebase emulators:start --only firestore
```

```typescript
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-project',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

test('ユーザーは自分のドキュメントのみ読める', async () => {
  const alice = testEnv.authenticatedContext('alice');
  const bob = testEnv.authenticatedContext('bob');

  await assertSucceeds(alice.firestore().doc('users/alice').get());
  await assertFails(alice.firestore().doc('users/bob').get());
});
```
