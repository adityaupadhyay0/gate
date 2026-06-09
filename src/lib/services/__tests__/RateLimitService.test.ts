import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "../../db/prisma";
import { addHours, subHours } from "date-fns";

vi.mock("../../db/prisma", () => ({
  default: {
    rateLimit: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
    user: {
      create: vi.fn(),
    }
  },
}));

describe("RateLimitService", () => {
  const userId = "test-user-id";
  const key = "test-key";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow request and increment count when below limit", async () => {
    const mockRateLimit = {
      id: "rl-1",
      userId,
      key,
      count: 5,
      resetAt: addHours(new Date(), 10),
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);
    (prisma.rateLimit.update as any).mockResolvedValue({
      ...mockRateLimit,
      count: 6,
    });

    const result = await RateLimitService.checkRateLimit(userId, key, 10);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: "rl-1" },
      data: { count: { increment: 1 } },
    });
  });

  it("should limit request when at or above limit", async () => {
    const mockRateLimit = {
      id: "rl-1",
      userId,
      key,
      count: 10,
      resetAt: addHours(new Date(), 10),
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);

    const result = await RateLimitService.checkRateLimit(userId, key, 10);

    expect(result.isLimited).toBe(true);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it("should reset window if resetAt has passed", async () => {
    const expiredDate = subHours(new Date(), 1);
    const mockRateLimit = {
      id: "rl-1",
      userId,
      key,
      count: 10,
      resetAt: expiredDate,
    };

    (prisma.rateLimit.upsert as any).mockResolvedValue(mockRateLimit);
    (prisma.rateLimit.update as any).mockResolvedValue({
      ...mockRateLimit,
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkRateLimit(userId, key, 10);

    expect(result.isLimited).toBe(false);
    expect(result.remaining).toBe(9);
    expect(prisma.rateLimit.update).toHaveBeenCalledWith({
      where: { id: "rl-1" },
      data: expect.objectContaining({
        count: 1,
        resetAt: expect.any(Date),
      }),
    });
  });
});
