import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

vi.mock("@/lib/db/prisma", () => ({
  default: {
    rateLimit: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: {
      create: vi.fn(),
    }
  },
}));

describe("RateLimitService", () => {
  const userId = "test-user";
  const key = "ai_explain";
  const limit = 2;
  const windowHours = 24;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new rate limit record if none exists", async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(prisma.rateLimit.findUnique).toHaveBeenCalled();
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
    expect(result.count).toBe(1);
    expect(result.isBlocked).toBe(false);
    expect(result.remaining).toBe(1);
  });

  it("should increment count if record exists and is within window", async () => {
    const resetAt = addHours(new Date(), 20);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      count: 1,
      resetAt,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 2,
      resetAt,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(prisma.rateLimit.update).toHaveBeenCalled();
    expect(result.count).toBe(2);
    expect(result.isBlocked).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should block if count exceeds limit", async () => {
    const resetAt = addHours(new Date(), 20);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      count: 2,
      resetAt,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 3,
      resetAt,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.count).toBe(3);
    expect(result.isBlocked).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("should reset if current window has expired", async () => {
    const expiredResetAt = subHours(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      count: 5,
      resetAt: expiredResetAt,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
    expect(result.count).toBe(1);
    expect(result.isBlocked).toBe(false);
  });
});
