# よくあるエラーパターンと解決方法

RoastPlusで頻繁に遭遇するエラーパターンと、その原因・解決方法・予防策をまとめています。

## 目次

1. [Firestore権限エラー](#1-firestore権限エラー)
2. [React Hook依存配列エラー](#2-react-hook依存配列エラー)
3. [TypeScript型エラー（型推論失敗）](#3-typescript型エラー型推論失敗)
4. [ハイドレーションミスマッチ](#4-ハイドレーションミスマッチ)
5. [localStorage未定義エラー（SSR）](#5-localstorage未定義エラーssr)
6. [Framer Motion警告（layoutId重複）](#6-framer-motion警告layoutid重複)
7. [ビルドエラー（Dynamic import）](#7-ビルドエラーdynamic-import)
8. [ESLint警告（exhaustive-deps）](#8-eslint警告exhaustive-deps)

---

## 1. Firestore権限エラー

### エラーメッセージ

```
FirebaseError: Missing or insufficient permissions.
Error: Permission denied. PERMISSION_DENIED: Missing or insufficient permissions.
```

### 原因

- Firestoreセキュリティルールが適切に設定されていない
- 認証トークンが期限切れ
- クライアント側の `uid` とルールの `request.auth.uid` が不一致
- ルールで許可されていないフィールドへのアクセス

### 解決方法

#### ステップ1: セキュリティルールを確認

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // ✅ OK: ユーザー自身のドキュメントのみ読み書き可能
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // ❌ NG: 無制限に開放（本番環境で絶対に使わない）
      allow read, write: if true;
    }

    match /coffees/{coffeeId} {
      // ✅ OK: 認証済みユーザーは読み取り可能、作成者のみ書き込み可能
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      (request.resource.data.createdBy == request.auth.uid ||
                       resource.data.createdBy == request.auth.uid);
    }
  }
}
```

#### ステップ2: 認証状態を確認

```tsx
// app/your-page/page.tsx
'use client';
import { useAuth } from '@/lib/auth';

export default function YourPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return <div>ログインが必要です</div>;
  }

  // 認証済みの場合のみFirestore操作を実行
  return <YourComponent userId={user.uid} />;
}
```

#### ステップ3: Firestoreエミュレータでテスト

```bash
# ローカルでエミュレータを起動
firebase emulators:start

# ルールをテスト
firebase emulators:exec --only firestore "npm test"
```

### 予防策

1. **セキュリティルールを必ず設定**: デフォルトは `allow read, write: if false;`
2. **ローカルエミュレータでルールをテスト**: 本番環境にデプロイ前に確認
3. **認証状態をチェック**: Firestore操作前に必ず `user` の存在を確認
4. **最小権限の原則**: 必要最小限の権限のみを許可

---

## 2. React Hook依存配列エラー

### エラーメッセージ

```
React Hook useEffect has a missing dependency: 'someValue'.
Either include it or remove the dependency array.
```

### 原因

- useEffect/useCallback/useMemo の依存配列に、関数内で使用している値が含まれていない
- ESLintの `react-hooks/exhaustive-deps` ルールに違反

### 解決方法

#### パターン1: 依存配列に追加

```tsx
// ❌ NG
function MyComponent({ userId }: { userId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(userId); // userIdを使用しているが依存配列に入っていない
  }, []);
}

// ✅ OK
function MyComponent({ userId }: { userId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(userId);
  }, [userId]); // userIdを依存配列に追加
}
```

#### パターン2: useCallbackでメモ化

```tsx
// ❌ NG
function MyComponent() {
  const fetchData = async () => {
    // データ取得
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchDataが毎回再生成される
}

// ✅ OK
function MyComponent() {
  const fetchData = useCallback(async () => {
    // データ取得
  }, []); // メモ化

  useEffect(() => {
    fetchData();
  }, [fetchData]);
}
```

#### パターン3: 関数を useEffect 内に移動

```tsx
// ✅ OK: fetchDataをuseEffect内に移動すれば依存配列不要
function MyComponent({ userId }: { userId: string }) {
  useEffect(() => {
    async function fetchData() {
      const data = await getFirestoreData(userId);
      setData(data);
    }
    fetchData();
  }, [userId]); // userIdのみを依存配列に
}
```

### 予防策

1. **ESLintルール有効化**: `react-hooks/exhaustive-deps` を `warn` または `error` レベルに設定
2. **関数はuseCallbackでメモ化**: 依存配列に関数を入れる場合は必ずメモ化
3. **関数型更新を使用**: `setState(prev => prev + 1)` で依存を減らす

---

## 3. TypeScript型エラー（型推論失敗）

### エラーメッセージ

```
Type 'undefined' is not assignable to type 'CoffeeData'.
Property 'name' does not exist on type 'never'.
```

### 原因

- FirestoreのデータがundefinedになることがType定義で考慮されていない
- ジェネリック型パラメータが推論できない
- 型アサーションが不足

### 解決方法

#### パターン1: Firestoreデータの型定義

```tsx
// ❌ NG
export interface CoffeeData {
  id: string;
  name: string;
  roastLevel: number;
}

// ドキュメントが存在しない場合を考慮していない
const data = snapshot.data() as CoffeeData; // undefinedの可能性

// ✅ OK
export interface CoffeeData {
  id: string;
  name: string;
  roastLevel: number;
}

// ドキュメントが存在しない場合を考慮
const data: CoffeeData | null = snapshot.exists()
  ? (snapshot.data() as CoffeeData)
  : null;
```

#### パターン2: 型ガード関数

```tsx
// 型ガード関数を定義
function isCoffeeData(data: any): data is CoffeeData {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.roastLevel === 'number'
  );
}

// 使用例
const rawData = snapshot.data();
if (isCoffeeData(rawData)) {
  // この中ではrawDataがCoffeeData型として扱われる
  console.log(rawData.name);
}
```

#### パターン3: オプショナル型を使用

```tsx
// ✅ OK: オプショナルプロパティで柔軟に対応
export interface CoffeeData {
  id: string;
  name: string;
  roastLevel: number;
  notes?: string; // オプショナル
  tags?: string[]; // オプショナル
}
```

### 予防策

1. **Firestoreデータは常にnullableとして扱う**: `data | null` 型を使用
2. **型ガード関数を作成**: ランタイムで型をチェック
3. **strictモード有効化**: `tsconfig.json` で `"strict": true`

---

## 4. ハイドレーションミスマッチ

### エラーメッセージ

```
Warning: Text content did not match. Server: "initial" Client: "loaded"
Hydration failed because the initial UI does not match what was rendered on the server.
```

### 原因

- サーバーサイドレンダリング（SSR）時とクライアントサイドで異なる内容をレンダリング
- `Date.now()` や `Math.random()` など、実行ごとに値が変わる関数を使用
- `localStorage` や `window` など、SSR時に存在しないブラウザAPIを使用

### 解決方法

#### パターン1: useEffectで初回レンダリング後に値を設定

```tsx
// ❌ NG
function MyComponent() {
  const timestamp = Date.now(); // SSRとクライアントで異なる値
  return <div>{timestamp}</div>;
}

// ✅ OK
function MyComponent() {
  const [timestamp, setTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setTimestamp(Date.now()); // クライアント側でのみ実行
  }, []);

  if (timestamp === null) {
    return <div>Loading...</div>; // SSR時
  }

  return <div>{timestamp}</div>; // クライアント側
}
```

#### パターン2: suppressHydrationWarningを使用

```tsx
// 時刻表示など、SSRとクライアントで異なるのが正常な場合
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>
```

### 予防策

1. **useEffectで初期化**: ブラウザAPIは必ずuseEffect内で使用
2. **isHydrated状態を管理**: ハイドレーション完了まで初期値を表示
3. **suppressHydrationWarningを慎重に使用**: 正当な理由がある場合のみ

---

## 5. localStorage未定義エラー（SSR）

### エラーメッセージ

```
ReferenceError: localStorage is not defined
```

### 原因

- Next.jsのSSR時に `localStorage` にアクセスしている
- `localStorage` はブラウザAPIのため、サーバー側では存在しない

### 解決方法

```tsx
// ❌ NG
const [mode, setMode] = useState(() => {
  return localStorage.getItem('mode') || 'light'; // SSR時にエラー
});

