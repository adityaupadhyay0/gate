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
  const userId = "user_123";
  const key = "test_key";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow request and create record if none exists", async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, 5, 24);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it("should allow request and increment count if within limit", async () => {
    const futureDate = addHours(new Date(), 23);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl_1",
      userId,
      key,
      count: 2,
      resetAt: futureDate,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 3,
      resetAt: futureDate,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, 5, 24);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it("should deny request if limit is reached", async () => {
    const futureDate = addHours(new Date(), 23);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl_1",
      userId,
      key,
      count: 5,
      resetAt: futureDate,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, 5, 24);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it("should reset count if window has expired", async () => {
    const pastDate = subHours(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl_1",
      userId,
      key,
      count: 5,
      resetAt: pastDate,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, 5, 24);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });
});
