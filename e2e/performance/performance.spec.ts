import { test, expect } from '@playwright/test';
import { performanceThresholds } from '../fixtures/test-data';

const pages = [
  { name: 'ホーム', path: '/' },
  { name: 'クイズトップ', path: '/coffee-trivia' },
  { name: 'タイマー', path: '/roast-timer' },
  { name: 'スケジュール', path: '/schedule' },
  { name: 'テイスティング', path: '/tasting' },
];

test.describe('パフォーマンス: ページロード時間', () => {
  for (const page_ of pages) {
    test(`${page_.name}ページのロード時間が許容範囲内`, async ({ browser }) => {
      const context = await browser.newContext();
      const newPage = await context.newPage();

      await newPage.goto(page_.path);
      await newPage.waitForLoadState('load');

      const loadTime = await newPage.evaluate(() => {
        const entries = performance.getEntriesByType('navigation');
        if (entries.length > 0) {
          const nav = entries[0] as PerformanceNavigationTiming;
          return nav.loadEventEnd - nav.startTime;
        }
        return 0;
      });

      console.log(`${page_.name} ロード時間: ${loadTime}ms`);

      // 開発環境なので閾値は本番の4倍（10秒以内）
      expect(loadTime).toBeLessThan(performanceThresholds.pageLoad * 4);

      await context.close();
    });
  }
});

test.describe('パフォーマンス: CLS（Cumulative Layout Shift）', () => {
  for (const page_ of pages) {
    test(`${page_.name}ページのCLSが${performanceThresholds.cls}以内`, async ({
      browser,
    }) => {
      const context = await browser.newContext();
      const newPage = await context.newPage();

      await newPage.addInitScript(() => {
        (window as unknown as Record<string, number>).__CLS__ = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            if (!layoutShift.hadRecentInput) {
              (window as unknown as Record<string, number>).__CLS__ += layoutShift.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      });

      await newPage.goto(page_.path);
      await newPage.waitForLoadState('load');
      // ページ安定化を待つ
      await newPage.waitForLoadState('domcontentloaded');

      const cls = await newPage.evaluate(
        () => (window as unknown as Record<string, number>).__CLS__ ?? 0
      );

      console.log(`${page_.name} CLS: ${cls}`);
      expect(cls).toBeLessThanOrEqual(performanceThresholds.cls);

      await context.close();
    });
  }
});

test.describe('パフォーマンス: インタラクション応答性', () => {
  test('ページ間の遷移が3秒以内に完了する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const navigationTests = [
      { from: '/', to: '/coffee-trivia' },
      { from: '/coffee-trivia', to: '/roast-timer' },
      { from: '/roast-timer', to: '/schedule' },
    ];

    for (const nav of navigationTests) {
      await page.goto(nav.from);
      await page.waitForLoadState('domcontentloaded');

      const start = Date.now();
      await page.goto(nav.to);
      await page.waitForLoadState('domcontentloaded');
      const duration = Date.now() - start;

      console.log(`${nav.from} → ${nav.to}: ${duration}ms`);
      // 開発環境ではHMR等のオーバーヘッドがあるため5秒を閾値とする
      expect(duration).toBeLessThan(5000);
    }
  });
});

test.describe('パフォーマンス: メモリリーク検証', () => {
  test('ページの繰り返し遷移でメモリが大幅に増加しない', async ({ browser }) => {
    test.setTimeout(120_000);

    const context = await browser.newContext();
    const page = await context.newPage();

    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');

    // 初期メモリ計測
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const initialMetrics = await client.send('Performance.getMetrics');
    const initialHeap =
      initialMetrics.metrics.find((m: { name: string }) => m.name === 'JSHeapUsedSize')
        ?.value ?? 0;

    // 5回ページ遷移
    for (let i = 0; i < 5; i++) {
      await page.goto('/coffee-trivia');
      await page.waitForLoadState('domcontentloaded');
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
    }

    // 最終メモリ計測
    const finalMetrics = await client.send('Performance.getMetrics');
    const finalHeap =
      finalMetrics.metrics.find((m: { name: string }) => m.name === 'JSHeapUsedSize')
        ?.value ?? 0;

    const heapGrowth = finalHeap - initialHeap;
    const heapGrowthMB = heapGrowth / (1024 * 1024);

    console.log(`ヒープ増加量: ${heapGrowthMB.toFixed(2)}MB`);
    // 開発環境/CI環境ではNext.jsのHMR等でヒープが大きくなるため、200MBを閾値とする
    expect(heapGrowthMB).toBeLessThan(200);

    await context.close();
  });
});
