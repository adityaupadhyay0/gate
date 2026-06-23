import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';
import { addHours, subHours } from 'date-fns';

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'test-key';

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.rateLimit.deleteMany();
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email: 'test@example.com' }
    });
  });

  it('should allow the first request and create a record', async () => {
    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record).toBeDefined();
    expect(record?.count).toBe(1);
  });

  it('should increment count on subsequent requests', async () => {
    await RateLimitService.checkAndIncrement(userId, key, 5, 24);
    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(2);
  });

  it('should block requests when limit is exceeded', async () => {
    // Use up all 2 requests
    await RateLimitService.checkAndIncrement(userId, key, 2, 24);
    await RateLimitService.checkAndIncrement(userId, key, 2, 24);

    const result = await RateLimitService.checkAndIncrement(userId, key, 2, 24);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(2);
  });

  it('should reset window after resetAt time has passed', async () => {
    // Create an expired record
    const expiredTime = subHours(new Date(), 1);
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: 5,
        resetAt: expiredTime
      }
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
    expect(record?.resetAt.getTime()).toBeGreaterThan(expiredTime.getTime());
  });
});
