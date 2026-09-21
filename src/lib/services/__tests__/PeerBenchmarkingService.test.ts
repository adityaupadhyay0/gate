import { describe, it, expect, vi, beforeEach } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "../../db/prisma";

vi.mock("../../db/prisma", () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
    subject: {
      count: vi.fn(),
    },
    topic: {
      count: vi.fn(),
    },
    userProgress: {
      groupBy: vi.fn(),
    },
  },
}));

describe("PeerBenchmarkingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  it("should return null rank and percentile when no onboarded users exist", async () => {
    (prisma.user.findMany as any).mockResolvedValue([]);
    (prisma.subject.count as any).mockResolvedValue(12);
    (prisma.topic.count as any).mockResolvedValue(100);
    (prisma.userProgress.groupBy as any).mockResolvedValue([]);

    const result = await PeerBenchmarkingService.getBenchmarkingStats("user-1");

    expect(result).toEqual({
      rank: null,
      percentile: null,
      totalUsers: 0,
      score: 0,
    });
  });

  it("should calculate score, rank, and percentile correctly for onboarded users", async () => {
    const user1Diagnostic = JSON.stringify({
      strengthMap: { Algo: 90, OS: 90, DBMS: 90, CN: 90, TOC: 90, COA: 90, CD: 90, DM: 90, DL: 90, EM: 90, CP: 90, DS: 90 },
    });
    const user2Diagnostic = JSON.stringify({
      strengthMap: { Algo: 50, OS: 50, DBMS: 50, CN: 50, TOC: 50, COA: 50, CD: 50, DM: 50, DL: 50, EM: 50, CP: 50, DS: 50 },
    });

    (prisma.user.findMany as any).mockResolvedValue([
      { id: "user-1", diagnosticResult: user1Diagnostic },
      { id: "user-2", diagnosticResult: user2Diagnostic },
    ]);
    (prisma.subject.count as any).mockResolvedValue(12);
    (prisma.topic.count as any).mockResolvedValue(100);

    // user-1 has sum of coverageScore = 80 (80% coverage)
    // user-2 has sum of coverageScore = 20 (20% coverage)
    (prisma.userProgress.groupBy as any).mockResolvedValue([
      { userId: "user-1", _sum: { coverageScore: 80 } },
      { userId: "user-2", _sum: { coverageScore: 20 } },
    ]);

    // user-1 score: diagAvg = 90 (sum 1080 / 12 = 90), cov = 80%. score = (90 * 0.4) + (80 * 0.6) = 36 + 48 = 84
    // user-2 score: diagAvg = 50 (sum 600 / 12 = 50), cov = 20%. score = (50 * 0.4) + (20 * 0.6) = 20 + 12 = 32
    // user-1 is Rank 1 of 2. Raw Percentile = ((2 - 1) / 2) * 100 = 50
    // user-2 is Rank 2 of 2. Raw Percentile = ((2 - 2) / 2) * 100 = 0 -> clamped to 1

    const stats1 = await PeerBenchmarkingService.getBenchmarkingStats("user-1");
    expect(stats1.rank).toBe(1);
    expect(stats1.percentile).toBe(50);
    expect(stats1.totalUsers).toBe(2);
    expect(stats1.score).toBe(84);

    const stats2 = await PeerBenchmarkingService.getBenchmarkingStats("user-2");
    expect(stats2.rank).toBe(2);
    expect(stats2.percentile).toBe(1);
    expect(stats2.totalUsers).toBe(2);
    expect(stats2.score).toBe(32);
  });

  it("should return null rank for user not present in distribution", async () => {
    (prisma.user.findMany as any).mockResolvedValue([
      { id: "user-1", diagnosticResult: null },
    ]);
    (prisma.subject.count as any).mockResolvedValue(12);
    (prisma.topic.count as any).mockResolvedValue(100);
    (prisma.userProgress.groupBy as any).mockResolvedValue([]);

    const result = await PeerBenchmarkingService.getBenchmarkingStats("non-existent-user");

    expect(result.rank).toBeNull();
    expect(result.percentile).toBeNull();
    expect(result.totalUsers).toBe(1);
  });

  it("should use in-memory cache on subsequent calls within TTL", async () => {
    (prisma.user.findMany as any).mockResolvedValue([
      { id: "user-1", diagnosticResult: null },
    ]);
    (prisma.subject.count as any).mockResolvedValue(12);
    (prisma.topic.count as any).mockResolvedValue(100);
    (prisma.userProgress.groupBy as any).mockResolvedValue([]);

    await PeerBenchmarkingService.getBenchmarkingStats("user-1");
    await PeerBenchmarkingService.getBenchmarkingStats("user-1");

    // DB calls should only be triggered once due to caching
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
  });

  it("should clear cache when _clearCache() is called", async () => {
    (prisma.user.findMany as any).mockResolvedValue([
      { id: "user-1", diagnosticResult: null },
    ]);
    (prisma.subject.count as any).mockResolvedValue(12);
    (prisma.topic.count as any).mockResolvedValue(100);
    (prisma.userProgress.groupBy as any).mockResolvedValue([]);

    await PeerBenchmarkingService.getBenchmarkingStats("user-1");
    PeerBenchmarkingService._clearCache();
    await PeerBenchmarkingService.getBenchmarkingStats("user-1");

    expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
  });
});
