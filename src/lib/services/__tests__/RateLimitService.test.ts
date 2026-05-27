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
  const userId = "user-1";
  const key = "test-key";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new rate limit record if none exists", async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      id: "rl-1",
      userId,
      key,
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkLimit(userId, key, 20, 24);

    expect(result.count).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.remaining).toBe(19);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it("should increment count if within window", async () => {
    const futureDate = addHours(new Date(), 10);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-1",
      userId,
      key,
      count: 5,
      resetAt: futureDate,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: "rl-1",
      userId,
      key,
      count: 6,
      resetAt: futureDate,
    });

    const result = await RateLimitService.checkLimit(userId, key, 20, 24);

    expect(result.count).toBe(6);
    expect(result.remaining).toBe(14);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it("should reset if window has expired", async () => {
    const pastDate = subHours(new Date(), 1);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-1",
      userId,
      key,
      count: 20,
      resetAt: pastDate,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      id: "rl-1",
      userId,
      key,
      count: 1,
      resetAt: addHours(new Date(), 24),
    });

    const result = await RateLimitService.checkLimit(userId, key, 20, 24);

    expect(result.count).toBe(1);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });
});
