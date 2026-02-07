import { test as base, type Page } from '@playwright/test';

/**
 * Firebase APIをモックするカスタムフィクスチャ。
 * テストで `mockFirebase` を引数に取ると自動適用される。
 */
export const test = base.extend<{ mockFirebase: Page }>({
  mockFirebase: async ({ page }, use) => {
    // Firebase Auth APIをモック
    await page.route('**/identitytoolkit.googleapis.com/**', async (route) => {
      const url = route.request().url();

      if (url.includes('signInWithPassword') || url.includes('signInWithIdp')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            idToken: 'mock-id-token',
            email: 'test@example.com',
            refreshToken: 'mock-refresh-token',
            expiresIn: '3600',
            localId: 'mock-user-id',
          }),
        });
      } else if (url.includes('lookup')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: [
              {
                localId: 'mock-user-id',
                email: 'test@example.com',
                displayName: 'Test User',
              },
            ],
          }),
        });
      } else {
        await route.fulfill({ status: 200, body: '{}' });
      }
    });

    // Firestore REST APIをモック
    await page.route('**/firestore.googleapis.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    // Firebase Storage APIをモック
    await page.route('**/firebasestorage.googleapis.com/**', async (route) => {
      await route.fulfill({ status: 200, body: '' });
    });

    // Firebase Auth トークンリフレッシュをモック
    await page.route('**/securetoken.googleapis.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          expires_in: '3600',
          token_type: 'Bearer',
          refresh_token: 'mock-refresh-token',
        }),
      });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * ページが認証リダイレクトでログインページに遷移したかチェックする。
 * 2パターンに対応:
 * 1. router.push('/login') でURLが変わるケース
 * 2. LoginPageコンポーネントを直接レンダリングするケース（URL変更なし）
 */
export async function isRedirectedToLogin(page: import('@playwright/test').Page): Promise<boolean> {
  // パターン1: URLが/loginに変わった場合
  if (page.url().includes('/login')) {
    return true;
  }

  // パターン2: URL変更なしでLoginPageが表示される場合
  // メールアドレス入力フィールドの存在で判定（ログインフォーム固有）
  try {
    const emailInput = page.locator('input[placeholder="example@example.com"]');
    await emailInput.waitFor({ state: 'visible', timeout: 8000 });
    return true;
  } catch {
    return false;
  }
}
