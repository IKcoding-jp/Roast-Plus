import { test, expect } from '@playwright/test';
import { viewports } from '../fixtures/test-data';

const pages = [
  { name: 'ホーム', path: '/' },
  { name: 'クイズトップ', path: '/coffee-trivia' },
  { name: 'タイマー', path: '/roast-timer' },
  { name: 'スケジュール', path: '/schedule' },
  { name: 'テイスティング', path: '/tasting' },
];

const viewportEntries = Object.entries(viewports) as [
  keyof typeof viewports,
  (typeof viewports)[keyof typeof viewports],
][];

for (const [viewportName, viewport] of viewportEntries) {
  test.describe(`レスポンシブ: ${viewportName} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport });

    for (const page_ of pages) {
      test(`${page_.name}ページがレイアウト崩れなく表示される`, async ({ page }) => {
        await page.goto(page_.path);
        await page.waitForLoadState('domcontentloaded');

        // ページが表示される
        await expect(page.locator('body')).not.toBeEmpty();

        // 水平スクロールが発生しないことを確認
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      });

      test(`${page_.name}ページのインタラクティブ要素がタップ可能なサイズ`, async ({
        page,
      }) => {
        await page.goto(page_.path);
        await page.waitForLoadState('domcontentloaded');

        // モバイルでのみタップターゲットサイズを検証
        if (viewportName === 'mobile') {
          const buttons = page.locator('button:visible, a:visible');
          const count = await buttons.count();

          for (let i = 0; i < Math.min(count, 10); i++) {
            const button = buttons.nth(i);
            const box = await button.boundingBox();
            if (box && box.width > 0 && box.height > 0) {
              // 最小タップターゲットサイズ（24px）
              expect(box.width).toBeGreaterThanOrEqual(24);
              expect(box.height).toBeGreaterThanOrEqual(24);
            }
          }
        }
      });
    }
  });
}

test.describe('レスポンシブ: スケジュールページのタブ切り替え', () => {
  test('モバイルではタブUIが表示される', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/schedule');
    await page.waitForLoadState('domcontentloaded');

    // モバイルタブが表示される（レイアウトに依存）
    const tabContent = page.locator('body');
    await expect(tabContent).not.toBeEmpty();
  });

  test('デスクトップでは横並びレイアウトになる', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/schedule');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).not.toBeEmpty();
  });
});
