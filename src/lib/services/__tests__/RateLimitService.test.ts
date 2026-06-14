import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";

  beforeEach(async () => {
    // Clean up before each test
    await prisma.rateLimit.deleteMany({
      where: { userId, key }
    });

    // Ensure user exists if there are foreign key constraints in the future
    // For now, RateLimit in schema.prisma has a relation to User
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: "test@example.com",
        name: "Test User"
      }
    });
  });

  it("should allow first request and initialize limit", async () => {
    const limit = 5;
    const windowHours = 24;

    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(result.isAllowed).toBe(true);
    expect(result.limit).toBe(limit);
    expect(result.remaining).toBe(limit - 1);
    expect(result.resetAt).toBeInstanceOf(Date);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
  });

  it("should increment count on subsequent requests", async () => {
    const limit = 5;
    const windowHours = 24;

    await RateLimitService.checkLimit(userId, key, limit, windowHours);
    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(limit - 2);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(2);
  });

  it("should block requests when limit is exceeded", async () => {
    const limit = 2;
    const windowHours = 24;

    await RateLimitService.checkLimit(userId, key, limit, windowHours);
    await RateLimitService.checkLimit(userId, key, limit, windowHours);
    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(result.isAllowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset limit after window expires", async () => {
    const limit = 5;
    const windowHours = 1;

    // Initial request
    await RateLimitService.checkLimit(userId, key, limit, windowHours);

    // Manually expire the record in DB
    await prisma.rateLimit.update({
      where: { userId_key: { userId, key } },
      data: { resetAt: subHours(new Date(), 1) }
    });

    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(limit - 1);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
  });
});
