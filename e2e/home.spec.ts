import { test, expect } from '@playwright/test';

test.describe('Real Estate Dashboard', () => {
  test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect the title
    await expect(page.locator('h1')).toHaveText('Real Estate Analytics Dashboard');
  });
});
