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
  const userId = "user-123";
  const key = "ai-explain";
  const limit = 5;
  const windowHours = 24;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow request and initialize record if none exists", async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: addHours(new Date(), windowHours),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(limit - 1);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it("should allow request and increment count if record exists and within window", async () => {
    const resetAt = addHours(new Date(), windowHours);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-1",
      count: 1,
      resetAt,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: "rl-1",
      count: 2,
      resetAt,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(limit - 2);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it("should deny request if limit is reached", async () => {
    const resetAt = addHours(new Date(), windowHours);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-1",
      count: 5,
      resetAt,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it("should reset count if window has passed", async () => {
    const resetAt = subHours(new Date(), 1); // 1 hour ago
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-1",
      count: 5,
      resetAt,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      count: 1,
      resetAt: addHours(new Date(), windowHours),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, limit, windowHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(limit - 1);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });
});
