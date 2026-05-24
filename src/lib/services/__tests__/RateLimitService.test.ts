import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-feature";

  beforeEach(async () => {
    // Clear relevant tables before each test
    await prisma.rateLimit.deleteMany();
    await prisma.user.deleteMany();

    // Create default test user
    await prisma.user.create({
      data: {
        id: userId,
        email: "test@example.com",
      },
    });
  });

  it("should allow requests within the limit", async () => {
    const limit = 5;
    for (let i = 1; i <= limit; i++) {
      const result = await RateLimitService.checkLimit(userId, key, limit);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(limit - i);
    }
  });

  it("should block requests exceeding the limit", async () => {
    const limit = 2;

    // First request
    await RateLimitService.checkLimit(userId, key, limit);
    // Second request
    await RateLimitService.checkLimit(userId, key, limit);
    // Third request (should fail)
    const result = await RateLimitService.checkLimit(userId, key, limit);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset the limit after the window expires", async () => {
    const limit = 1;
    const windowHours = 24;

    // First request
    await RateLimitService.checkLimit(userId, key, limit, windowHours);

    // Manually update the resetAt to be in the past
    await prisma.rateLimit.update({
      where: { userId_key: { userId, key } },
      data: { resetAt: subHours(new Date(), 1) },
    });

    // Request after window should succeed
    const result = await RateLimitService.checkLimit(userId, key, limit, windowHours);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0); // 1 - 1 = 0
  });

  it("should handle separate limits for different keys", async () => {
    const limit = 1;
    const key1 = "key1";
    const key2 = "key2";

    await RateLimitService.checkLimit(userId, key1, limit);
    const result = await RateLimitService.checkLimit(userId, key2, limit);

    expect(result.success).toBe(true);
  });

  it("should handle separate limits for different users", async () => {
    const limit = 1;
    const userId1 = "user1";
    const userId2 = "user2";

    await prisma.user.createMany({
      data: [
        { id: userId1, email: "user1@example.com" },
        { id: userId2, email: "user2@example.com" },
      ],
    });

    await RateLimitService.checkLimit(userId1, key, limit);
    const result = await RateLimitService.checkLimit(userId2, key, limit);

    expect(result.success).toBe(true);
  });
});
