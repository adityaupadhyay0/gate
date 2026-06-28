import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";
  const limit = 3;
  const windowHours = 24;

  beforeEach(async () => {
    // Clean up before each test
    await prisma.rateLimit.deleteMany({
      where: { userId, key },
    });
    // Ensure user exists if there's a foreign key constraint
    // (Assuming User exists or SQLite allows it for tests)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        await prisma.user.create({ data: { id: userId, email: "test@example.com" } });
    }
  });

  it("should allow requests under the limit and increment count", async () => {
    const res1 = await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    expect(res1.isAllowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    expect(res2.isAllowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    expect(res3.isAllowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("should block requests over the limit", async () => {
    // Fill up the limit
    for (let i = 0; i < limit; i++) {
      await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    }

    const res = await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    expect(res.isAllowed).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it("should reset the window after windowHours has passed", async () => {
    // Fill up the limit
    for (let i = 0; i < limit; i++) {
      await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    }

    // Manually backdate the lastReset in the database
    const rl = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } },
    });

    await prisma.rateLimit.update({
      where: { id: rl!.id },
      data: { lastReset: subHours(new Date(), windowHours + 1) },
    });

    const res = await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    expect(res.isAllowed).toBe(true);
    expect(res.remaining).toBe(limit - 1);
  });
});
