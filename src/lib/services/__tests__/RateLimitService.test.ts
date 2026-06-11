import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';
import { addHours, subHours } from 'date-fns';

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'test-key';
  const limit = 5;
  const windowHours = 24;

  beforeEach(async () => {
    // Clean up before each test
    await prisma.rateLimit.deleteMany({});
    // Ensure the user exists because of the foreign key constraint
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: 'test@example.com' }
    });
  });

  it('should return full limit if no record exists', async () => {
    const status = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(status.remaining).toBe(limit);
    expect(status.limit).toBe(limit);
  });

  it('should track usage and decrement remaining count', async () => {
    await RateLimitService.incrementUsage(userId, key, windowHours);
    const status = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(status.remaining).toBe(limit - 1);

    await RateLimitService.incrementUsage(userId, key, windowHours);
    const status2 = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(status2.remaining).toBe(limit - 2);
  });

  it('should reset limit after window expires', async () => {
    // Create an expired rate limit record
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: limit,
        resetAt: subHours(new Date(), 1)
      }
    });

    const status = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(status.remaining).toBe(limit);

    await RateLimitService.incrementUsage(userId, key, windowHours);
    const status2 = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(status2.remaining).toBe(limit - 1);
  });

  it('should block when limit is exceeded', async () => {
    for (let i = 0; i < limit; i++) {
      await RateLimitService.incrementUsage(userId, key, windowHours);
    }

    const status = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(status.remaining).toBe(0);
  });
});
