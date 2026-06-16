import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '../../db/prisma';
import { addHours, subHours } from 'date-fns';

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'test-feature';

  beforeEach(async () => {
    // Clean up
    await prisma.rateLimit.deleteMany({
      where: { userId }
    });
    // Create user if not exists
    await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, email: 'test@example.com' },
        update: {}
    });
  });

  it('should allow usage if no rate limit record exists', async () => {
    const result = await RateLimitService.checkLimit(userId, key, 5);
    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(5);
  });

  it('should increment usage correctly', async () => {
    await RateLimitService.incrementUsage(userId, key);
    const rateLimit = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(rateLimit?.count).toBe(1);

    await RateLimitService.incrementUsage(userId, key);
    const updated = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(updated?.count).toBe(2);
  });

  it('should block usage if limit exceeded', async () => {
    for (let i = 0; i < 5; i++) {
      await RateLimitService.checkAndIncrement(userId, key, 5);
    }

    const result = await RateLimitService.checkAndIncrement(userId, key, 5);
    expect(result.isAllowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset window if resetAt has passed', async () => {
    // Create an expired rate limit
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: 5,
        resetAt: subHours(new Date(), 1)
      }
    });

    const result = await RateLimitService.checkLimit(userId, key, 5);
    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(5);

    const updated = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(updated?.count).toBe(0);
  });
});
