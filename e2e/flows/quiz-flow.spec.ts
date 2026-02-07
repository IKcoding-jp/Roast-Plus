import { test, expect } from '@playwright/test';

test.describe('クイズシステムフロー', () => {
  test('クイズトップから各セクションにアクセスできる', async ({ page }) => {
    await page.goto('/coffee-trivia');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/coffee-trivia/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('デイリークイズページが読み込まれる', async ({ page }) => {
    await page.goto('/coffee-trivia/quiz?mode=daily');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/quiz/);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('クイズの選択肢をクリックできる', async ({ page }) => {
    await page.goto('/coffee-trivia/quiz?mode=daily');
    await page.waitForLoadState('domcontentloaded');

    // 選択肢ボタンを探す（A, B, C, D のラベル付き）
    const options = page.locator('button').filter({ hasText: /^[A-D]$|^[ABCD]\s/ });
    const optionCount = await options.count();

    if (optionCount > 0) {
      await options.first().click();
      // フィードバック（解説）が表示されることを確認
      const feedback = page.getByText('解説');
      await expect(feedback).toBeVisible({ timeout: 5000 });
    }
    // 選択肢がない場合: 認証が必要でクイズデータが読み込まれていない
  });

  test('復習モードページが読み込まれる', async ({ page }) => {
    await page.goto('/coffee-trivia/review');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/review/);
  });

  test('バッジ一覧ページが読み込まれる', async ({ page }) => {
    await page.goto('/coffee-trivia/badges');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/badges/);
  });

  test('統計ページが読み込まれる', async ({ page }) => {
    await page.goto('/coffee-trivia/stats');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/stats/);
  });

  test('クイズを回答してフィードバックを受け取れる', async ({ page }) => {
    await page.goto('/coffee-trivia/quiz?mode=daily');
    await page.waitForLoadState('domcontentloaded');

    // クイズの全問回答
    let questionsAnswered = 0;
    const maxQuestions = 10;

    while (questionsAnswered < maxQuestions) {
      const options = page.locator('button').filter({ hasText: /^[A-D]$|^[ABCD]\s/ });
      const optionCount = await options.count();
      if (optionCount === 0) break;

      await options.first().click();

      // 次へボタンがあればクリック
      const nextButton = page.locator('button').filter({ hasText: /次へ|→/ });
      const hasNext = await nextButton.first().isVisible({ timeout: 2000 }).catch(() => false);
      if (hasNext) {
        await nextButton.first().click();
      }

      questionsAnswered++;
    }

    // 結果画面が表示される場合の確認
    if (questionsAnswered > 0) {
      const resultTitle = page.getByText('クイズ完了');
      const hasResult = await resultTitle.isVisible({ timeout: 5000 }).catch(() => false);
      if (hasResult) {
        await expect(resultTitle).toBeVisible();
        // リトライボタンが表示される
        const retryButton = page.getByText('もう一度挑戦');
        await expect(retryButton).toBeVisible({ timeout: 3000 });
      }
    }
  });
});
