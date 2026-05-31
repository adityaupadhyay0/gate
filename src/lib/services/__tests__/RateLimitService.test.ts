import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";
  const limit = 3;

  beforeEach(async () => {
    await prisma.rateLimit.deleteMany();
    // Ensure user exists due to foreign key constraint
    await prisma.user.upsert({
        where: { id: userId },
        create: { id: userId, email: "test@example.com" },
        update: {}
    });
  });

  it("should allow requests under the limit", async () => {
    const res1 = await RateLimitService.getRateLimit(userId, key, limit);
    expect(res1.isLimited).toBe(false);
    expect(res1.remaining).toBe(2);

    const res2 = await RateLimitService.getRateLimit(userId, key, limit);
    expect(res2.isLimited).toBe(false);
    expect(res2.remaining).toBe(1);

    const res3 = await RateLimitService.getRateLimit(userId, key, limit);
    expect(res3.isLimited).toBe(false);
    expect(res3.remaining).toBe(0);
  });

  it("should block requests over the limit", async () => {
    await RateLimitService.getRateLimit(userId, key, limit);
    await RateLimitService.getRateLimit(userId, key, limit);
    await RateLimitService.getRateLimit(userId, key, limit);

    const res4 = await RateLimitService.getRateLimit(userId, key, limit);
    expect(res4.isLimited).toBe(true);
    expect(res4.remaining).toBe(0);
  });

  it("should reset the limit after the window expires", async () => {
    // Fill the limit
    await RateLimitService.getRateLimit(userId, key, limit);
    await RateLimitService.getRateLimit(userId, key, limit);
    await RateLimitService.getRateLimit(userId, key, limit);

    // Manually expire the window in DB
    await prisma.rateLimit.update({
      where: { userId_key: { userId, key } },
      data: { resetAt: subHours(new Date(), 1) }
    });

    const res5 = await RateLimitService.getRateLimit(userId, key, limit);
    expect(res5.isLimited).toBe(false);
    expect(res5.remaining).toBe(limit - 1);
  });
});
