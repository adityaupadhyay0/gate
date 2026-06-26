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
    // Ensure test user exists if needed by schema (though onDelete Cascade is on User)
    // Actually, prisma might need the user to exist if we were using real foreign keys
    // In our tests we usually mock or use a real test db.

    // Create test user if it doesn't exist
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email: "test@example.com" }
    });
  });

  it("should allow requests within the limit", async () => {
    const limit = 5;
    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("should block requests exceeding the limit", async () => {
    const limit = 2;

    // First request
    await RateLimitService.checkAndIncrement(userId, key, limit);
    // Second request
    await RateLimitService.checkAndIncrement(userId, key, limit);
    // Third request (should be blocked)
    const result = await RateLimitService.checkAndIncrement(userId, key, limit);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset the window after windowHours", async () => {
    const limit = 2;
    const windowHours = 24;

    // Exhaust the limit
    await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);
    await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);

    // Manually update the lastReset to be in the past
    const record = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });

    await prisma.rateLimit.update({
      where: { id: record!.id },
      data: {
        lastReset: subHours(new Date(), 25)
      }
    });

    // Next request should be allowed and reset the count
    const result = await RateLimitService.checkAndIncrement(userId, key, limit, windowHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1); // 2 - 1 = 1 remaining
  });

  it("should track separate keys independently for the same user", async () => {
    const limit = 1;

    await RateLimitService.checkAndIncrement(userId, "key1", limit);
    const result2 = await RateLimitService.checkAndIncrement(userId, "key2", limit);

    expect(result2.allowed).toBe(true);
  });
});
