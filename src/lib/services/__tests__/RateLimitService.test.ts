import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";
  const limit = 3;

  beforeEach(async () => {
    // Clean up before each test
    await prisma.rateLimit.deleteMany({});
    // Ensure the user exists (foreign key constraint)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        await prisma.user.create({
            data: {
                id: userId,
                email: "test@example.com"
            }
        });
    }
  });

  it("should create a new rate limit record on first check", async () => {
    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(limit - 1);
    expect(result.limit).toBe(limit);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record).not.toBeNull();
    expect(record?.count).toBe(1);
  });

  it("should increment count on subsequent checks", async () => {
    await RateLimitService.checkAndIncrement(userId, key, limit);
    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(limit - 2);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(2);
  });

  it("should block when limit is exceeded", async () => {
    await RateLimitService.checkAndIncrement(userId, key, limit); // 1
    await RateLimitService.checkAndIncrement(userId, key, limit); // 2
    await RateLimitService.checkAndIncrement(userId, key, limit); // 3

    const result = await RateLimitService.checkAndIncrement(userId, key, limit); // 4

    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(3);
  });

  it("should reset count after window expires", async () => {
    // Create an expired record
    const expiredDate = subHours(new Date(), 1);
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: 3,
        resetAt: expiredDate
      }
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(limit - 1);

    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });
    expect(record?.count).toBe(1);
    expect(record?.resetAt.getTime()).toBeGreaterThan(new Date().getTime());
  });
});
