import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';
import { addHours, subHours } from 'date-fns';

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'test-key';

  beforeEach(async () => {
    // Clean up
    await prisma.rateLimit.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    await prisma.user.create({
      data: {
        id: userId,
        email: 'test@example.com',
      }
    });
  });

  it('should allow first request and initialize count', async () => {
    const result = await RateLimitService.checkLimit(userId, key, 5);

    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
  });

  it('should increment count on subsequent requests', async () => {
    await RateLimitService.checkLimit(userId, key, 5);
    const result = await RateLimitService.checkLimit(userId, key, 5);

    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(3);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(2);
  });

  it('should block requests exceeding the limit', async () => {
    // Use up all 2 requests
    await RateLimitService.checkLimit(userId, key, 2);
    await RateLimitService.checkLimit(userId, key, 2);

    // Third request should be blocked
    const result = await RateLimitService.checkLimit(userId, key, 2);

    expect(result.isAllowed).toBe(false);
    expect(result.remaining).toBe(0);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(2);
  });

  it('should reset the counter after the window expires', async () => {
    // Set up an expired limit
    const expiredDate = subHours(new Date(), 1);
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: 5,
        resetAt: expiredDate
      }
    });

    const result = await RateLimitService.checkLimit(userId, key, 5);

    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(4);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
    expect(record?.resetAt.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
