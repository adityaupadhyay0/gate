import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";
import { addHours, subHours } from "date-fns";

vi.mock("@/lib/db/prisma", () => ({
  default: {
    rateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    user: {
      create: vi.fn(),
    }
  },
}));

describe("RateLimitService", () => {
  const userId = "user_123";
  const key = "ai_explain";
  const limit = 3;
  const windowInHours = 24;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow request and create record if it doesn't exist", async () => {
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      id: "rl_1",
      userId,
      key,
      count: 0,
      lastReset: new Date(),
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 1,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit, windowInHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it("should increment count if within window and under limit", async () => {
    const lastReset = new Date();
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      id: "rl_1",
      userId,
      key,
      count: 1,
      lastReset,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 2,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit, windowInHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: "rl_1" },
      data: { count: { increment: 1 } },
    });
  });

  it("should block request if limit is reached within window", async () => {
    const lastReset = new Date();
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      id: "rl_1",
      userId,
      key,
      count: 3,
      lastReset,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit, windowInHours);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it("should reset count and allow request if window has expired", async () => {
    const lastReset = subHours(new Date(), 25); // Older than 24h
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      id: "rl_1",
      userId,
      key,
      count: 3,
      lastReset,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      count: 1,
    });

    const result = await RateLimitService.checkAndIncrement(userId, key, limit, windowInHours);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: "rl_1" },
      data: expect.objectContaining({
        count: 1,
      }),
    });
  });
});
