import { describe, it, expect, vi, beforeEach } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "../../db/prisma";

vi.mock("../../db/prisma", () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    topic: {
      count: vi.fn(),
    },
    subject: {
      count: vi.fn(),
    },
    userProgress: {
      groupBy: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

describe("PeerBenchmarkingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  describe("calculateUserScore", () => {
    it("should calculate composite score correctly with diagnostic and syllabus progress", async () => {
      const diagnostic = JSON.stringify({
        strengthMap: { Algo: 80, OS: 60, CN: 100, COA: 80 },
      });
      // Diagnostic avg = (80+60+100+80)/4 = 80
      // Syllabus coverage = (50 / 100) * 100 = 50%
      // Score = (80 * 0.4) + (50 * 0.6) = 32 + 30 = 62
      const score = await PeerBenchmarkingService.calculateUserScore(
        "user-1",
        diagnostic,
        50,
        100,
        4
      );
      expect(score).toBe(62);
    });

    it("should handle missing diagnostic or zero topics gracefully", async () => {
      const score = await PeerBenchmarkingService.calculateUserScore(
        "user-1",
        null,
        0,
        0,
        0
      );
      expect(score).toBe(0);
    });
  });

  describe("getGlobalDistribution", () => {
    it("should aggregate scores for onboarded users and cache results", async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        {
          id: "u1",
          diagnosticResult: JSON.stringify({ strengthMap: { S1: 90, S2: 90 } }),
        },
        {
          id: "u2",
          diagnosticResult: JSON.stringify({ strengthMap: { S1: 50, S2: 50 } }),
        },
      ]);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(2);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "u1", _sum: { coverageScore: 8 } }, // 80% coverage
        { userId: "u2", _sum: { coverageScore: 2 } }, // 20% coverage
      ]);

      // u1 score: (90 * 0.4) + (80 * 0.6) = 36 + 48 = 84
      // u2 score: (50 * 0.4) + (20 * 0.6) = 20 + 12 = 32
      const distribution = await PeerBenchmarkingService.getGlobalDistribution();

      expect(distribution).toHaveLength(2);
      expect(distribution[0]).toEqual({ userId: "u1", score: 84 });
      expect(distribution[1]).toEqual({ userId: "u2", score: 32 });

      // Call again to test cache hit
      const cached = await PeerBenchmarkingService.getGlobalDistribution();
      expect(cached).toBe(distribution);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBenchmarkForUser", () => {
    it("should rank top user as Rank 1 and Top 1%", async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        {
          id: "u1",
          diagnosticResult: JSON.stringify({ strengthMap: { S1: 100 } }),
        },
        {
          id: "u2",
          diagnosticResult: JSON.stringify({ strengthMap: { S1: 20 } }),
        },
      ]);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(1);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "u1", _sum: { coverageScore: 10 } },
        { userId: "u2", _sum: { coverageScore: 2 } },
      ]);

      const benchmark = await PeerBenchmarkingService.getBenchmarkForUser("u1");

      expect(benchmark.rank).toBe(1);
      expect(benchmark.totalUsers).toBe(2);
      expect(benchmark.topPercentile).toBe(1);
      expect(benchmark.percentile).toBe(99);
      expect(benchmark.rankEstimation).toBe("Top 100");
    });

    it("should calculate rank for user not in distribution list on the fly", async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        {
          id: "u1",
          diagnosticResult: JSON.stringify({ strengthMap: { S1: 90 } }),
        },
      ]);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(1);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "u1", _sum: { coverageScore: 9 } },
      ]);

      // u3 not in findMany (not onboarded yet)
      (prisma.user.findUnique as any).mockResolvedValue({
        diagnosticResult: JSON.stringify({ strengthMap: { S1: 30 } }),
      });
      (prisma.userProgress.aggregate as any).mockResolvedValue({
        _sum: { coverageScore: 2 },
      });

      const benchmark = await PeerBenchmarkingService.getBenchmarkForUser("u3");

      expect(benchmark.rank).toBe(2); // Below u1
      expect(benchmark.topPercentile).toBe(100);
      expect(benchmark.percentile).toBe(1); // Math.max(1, 100 - 100) = 1
    });
  });
});
