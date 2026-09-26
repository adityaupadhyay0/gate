import { describe, it, expect, vi, beforeEach } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
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
    it("should correctly compute score using (Diagnostic Avg * 0.4) + (Syllabus Coverage * 0.6)", () => {
      const diagnosticObj = {
        strengthMap: {
          Algo: 80,
          OS: 80,
          CN: 80,
          DBMS: 80,
          COA: 80,
          TOC: 80,
          Compiler: 80,
          Math: 80,
          Digital: 80,
          Aptitude: 80,
          DS: 80,
          SE: 80,
        },
      };

      // Diagnostic avg = (80 * 12) / 12 = 80.
      // Coverage = 50 sum out of 100 topics = 50%.
      // Total score = (80 * 0.4) + (50 * 0.6) = 32 + 30 = 62.
      const result = PeerBenchmarkingService.calculateUserScore(
        JSON.stringify(diagnosticObj),
        50,
        100,
        12
      );

      expect(result.score).toBe(62);
      expect(result.subjectBreakdown?.Algo).toBe(80);
    });

    it("should handle null or invalid diagnosticResult gracefully", () => {
      // Diagnostic avg = 0.
      // Coverage = 50 sum out of 100 topics = 50%.
      // Score = (0 * 0.4) + (50 * 0.6) = 30.
      const result = PeerBenchmarkingService.calculateUserScore(
        null,
        50,
        100,
        12
      );

      expect(result.score).toBe(30);
    });
  });

  describe("estimateGateRank", () => {
    it("should return expected rank tiers based on score thresholds", () => {
      expect(PeerBenchmarkingService.estimateGateRank(90)).toBe("Top 100");
      expect(PeerBenchmarkingService.estimateGateRank(75)).toBe("Top 500");
      expect(PeerBenchmarkingService.estimateGateRank(60)).toBe("Top 2000");
      expect(PeerBenchmarkingService.estimateGateRank(45)).toBe("Top 5000");
      expect(PeerBenchmarkingService.estimateGateRank(30)).toBe("Top 10000");
      expect(PeerBenchmarkingService.estimateGateRank(15)).toBe("Top 20000+");
    });
  });

  describe("getPeerBenchmark", () => {
    it("should calculate rank and percentile across onboarded users", async () => {
      const mockUsers = [
        {
          id: "user-1",
          diagnosticResult: JSON.stringify({ strengthMap: { Algo: 90 } }),
        },
        {
          id: "user-2",
          diagnosticResult: JSON.stringify({ strengthMap: { Algo: 50 } }),
        },
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(1);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "user-1", _sum: { coverageScore: 9 } }, // coverage = 90%
        { userId: "user-2", _sum: { coverageScore: 2 } }, // coverage = 20%
      ]);

      const benchmarkUser1 = await PeerBenchmarkingService.getPeerBenchmark("user-1");

      expect(benchmarkUser1.userId).toBe("user-1");
      expect(benchmarkUser1.rank).toBe(1);
      expect(benchmarkUser1.totalUsers).toBe(2);
      expect(benchmarkUser1.percentile).toBe(50); // (2 - 1)/2 * 100 = 50
      expect(benchmarkUser1.estimatedGateRank).toBe("Top 100");

      const benchmarkUser2 = await PeerBenchmarkingService.getPeerBenchmark("user-2");
      expect(benchmarkUser2.rank).toBe(2);
      expect(benchmarkUser2.percentile).toBe(1); // (2 - 2)/2 = 0 -> clamped to 1
    });

    it("should use in-memory distribution cache on subsequent calls until cleared", async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        { id: "u1", diagnosticResult: null },
      ]);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(10);
      (prisma.userProgress.groupBy as any).mockResolvedValue([]);

      await PeerBenchmarkingService.getPeerBenchmark("u1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      // Second call should hit the 10-minute cache
      await PeerBenchmarkingService.getPeerBenchmark("u1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      // Clearing cache should trigger new Prisma query
      PeerBenchmarkingService._clearCache();
      await PeerBenchmarkingService.getPeerBenchmark("u1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
    });

    it("should dynamically calculate benchmark for non-onboarded user", async () => {
      (prisma.user.findMany as any).mockResolvedValue([
        { id: "u1", diagnosticResult: JSON.stringify({ strengthMap: { Algo: 90 } }) },
      ]);
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(1);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "u1", _sum: { coverageScore: 9 } },
      ]);

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "guest-1",
        diagnosticResult: JSON.stringify({ strengthMap: { Algo: 20 } }),
      });
      (prisma.userProgress.aggregate as any).mockResolvedValue({
        _sum: { coverageScore: 1 },
      });

      const benchmarkGuest = await PeerBenchmarkingService.getPeerBenchmark("guest-1");

      expect(benchmarkGuest.userId).toBe("guest-1");
      expect(benchmarkGuest.rank).toBe(2);
      expect(benchmarkGuest.totalUsers).toBe(2);
    });
  });
});
