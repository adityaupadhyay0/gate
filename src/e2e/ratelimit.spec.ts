import { test, expect } from '@playwright/test';

test.describe('PYQPlayer AI Rate Limiting UI', () => {
  test('should display rate limit error message when API returns 429', async ({ page }) => {
    // Mock the session
    await page.addInitScript(() => {
        window.localStorage.setItem('nextauth.message', 'logged-in');
    });

    // Mock the AI explanation API to return 429
    await page.route('/api/ai/explain', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Daily AI explanation limit reached. Please try again tomorrow.',
          code: 'RATE_LIMIT_EXCEEDED'
        })
      });
    });

    // Go to a topic page (assuming slug exists in seeded data or mocked)
    // For now, let's just mock the initial data if possible or go to a known topic
    await page.goto('http://localhost:3000/topic/asymptotic-analysis');

    // Select an option and submit to show the explanation/AI help button
    // Using a more specific selector for the option button in PYQPlayer
    const optionB = page.locator('button:has(div:has-text("B"))').first();
    await optionB.click();
    await page.click('button:has-text("Submit Answer")');

    // Click the AI Help button (BrainCircuit icon)
    // The button has a BrainCircuit icon.
    const aiButton = page.locator('button:has(svg.lucide-brain-circuit)');
    await aiButton.click();

    // Check for the error message
    const errorTitle = page.locator('h3:has-text("Limit Reached")').first();
    await expect(errorTitle).toBeVisible();

    const errorMessage = page.locator('p:has-text("Daily AI explanation limit reached")').first();
    await expect(errorMessage).toBeVisible();
  });
});
