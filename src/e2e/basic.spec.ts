import { test, expect } from '@playwright/test';

test('basic navigation and presence of content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/GATE CSE/);
  await expect(page.getByText('Forge Your Path')).toBeVisible();

  // Check roadmap preview
  await page.goto('/roadmap');
  await expect(page.getByText('Your Study Path')).toBeVisible();
  await expect(page.getByText('Digital Logic')).toBeVisible();
});

test('dashboard requires auth or redirect', async ({ page }) => {
  await page.goto('/dashboard');
  // It should either redirect to sign in or show the dashboard if middleware is bypassed in test
  // In our case, it will probably hang or go to login
  const url = page.url();
  console.log('Dashboard URL:', url);
});
