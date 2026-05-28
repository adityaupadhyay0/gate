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
  },
}));

describe("RateLimitService", () => {
  const userId = "test-user";
  const key = "test-key";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new rate limit record if none exists", async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      userId,
      key,
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkLimit(userId, key, 5);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it("should increment count if within window and below limit", async () => {
    const resetAt = addHours(new Date(), 10);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "1",
      userId,
      key,
      count: 2,
      resetAt,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: "1",
      userId,
      key,
      count: 3,
      resetAt,
    });

    const result = await RateLimitService.checkLimit(userId, key, 5);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it("should fail if limit is reached", async () => {
    const resetAt = addHours(new Date(), 10);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "1",
      userId,
      key,
      count: 5,
      resetAt,
    });

    const result = await RateLimitService.checkLimit(userId, key, 5);

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(prisma.rateLimit.update).not.toHaveBeenCalled();
  });

  it("should reset if window has passed", async () => {
    const resetAt = subHours(new Date(), 1); // Expired
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "1",
      userId,
      key,
      count: 5,
      resetAt,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      userId,
      key,
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkLimit(userId, key, 5);

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });
});
