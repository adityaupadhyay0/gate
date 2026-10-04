import { describe, it, expect, beforeEach } from "vitest";
import prisma from "@/lib/db/prisma";
import { RateLimitService } from "../RateLimitService";

describe("RateLimitService", () => {
  const testKey = "test_user_rate_limit";

  beforeEach(async () => {
    // Clear rate limits for clean test environment
    await prisma.rateLimit.deleteMany({
      where: { key: testKey }
    });
  });

  it("should allow requests under the limit", async () => {
    const res = await RateLimitService.checkRateLimit({
      key: testKey,
      limit: 3,
      windowMs: 60000
    });

    expect(res.success).toBe(true);
    expect(res.limit).toBe(3);
    expect(res.remaining).toBe(2);
    expect(res.resetInSeconds).toBeGreaterThan(0);
  });

  it("should block requests once the limit is exceeded", async () => {
    // Make 3 allowed requests
    for (let i = 0; i < 3; i++) {
      await RateLimitService.checkRateLimit({
        key: testKey,
        limit: 3,
        windowMs: 60000
      });
    }

    // 4th request should fail
    const blockedRes = await RateLimitService.checkRateLimit({
      key: testKey,
      limit: 3,
      windowMs: 60000
    });

    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
  });

  it("should reset rate limit after window expiration", async () => {
    // Create an expired record directly
    const past = new Date(Date.now() - 5000);
    await prisma.rateLimit.create({
      data: {
        key: testKey,
        count: 5,
        windowStart: new Date(Date.now() - 10000),
        expiresAt: past
      }
    });

    // Check rate limit - should clean up expired record and allow request
    const res = await RateLimitService.checkRateLimit({
      key: testKey,
      limit: 3,
      windowMs: 60000
    });

    expect(res.success).toBe(true);
    expect(res.remaining).toBe(2);
  });
});
