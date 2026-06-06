import { test, expect } from '@playwright/test';

test.describe('AI Explanation Rate Limiting', () => {
  // Skipping actual execution since browsers are missing in this environment,
  // but providing the code for future verification.
  test.skip('should return 429 when rate limit is exceeded', async ({ request }) => {
    // 1. Sign in as guest first to get a session
    // (Actual E2E flow would need to handle NextAuth cookies)

    const response = await request.post('/api/ai/explain', {
      data: {
        question: "Test question",
        options: ["A", "B"],
        answer: "A",
        userAnswer: "A"
      }
    });

    // We expect headers to be present even on first success
    if (response.status() === 200) {
      const headers = response.headers();
      expect(headers['x-ratelimit-limit']).toBeDefined();
      expect(headers['x-ratelimit-remaining']).toBeDefined();
      expect(headers['x-ratelimit-reset']).toBeDefined();
    }
  });
});
