import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";

  beforeEach(async () => {
    // Clear the RateLimit table before each test
    await prisma.rateLimit.deleteMany();
    // Ensure the user exists (foreign key constraint)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "test@example.com" }
    });
  });

  it("should allow requests under the limit", async () => {
    const result = await RateLimitService.checkLimit(userId, key, 5);
    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.count).toBeUndefined(); // count is not part of RateLimitResult but internal
  });

  it("should block requests over the limit", async () => {
    // Consume the limit
    for (let i = 0; i < 5; i++) {
      await RateLimitService.checkLimit(userId, key, 5);
    }

    const result = await RateLimitService.checkLimit(userId, key, 5);
    expect(result.isAllowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset the limit after the window expires", async () => {
    // Consume the limit
    for (let i = 0; i < 5; i++) {
      await RateLimitService.checkLimit(userId, key, 5);
    }

    // Manually update the resetAt to the past
    await prisma.rateLimit.update({
      where: { userId_key: { userId, key } },
      data: { resetAt: subHours(new Date(), 1) }
    });

    const result = await RateLimitService.checkLimit(userId, key, 5);
    expect(result.isAllowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should correctly calculate remaining requests", async () => {
    await RateLimitService.checkLimit(userId, key, 10);
    const result = await RateLimitService.checkLimit(userId, key, 10);
    expect(result.remaining).toBe(8);
  });
});
