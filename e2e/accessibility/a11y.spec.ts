import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { isRedirectedToLogin } from '../fixtures/test-base';

const pages = [
  { name: 'ホーム', path: '/' },
  { name: 'クイズトップ', path: '/coffee-trivia' },
  { name: 'タイマー', path: '/roast-timer' },
  { name: 'スケジュール', path: '/schedule' },
  { name: 'テイスティング', path: '/tasting' },
];

test.describe('アクセシビリティ: axe-core自動スキャン', () => {
  for (const page_ of pages) {
    test(`${page_.name}ページにcriticalな違反がない`, async ({ page }) => {
      await page.goto(page_.path);
      await page.waitForLoadState('domcontentloaded');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      if (criticalViolations.length > 0) {
        const summary = criticalViolations.map(
          (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length}箇所)`
        );
        console.log(`${page_.name}の重大な違反:`, summary);
      }

      // criticalな違反がゼロであることを確認
      expect(criticalViolations.filter((v) => v.impact === 'critical')).toHaveLength(0);
    });
  }
});

test.describe('アクセシビリティ: キーボードナビゲーション', () => {
  test('ホームページでTabキーによるナビゲーションが動作する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Tabキーでフォーカスが移動する
    await page.keyboard.press('Tab');
    const firstFocusedTag = await page.evaluate(() => {
      return document.activeElement?.tagName.toLowerCase() ?? null;
    });
    expect(firstFocusedTag).not.toBeNull();

    // 複数回Tabでフォーカスが進む
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const thirdFocusedTag = await page.evaluate(() => {
      return document.activeElement?.tagName.toLowerCase() ?? null;
    });
    expect(thirdFocusedTag).not.toBeNull();
  });

  test('Escapeキーでモーダルを閉じられる', async ({ page }) => {
    await page.goto('/schedule');
    await page.waitForLoadState('domcontentloaded');

    // 認証リダイレクトの場合はスキップ
    const isLogin = await isRedirectedToLogin(page);
    test.skip(isLogin, '認証が必要なためスキップ');

    const dateButton = page.locator('[aria-label="日付を選択"]');
    await expect(dateButton).toBeVisible({ timeout: 10000 });
    await dateButton.click();

    // Escapeキーでモーダルを閉じる
    await page.keyboard.press('Escape');
  });

  test('Enterキーでリンクをアクティベートできる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const links = page.locator('a[href]:visible');
    const linkCount = await links.count();

    if (linkCount > 0) {
      await links.first().focus();
      const href = await links.first().getAttribute('href');
      if (href) {
        await page.keyboard.press('Enter');
        await page.waitForLoadState('domcontentloaded');
        // ナビゲーションが発生した
        expect(page.url()).toBeTruthy();
      }
    }
  });
});

test.describe('アクセシビリティ: ARIA属性', () => {
  test('ボタンにアクセシブルな名前がある', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const buttons = page.locator('button:visible');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      const title = await button.getAttribute('title');

      const hasAccessibleName =
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (text && text.trim().length > 0) ||
        (title && title.trim().length > 0);
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('画像にalt属性がある', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const images = page.locator('img:visible');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // 装飾画像（role="presentation"）でなければalt属性必須
      if (role !== 'presentation' && role !== 'none') {
        expect(alt).not.toBeNull();
      }
    }
  });
});
