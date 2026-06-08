import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';
import { addHours, subHours } from 'date-fns';

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'ai_explain';

  beforeEach(async () => {
    // Clean up before each test
    await prisma.rateLimit.deleteMany({
      where: { userId, key }
    });

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email: 'test@example.com' },
      update: {}
    });
  });

  it('should allow requests within limit and increment count', async () => {
    const result1 = await RateLimitService.checkAndIncrement(userId, key);
    expect(result1.isLimited).toBe(false);
    expect(result1.remaining).toBe(19); // Default is 20
    expect(result1.limit).toBe(20);

    const status = await RateLimitService.getStatus(userId, key);
    expect(status.remaining).toBe(19);

    const result2 = await RateLimitService.checkAndIncrement(userId, key);
    expect(result2.remaining).toBe(18);
  });

  it('should block requests when limit is reached', async () => {
    // Fill up the limit
    for (let i = 0; i < 20; i++) {
      await RateLimitService.checkAndIncrement(userId, key);
    }

    const result = await RateLimitService.checkAndIncrement(userId, key);
    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should reset count when window expires', async () => {
    // Create an expired rate limit entry
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: 20,
        resetAt: subHours(new Date(), 1)
      }
    });

    const result = await RateLimitService.checkAndIncrement(userId, key);
    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(19);
    expect(result.count).toBeUndefined(); // Result doesn't have count
  });

  it('should handle getStatus for non-existent entries', async () => {
    const status = await RateLimitService.getStatus('non-existent-user', 'non-existent-key');
    expect(status.isLimited).toBe(false);
    expect(status.remaining).toBe(10); // Default for unknown keys is 10
  });
});
