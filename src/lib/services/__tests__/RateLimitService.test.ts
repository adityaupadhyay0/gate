import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'test-key';

  beforeEach(async () => {
    // Clear the RateLimit table before each test
    await prisma.rateLimit.deleteMany();
    // Ensure test user exists if needed by FK, but here we can just use a dummy ID if SQLite allows
    // In this repo, User is required by FK. Let's create a test user.
    await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, email: 'test@example.com' },
        update: {}
    });
  });

  it('should allow requests within the limit', async () => {
    const limit = 3;
    const windowHours = 24;

    for (let i = 0; i < limit; i++) {
      const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(limit - (i + 1));
    }
  });

  it('should block requests exceeding the limit', async () => {
    const limit = 2;
    const windowHours = 24;

    // First two requests should succeed
    await RateLimitService.checkLimit(userId, key, limit, windowHours);
    await RateLimitService.checkLimit(userId, key, limit, windowHours);

    // Third request should fail
    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset the limit after the window expires', async () => {
    const limit = 1;
    const windowHours = 1;

    // First request succeeds
    await RateLimitService.checkLimit(userId, key, limit, windowHours);

    // Mock time forward
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 2);
    vi.setSystemTime(futureDate);

    // Request should succeed again after reset
    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0); // 1 - 1 = 0

    vi.useRealTimers();
  });
});