// ✅ OK: useEffectで読み込み
const [mode, setMode] = useState('light');
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  const stored = localStorage.getItem('mode');
  if (stored) {
    setMode(stored);
  }
  setIsHydrated(true);
}, []);

// ハイドレーション完了まで初期値を使用
if (!isHydrated) {
  return <div>Loading...</div>;
}
```

### 予防策

1. **useEffectで読み込み**: localStorageへのアクセスは必ずuseEffect内
2. **typeof window !== 'undefined'でチェック**: 条件分岐でSSR対応
3. **カスタムフック作成**: `useLocalStorage` などで共通化

---

## 6. Framer Motion警告（layoutId重複）

### エラーメッセージ

```
Warning: Duplicate layoutId "my-id" found in the same AnimateSharedLayout
```

### 原因

- 同じ `layoutId` を持つ複数のコンポーネントが同時にレンダリングされている
- 条件分岐で `layoutId` が重複している

### 解決方法

```tsx
// ❌ NG
{items.map(item => (
  <motion.div layoutId="item" key={item.id}>
    {item.name}
  </motion.div>
))}

// ✅ OK: layoutIdにユニークな値を使用
{items.map(item => (
  <motion.div layoutId={`item-${item.id}`} key={item.id}>
    {item.name}
  </motion.div>
))}
```

### 予防策

1. **layoutIdをユニーク化**: ID + インデックスを組み合わせる
2. **AnimatePresenceを使用**: 要素の出入りをアニメーション
3. **layoutIdは本当に必要か検討**: 不要なら削除

---

## 7. ビルドエラー（Dynamic import）

### エラーメッセージ

```
Error: Dynamic require of "fs" is not supported
Module not found: Can't resolve 'fs'
```

### 原因

- クライアントサイドコードで Node.js専用モジュール（`fs`, `path` 等）をインポート
- サーバーコンポーネントとクライアントコンポーネントの境界が不明確

### 解決方法

```tsx
// ❌ NG: クライアントコンポーネントでNode.js APIを使用
'use client';
import fs from 'fs'; // クライアント側では使えない

