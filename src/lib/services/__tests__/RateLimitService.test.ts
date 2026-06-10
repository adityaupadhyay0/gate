import { describe, it, expect, beforeEach, vi } from "vitest";
import { RateLimitService } from "../RateLimitService";
import prisma from "@/lib/db/prisma";

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
  const userId = "test-user-id";
  const key = "ai_explain";
  const limit = 5;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new rate limit record if none exists", async () => {
    (prisma.rateLimit.findUnique as any).mockResolvedValue(null);
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      userId,
      key,
      count: 1,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const status = await RateLimitService.checkLimit(userId, key, limit);

    expect(status.allowed).toBe(true);
    expect(status.count).toBe(1);
    expect(status.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });

  it("should increment an existing rate limit record", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-id",
      userId,
      key,
      count: 2,
      resetAt: futureDate,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: "rl-id",
      userId,
      key,
      count: 3,
      resetAt: futureDate,
    });

    const status = await RateLimitService.checkLimit(userId, key, limit);

    expect(status.allowed).toBe(true);
    expect(status.count).toBe(3);
    expect(status.remaining).toBe(2);
    expect(prisma.rateLimit.update).toHaveBeenCalled();
  });

  it("should block requests when the limit is exceeded", async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-id",
      userId,
      key,
      count: 5,
      resetAt: futureDate,
    });
    (prisma.rateLimit.update as any).mockResolvedValue({
      id: "rl-id",
      userId,
      key,
      count: 6,
      resetAt: futureDate,
    });

    const status = await RateLimitService.checkLimit(userId, key, limit);

    expect(status.allowed).toBe(false);
    expect(status.count).toBe(6);
    expect(status.remaining).toBe(0);
  });

  it("should reset the limit if the window has expired", async () => {
    const pastDate = new Date(Date.now() - 1000);
    (prisma.rateLimit.findUnique as any).mockResolvedValue({
      id: "rl-id",
      userId,
      key,
      count: 5,
      resetAt: pastDate,
    });
    (prisma.rateLimit.upsert as any).mockResolvedValue({
      userId,
      key,
      count: 1,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const status = await RateLimitService.checkLimit(userId, key, limit);

    expect(status.allowed).toBe(true);
    expect(status.count).toBe(1);
    expect(status.remaining).toBe(4);
    expect(prisma.rateLimit.upsert).toHaveBeenCalled();
  });
});
