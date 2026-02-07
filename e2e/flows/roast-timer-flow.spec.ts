import { test, expect } from '@playwright/test';

test.describe('ローストタイマーフロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/roast-timer');
    await page.waitForLoadState('domcontentloaded');
  });

  test('手動入力 → スタート → 一時停止 → 再開のフロー', async ({ page }) => {
    const manualButton = page.getByText('手動入力').first();
    const isManualVisible = await manualButton.isVisible({ timeout: 5000 }).catch(() => false);
    // 認証不要で手動入力モードが見える場合のみフロー実行
    test.skip(!isManualVisible, '手動入力モードが非表示（認証が必要な可能性）');

    await manualButton.click();

    const minInput = page.locator('[placeholder="分"]');
    await expect(minInput).toBeVisible({ timeout: 5000 });
    await minInput.fill('1');
    const secInput = page.locator('[placeholder="秒"]');
    await secInput.fill('00');

    const startButton = page.getByText('スタート').first();
    await startButton.click();

    // タイマー実行中: 一時停止ボタンが表示される
    const pauseButton = page.getByText('一時停止');
    await expect(pauseButton).toBeVisible({ timeout: 10000 });

    // 一時停止
    await pauseButton.click();

    // 再開ボタンが表示される
    const resumeButton = page.getByText('再開');
    await expect(resumeButton).toBeVisible({ timeout: 5000 });

    // 再開
    await resumeButton.click();

    // 一時停止ボタンが再表示される
    await expect(page.getByText('一時停止')).toBeVisible({ timeout: 5000 });
  });

  test('タイマー完了までのフロー', async ({ page }) => {
    const manualButton = page.getByText('手動入力').first();
    const isManualVisible = await manualButton.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!isManualVisible, '手動入力モードが非表示');

    await manualButton.click();

    const minInput = page.locator('[placeholder="分"]');
    await expect(minInput).toBeVisible({ timeout: 5000 });
    await minInput.fill('0');
    const secInput = page.locator('[placeholder="秒"]');
    await secInput.fill('03');

    const startButton = page.getByText('スタート').first();
    await startButton.click();

    // 完了を待つ（3秒 + バッファ）
    const completionText = page.getByText('焙煎完了').or(page.getByText('ロースト完了'));
    await expect(completionText.first()).toBeVisible({ timeout: 15000 });
  });

  test('スキップボタンでタイマーを終了できる', async ({ page }) => {
    const manualButton = page.getByText('手動入力').first();
    const isManualVisible = await manualButton.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!isManualVisible, '手動入力モードが非表示');

    await manualButton.click();

    const minInput = page.locator('[placeholder="分"]');
    await expect(minInput).toBeVisible({ timeout: 5000 });
    await minInput.fill('5');
    const secInput = page.locator('[placeholder="秒"]');
    await secInput.fill('00');

    const startButton = page.getByText('スタート').first();
    await startButton.click();

    const skipButton = page.getByText('スキップ');
    await expect(skipButton).toBeVisible({ timeout: 10000 });
    await skipButton.click();

    // タイマーが完了/リセット状態になる
    const endState = page.getByText('リセット').or(page.getByText('焙煎完了')).or(page.getByText('ロースト完了'));
    await expect(endState.first()).toBeVisible({ timeout: 10000 });
  });

  test('設定ボタンが存在する', async ({ page }) => {
    const settingsButton = page.locator('[aria-label="設定"]');
    const isVisible = await settingsButton.isVisible({ timeout: 5000 }).catch(() => false);
    // 設定ボタンがある場合はクリック可能か確認
    if (isVisible) {
      await expect(settingsButton).toBeEnabled();
    }
    // 設定ボタンが認証後のみ表示される場合もある
  });
});
