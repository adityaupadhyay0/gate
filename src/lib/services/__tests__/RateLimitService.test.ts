import { describe, it, expect, beforeEach } from "vitest";
import prisma from "@/lib/db/prisma";
import { RateLimitService } from "../RateLimitService";

describe("RateLimitService", () => {
  beforeEach(async () => {
    await prisma.rateLimit.deleteMany({});
  });

  it("should allow initial request and set remaining count", async () => {
    const res = await RateLimitService.check("test:user1", 3, 60);
    expect(res.success).toBe(true);
    expect(res.limit).toBe(3);
    expect(res.remaining).toBe(2);
    expect(res.resetInSeconds).toBeLessThanOrEqual(60);
  });

  it("should decrement remaining until limit is reached", async () => {
    await RateLimitService.check("test:user2", 3, 60);
    await RateLimitService.check("test:user2", 3, 60);
    const third = await RateLimitService.check("test:user2", 3, 60);

    expect(third.success).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = await RateLimitService.check("test:user2", 3, 60);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("should reset window after expiration", async () => {
    // Create an expired rate limit entry
    const pastWindowStart = new Date(Date.now() - 120 * 1000); // 120 seconds ago
    await prisma.rateLimit.create({
      data: {
        key: "test:user3",
        count: 5,
        windowStart: pastWindowStart
      }
    });

    // Limit is 5 per 60 seconds. Since 120s have elapsed, window should reset.
    const res = await RateLimitService.check("test:user3", 5, 60);
    expect(res.success).toBe(true);
    expect(res.remaining).toBe(4);
  });
});
