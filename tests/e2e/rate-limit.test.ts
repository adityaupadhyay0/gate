import { test, expect } from '@playwright/test';

test('PYQPlayer rate limit UI', async ({ page }) => {
  // Mock the AI explanation API to return a 429 error
  await page.route('**/api/ai/explain', async (route) => {
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Daily AI explanation limit reached (20 requests/24h). Please try again later.'
      }),
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + 3600).toString()
      }
    });
  });

  // Mock session and database data is complex, so we'll just navigate to a topic page
  // Since we are in a sandbox and can't easily sign in, we'll try to access as guest
  await page.goto('http://localhost:3000/topic/asymptotic-analysis');

  // Wait for the topic page to load
  await expect(page.locator('h1')).toContainText('Asymptotic Analysis');

  // Click the PYQs tab (History icon)
  await page.locator('button:has(svg.lucide-history)').click();

  // Answer a question to show the explanation and AI button
  // Select option B (just an example)
  await page.locator('button:has(div:has-text("B"))').click();
  await page.click('button:text("Submit Answer")');

  // Click the AI button (BrainCircuit icon)
  await page.locator('button:has(svg.lucide-brain-circuit)').click();

  // Check if the "Limit Reached" message is displayed
  // Use heading to avoid strict mode violation
  await expect(page.getByRole('heading', { name: 'Limit Reached' })).toBeVisible();
  await expect(page.locator('text=Daily AI explanation limit reached')).toBeVisible();
  await expect(page.locator('text=Usage Protection')).toBeVisible();

  // Take a screenshot for verification
  await page.screenshot({ path: 'rate-limit-ui.png' });
});
