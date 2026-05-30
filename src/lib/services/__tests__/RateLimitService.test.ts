import { describe, it, expect, beforeEach } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const testUserId = "test-user-id";
  const testKey = "test-key";

  beforeEach(async () => {
    // Clean up before each test
    await prisma.rateLimit.deleteMany({
      where: { userId: testUserId }
    });
    // Ensure test user exists (if needed by constraints, though RateLimit uses userId string)
    // In our schema User is a relation, so we should create a user if we want to be safe with foreign keys
    await prisma.user.upsert({
        where: { id: testUserId },
        create: { id: testUserId, email: "test@example.com" },
        update: {}
    });
  });

  it("should allow requests within limit and increment count", async () => {
    const limit = 5;
    const result1 = await RateLimitService.check(testUserId, testKey, limit);

    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(4);
    expect(result1.limit).toBe(5);

    const result2 = await RateLimitService.check(testUserId, testKey, limit);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(3);
  });

  it("should block requests exceeding limit", async () => {
    const limit = 2;
    await RateLimitService.check(testUserId, testKey, limit);
    await RateLimitService.check(testUserId, testKey, limit);

    const result3 = await RateLimitService.check(testUserId, testKey, limit);
    expect(result3.success).toBe(false);
    expect(result3.remaining).toBe(0);
  });

  it("should reset after window expiration", async () => {
    const limit = 2;
    // Manually create an expired record
    await prisma.rateLimit.create({
      data: {
        userId: testUserId,
        key: testKey,
        count: 2,
        resetAt: subHours(new Date(), 1)
      }
    });

    const result = await RateLimitService.check(testUserId, testKey, limit);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
    expect(isAfter(result.reset, new Date())).toBe(true);
  });

  it("should handle separate keys for the same user", async () => {
    await RateLimitService.check(testUserId, "key1", 1);
    const result2 = await RateLimitService.check(testUserId, "key2", 1);

    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(0);
  });
});

function isAfter(date1: Date, date2: Date) {
    return date1.getTime() > date2.getTime();
}
