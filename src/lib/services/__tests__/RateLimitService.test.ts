import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { AI_CONFIG } from "@/lib/config/ai";
import { addHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "ai_explain";

  beforeEach(async () => {
    // Clean up
    await prisma.rateLimit.deleteMany();
    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: "test@example.com" },
    });
  });

  it("should allow request and increment count", async () => {
    const result = await RateLimitService.checkAndIncrement(userId, key);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(AI_CONFIG.RATE_LIMIT_LIMIT - 1);

    const dbRecord = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } },
    });
    expect(dbRecord?.count).toBe(1);
  });

  it("should block request when limit exceeded", async () => {
    // Set count to limit
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: AI_CONFIG.RATE_LIMIT_LIMIT,
        lastReset: new Date(),
      },
    });

    const result = await RateLimitService.checkAndIncrement(userId, key);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset count after window expires", async () => {
    // Set old reset date
    const oldDate = addHours(new Date(), -(AI_CONFIG.RATE_LIMIT_WINDOW_HOURS + 1));
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: AI_CONFIG.RATE_LIMIT_LIMIT,
        lastReset: oldDate,
      },
    });

    const result = await RateLimitService.checkAndIncrement(userId, key);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(AI_CONFIG.RATE_LIMIT_LIMIT - 1);

    const dbRecord = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } },
    });
    expect(dbRecord?.count).toBe(1);
    expect(dbRecord?.lastReset.getTime()).toBeGreaterThan(oldDate.getTime());
  });

  it("should handle multiple increments correctly", async () => {
    await RateLimitService.checkAndIncrement(userId, key);
    const result = await RateLimitService.checkAndIncrement(userId, key);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(AI_CONFIG.RATE_LIMIT_LIMIT - 2);

    const dbRecord = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } },
    });
    expect(dbRecord?.count).toBe(2);
  });
});