// ✅ OK: サーバーコンポーネントでのみ使用
// app/your-page/page.tsx（'use client'なし）
import fs from 'fs/promises';

export default async function YourPage() {
  const data = await fs.readFile('./data.json', 'utf-8');
  return <div>{data}</div>;
}
```

### 予防策

1. **'use client'ディレクティブを慎重に使用**: 本当にクライアントコンポーネントが必要か検討
2. **Server ActionsでAPI化**: Node.js APIはServer Actionsで提供
3. **dynamic importを使用**: 条件付きでモジュールを読み込む

---

## 8. ESLint警告（exhaustive-deps）

### エラーメッセージ

```
React Hook useEffect has a missing dependency: 'fetchData'.
Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
```

### 原因

- useEffect内で使用している値が依存配列に含まれていない

### 解決方法

前述の「[React Hook依存配列エラー](#2-react-hook依存配列エラー)」を参照。

### 予防策

1. **警告を無視しない**: ESLint警告は必ず対処する
2. **useCallbackでメモ化**: 関数を依存配列に入れる場合は必ずメモ化
3. **関数型更新を使用**: `setState(prev => ...)` で依存を減らす

---

## エラー対応のベストプラクティス

### 1. エラーメッセージを正確に読む

- エラーメッセージの最初の1行に原因が書かれていることが多い
- スタックトレースから発生箇所を特定

### 2. ブラウザのコンソールを確認

- React Developer Toolsでコンポーネントツリーを確認
- NetworkタブでFirestoreリクエストを確認

### 3. 段階的にデバッグ

- `console.log` でログ挿入
- `[DEBUG]` プレフィックスで検索しやすく
- 問題箇所を特定してから修正

### 4. 修正後にテスト

- 同じエラーが再発しないか確認
- 関連機能に影響がないか確認
