import { describe, it, expect, beforeEach } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";

describe("RateLimitService", () => {
  beforeEach(async () => {
    // Clean up rate limits table before each test run
    await prisma.rateLimit.deleteMany();
  });

  it("should allow requests under the rate limit threshold", async () => {
    const key = "test:user_1";
    const limit = 3;
    const windowMs = 60000; // 1 minute

    const res1 = await RateLimitService.checkRateLimit(key, limit, windowMs);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);
    expect(res1.retryAfterSeconds).toBe(0);

    const res2 = await RateLimitService.checkRateLimit(key, limit, windowMs);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await RateLimitService.checkRateLimit(key, limit, windowMs);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("should reject requests exceeding the limit with accurate retryAfterSeconds", async () => {
    const key = "test:user_2";
    const limit = 2;
    const windowMs = 60000; // 60 seconds

    await RateLimitService.checkRateLimit(key, limit, windowMs);
    await RateLimitService.checkRateLimit(key, limit, windowMs);

    const blockedRes = await RateLimitService.checkRateLimit(key, limit, windowMs);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
    expect(blockedRes.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("should reset rate limit after window expiration", async () => {
    const key = "test:user_3";
    const limit = 1;
    const windowMs = 100; // short window for test

    const first = await RateLimitService.checkRateLimit(key, limit, windowMs);
    expect(first.success).toBe(true);

    const second = await RateLimitService.checkRateLimit(key, limit, windowMs);
    expect(second.success).toBe(false);

    // Wait for window to expire
    await new Promise((r) => setTimeout(r, 150));

    const third = await RateLimitService.checkRateLimit(key, limit, windowMs);
    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);
  });
});
