# リアルタイムリスナーパターン

## 単一ドキュメントの監視

```typescript
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'users', userId).withConverter(userConverter);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUser(snapshot.data());
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { user, loading, error };
}
```

## コレクションの監視

```typescript
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function useRoasts(userId: string) {
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const roastsRef = collection(db, 'roasts').withConverter(roastConverter);
    const q = query(roastsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setRoasts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { roasts, loading };
}
```

## 複数クエリの監視

```typescript
export function useUserDashboard(userId: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    // ユーザー情報
    const userUnsub = onSnapshot(doc(db, 'users', userId), (snap) => {
      // データ更新
    });
    unsubscribes.push(userUnsub);

    // ローストデータ
    const roastsUnsub = onSnapshot(
      query(collection(db, 'roasts'), where('userId', '==', userId)),
      (snap) => {
        // データ更新
      }
    );
    unsubscribes.push(roastsUnsub);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [userId]);

  return { data, loading };
}
```

## エラーハンドリング

```typescript
export function useUserWithErrorHandling(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setUser(snapshot.exists() ? snapshot.data() as User : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(handleFirestoreError(err));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { user, loading, error };
}
```
