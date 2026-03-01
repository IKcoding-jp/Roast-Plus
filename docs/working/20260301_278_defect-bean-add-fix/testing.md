# テスト計画: コーヒー豆図鑑 欠点豆追加バグ修正 (#278)

## テストファイル

| ファイル | 内容 |
|---------|------|
| `hooks/__tests__/useDefectBeans.test.ts` | isLoading Race Condition テスト |
| `lib/__tests__/storage.test.ts` | アップロードタイムアウトテスト |

---

## `useDefectBeans.ts` のテスト

### テスト: isLoading が appDataLoading を含む

```typescript
// hooks/__tests__/useDefectBeans.test.ts

describe('useDefectBeans - isLoading', () => {
  it('useAppData.isLoading が true の間は isLoading = true を返す', async () => {
    // useAppData.isLoading = true をモック
    vi.mock('@/hooks/useAppData', () => ({
      useAppData: () => ({ data: INITIAL_DATA, updateData: vi.fn(), isLoading: true }),
    }));
    vi.mock('@/lib/firestore', () => ({
      getDefectBeanMasterData: async () => [],
    }));

    const { result } = renderHook(() => useDefectBeans(), { wrapper: AuthWrapper });

    // マスターデータのロードが完了しても、appDataLoading が true なら isLoading = true
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('両方のロードが完了したら isLoading = false を返す', async () => {
    vi.mock('@/hooks/useAppData', () => ({
      useAppData: () => ({ data: INITIAL_DATA, updateData: vi.fn(), isLoading: false }),
    }));
    vi.mock('@/lib/firestore', () => ({
      getDefectBeanMasterData: async () => [],
    }));

    const { result } = renderHook(() => useDefectBeans(), { wrapper: AuthWrapper });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isLoading).toBe(false);
  });
});
```

---

## `storage.ts` のテスト

### テスト: タイムアウト動作

```typescript
// lib/__tests__/storage.test.ts

describe('uploadDefectBeanImage', () => {
  it('30秒以内に完了しない場合はエラーを throw する', async () => {
    vi.useFakeTimers();

    // uploadBytes が永遠にハングするモック
    vi.mock('firebase/storage', () => ({
      ref: vi.fn(() => ({})),
      uploadBytes: () => new Promise(() => {}), // never resolves
      getDownloadURL: vi.fn(),
    }));

    const uploadPromise = uploadDefectBeanImage('uid', 'beanId', mockFile);

    // 30秒進める
    vi.advanceTimersByTime(30_000);

    await expect(uploadPromise).rejects.toThrow('タイムアウト');

    vi.useRealTimers();
  });

  it('正常に完了した場合は downloadURL を返す', async () => {
    vi.mock('firebase/storage', () => ({
      ref: vi.fn(() => ({})),
      uploadBytes: vi.fn().mockResolvedValue({}),
      getDownloadURL: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
    }));

    const url = await uploadDefectBeanImage('uid', 'beanId', mockFile);
    expect(url).toBe('https://example.com/image.jpg');
  });
});
```

---

## カバレッジ目標

| 対象 | 目標 |
|------|------|
| `hooks/useDefectBeans.ts` | 85%以上 |
| `lib/storage.ts` | 80%以上 |

---

## 手動テストシナリオ

### シナリオ1: 正常系（欠点豆の追加）
1. `/defect-beans` を開く
2. 「追加」ボタンクリック
3. カメラまたはファイルから画像を選択
4. 名称「テスト欠点豆」を入力
5. 送信ボタンクリック
6. ✅ フォームが閉じ、「テスト欠点豆」がリストに表示される
7. ページをリロード
8. ✅ 「テスト欠点豆」が保持されている

### シナリオ2: ページロード直後の追加（Race Condition 確認）
1. `/defect-beans` をリロード
2. ページが表示された直後（ローディング完了直後）すぐに「追加」をクリック
3. 名称 + 画像を入力して即座に送信
4. ✅ データが正常に保存される（Race Condition が再発しない）

### シナリオ3: Firebase Storage 未接続時（タイムアウト確認）
- Firebase エミュレーターや DevTools でネットワークを Storage のみブロック
- 追加フォームで送信
- ✅ 30秒後にエラートーストが表示されてボタンが解放される
