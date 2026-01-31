# Firestore データ操作パターン

## Converterパターン

型安全なデータ変換:

```typescript
import {
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter
} from 'firebase/firestore';

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User): DocumentData {
    return {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL ?? null,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL ?? undefined,
      preferences: data.preferences,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};

// 使用例
const docRef = doc(db, 'users', userId).withConverter(userConverter);
const docSnap = await getDoc(docRef);
const user = docSnap.data(); // 型はUser
```

## コレクション取得

条件付きクエリ:

```typescript
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function getRoastsByUser(userId: string): Promise<Roast[]> {
  const roastsRef = collection(db, 'roasts').withConverter(roastConverter);

  const q = query(
    roastsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}
```

## ドキュメント作成・更新

```typescript
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// 新規作成
export async function createUser(
  userId: string,
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const docRef = doc(db, 'users', userId);

  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// 部分更新
export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<void> {
  const docRef = doc(db, 'users', userId);

  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
```

## トランザクション

```typescript
import { runTransaction } from 'firebase/firestore';

export async function incrementCounter(docId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const docRef = doc(db, 'counters', docId);
    const docSnap = await transaction.get(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document does not exist!');
    }

    const currentCount = docSnap.data().count;
    transaction.update(docRef, { count: currentCount + 1 });
  });
}
```

## バッチ書き込み

```typescript
import { writeBatch } from 'firebase/firestore';

export async function batchUpdateUsers(updates: Array<{ id: string; data: Partial<User> }>): Promise<void> {
  const batch = writeBatch(db);

  updates.forEach(({ id, data }) => {
    const docRef = doc(db, 'users', id);
    batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}
```
