import { test, expect } from '@playwright/test';

test('PYQPlayer handles rate limit 429 error', async ({ page }) => {
  // Mock the explain API to return 429
  await page.route('**/api/ai/explain', async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Daily AI credit limit reached (20/24h). Please try again later.' }),
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '1715820000'
      }
    });
  });

  // Navigate to a topic page
  await page.goto('/topic/asymptotic-analysis');

  // Sign in as guest if needed
  if (page.url().includes('signin')) {
    await page.getByRole("button", { name: "Sign in with Guest" }).click();
    await page.waitForURL("**/topic/asymptotic-analysis");
  }

  // Click on an option to enable submission
  const optionA = page.locator('button:has(div:has-text("A"))').first();
  await optionA.click();

  // Click submit
  await page.getByRole("button", { name: "Submit Answer" }).click();

  // Click AI help button
  const aiButton = page.locator('button:has(svg.lucide-brain-circuit)');
  await aiButton.click();

  // Verify Limit Reached UI is visible
  await expect(page.getByRole("heading", { name: "Limit Reached" })).toBeVisible();
  await expect(page.getByText('Usage Protection')).toBeVisible();
  await expect(page.getByText('Daily AI credit limit reached (20/24h). Please try again later.')).toBeVisible();
});
