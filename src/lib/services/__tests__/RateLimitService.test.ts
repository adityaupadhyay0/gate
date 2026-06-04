import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";

  beforeEach(async () => {
    // Ensure test user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "test@example.com" },
    });
    // Clean up rate limits for test user
    await prisma.rateLimit.deleteMany({
      where: { userId },
    });
  });

  it("should allow requests under the limit", async () => {
    const limit = 3;
    const result1 = await RateLimitService.checkLimit(userId, key, limit);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await RateLimitService.checkLimit(userId, key, limit);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = await RateLimitService.checkLimit(userId, key, limit);
    expect(result3.success).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it("should block requests over the limit", async () => {
    const limit = 2;
    await RateLimitService.checkLimit(userId, key, limit);
    await RateLimitService.checkLimit(userId, key, limit);

    const result = await RateLimitService.checkLimit(userId, key, limit);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset the limit after the window expires", async () => {
    const limit = 2;
    await RateLimitService.checkLimit(userId, key, limit);
    await RateLimitService.checkLimit(userId, key, limit);

    // Manually expire the reset time in the DB
    await prisma.rateLimit.update({
      where: { userId_key: { userId, key } },
      data: { resetAt: subHours(new Date(), 1) },
    });

    const result = await RateLimitService.checkLimit(userId, key, limit);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(limit - 1);
  });
});
