import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService } from '../RateLimitService';
import prisma from '@/lib/db/prisma';
import { addHours, subHours } from 'date-fns';

describe('RateLimitService', () => {
  const userId = 'test-user-id';
  const key = 'test-key';

  beforeEach(async () => {
    // Clear RateLimit table before each test
    await prisma.rateLimit.deleteMany();
    // Ensure user exists (SQLite foreign key constraint)
    await prisma.user.upsert({
      where: { id: userId },
      create: { id: userId, email: 'test@example.com' },
      update: {}
    });
  });

  it('should allow first request and initialize window', async () => {
    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
  });

  it('should increment count within the window', async () => {
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
    // Use up all 2 slots
    await RateLimitService.checkAndIncrement(userId, key, 2, 24);
    await RateLimitService.checkAndIncrement(userId, key, 2, 24);

    const result = await RateLimitService.checkAndIncrement(userId, key, 2, 24);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset window after it expires', async () => {
    // Create an expired record
    const expiredDate = subHours(new Date(), 1);
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: 5,
        resetAt: expiredDate
      }
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, 5, 24);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.reset.getTime()).toBeGreaterThan(new Date().getTime());

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
  });
});
