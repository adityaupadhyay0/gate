import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";

  beforeEach(async () => {
    // Clean up before each test
    await prisma.rateLimit.deleteMany({
      where: { userId, key }
    });

    // Ensure user exists (if needed by FK, though SQLite might be lenient depending on setup)
    // For this test, we assume the user doesn't need to exist in the User table
    // unless there are strict FK constraints being enforced during tests.
    // Let's create the user just in case.
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email: "test@example.com" }
    });
  });

  it("should allow requests within the limit", async () => {
    const limit = 2;

    const res1 = await RateLimitService.checkLimit(userId, key, limit);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = await RateLimitService.checkLimit(userId, key, limit);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it("should deny requests over the limit", async () => {
    const limit = 1;

    await RateLimitService.checkLimit(userId, key, limit);
    const res = await RateLimitService.checkLimit(userId, key, limit);

    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
  });

  it("should reset the limit after the window expires", async () => {
    const limit = 1;
    const windowHours = 24;

    // Create an expired record
    await prisma.rateLimit.create({
      data: {
        userId,
        key,
        count: 1,
        resetAt: subHours(new Date(), 1) // Expired 1 hour ago
      }
    });

    const res = await RateLimitService.checkLimit(userId, key, limit, windowHours);

    expect(res.allowed).toBe(true);
    expect(res.remaining).toBe(0); // Count became 1 immediately
    expect(res.resetAt.getTime()).toBeGreaterThan(new Date().getTime());
  });

  it("should handle multiple keys independently", async () => {
    const limit = 1;
    const key2 = "other-key";

    await RateLimitService.checkLimit(userId, key, limit);
    const res2 = await RateLimitService.checkLimit(userId, key2, limit);

    expect(res2.allowed).toBe(true);
  });
});
