import { describe, it, expect, vi, beforeEach } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "../../db/prisma";

vi.mock("../../db/prisma", () => ({
  default: {
    topic: {
      count: vi.fn(),
    },
    subject: {
      count: vi.fn(),
    },
    userProgress: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("PeerBenchmarkingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  describe("computeUserScore", () => {
    it("should compute overall score combining diagnostic average and syllabus coverage", async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(2);

      // User has sum of coverageScore = 5 (out of 10 topics => 50% coverage)
      (prisma.userProgress.findMany as any).mockResolvedValue([
        { coverageScore: 3 },
        { coverageScore: 2 },
      ]);

      const mockDiagnostic = JSON.stringify({
        strengthMap: { Subject1: 80, Subject2: 60 }, // sum = 140, avg = 140/2 = 70
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: "user-1",
        diagnosticResult: mockDiagnostic,
      });

      const score = await PeerBenchmarkingService.computeUserScore("user-1");

      // Coverage = 50%, Diag Avg = 70
      // Score = (70 * 0.4) + (50 * 0.6) = 28 + 30 = 58
      expect(score.overallScore).toBe(58);
      expect(score.coverageScore).toBe(50);
      expect(score.diagnosticAvg).toBe(70);
    });

    it("should handle missing diagnostic data gracefully", async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(2);
      (prisma.userProgress.findMany as any).mockResolvedValue([{ coverageScore: 10 }]);
      (prisma.user.findUnique as any).mockResolvedValue({ id: "user-2", diagnosticResult: null });

      const score = await PeerBenchmarkingService.computeUserScore("user-2");

      // Coverage = 100%, Diag Avg = 0
      // Score = (0 * 0.4) + (100 * 0.6) = 60
      expect(score.overallScore).toBe(60);
      expect(score.diagnosticAvg).toBe(0);
    });
  });

  describe("getPeerBenchmark", () => {
    it("should calculate correct rank and percentile relative to onboarded users", async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(1);

      // 3 onboarded users in DB
      const mockUsers = [
        { id: "user-high", onboardingComplete: true, diagnosticResult: JSON.stringify({ strengthMap: { S: 90 } }) },
        { id: "user-mid", onboardingComplete: true, diagnosticResult: JSON.stringify({ strengthMap: { S: 60 } }) },
        { id: "user-low", onboardingComplete: true, diagnosticResult: JSON.stringify({ strengthMap: { S: 30 } }) },
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "user-high", _sum: { coverageScore: 10 } }, // 100% coverage => Score: (90*0.4)+(100*0.6) = 36+60 = 96
        { userId: "user-mid", _sum: { coverageScore: 5 } },   // 50% coverage => Score: (60*0.4)+(50*0.6) = 24+30 = 54
        { userId: "user-low", _sum: { coverageScore: 1 } },   // 10% coverage => Score: (30*0.4)+(10*0.6) = 12+6 = 18
      ]);

      // For user-mid
      (prisma.userProgress.findMany as any).mockResolvedValue([{ coverageScore: 5 }]);
      (prisma.user.findUnique as any).mockResolvedValue(mockUsers[1]);

      const result = await PeerBenchmarkingService.getPeerBenchmark("user-mid");

      expect(result.rank).toBe(2);
      expect(result.totalUsers).toBe(3);
      // Percentile formula: round(((3 - 2) / 3) * 100) = round(33.33) = 33
      expect(result.percentile).toBe(33);
      expect(result.topPercentile).toBe(67);
      expect(result.overallScore).toBe(54);
      expect(result.tier).toBe("Top 5000");
    });

    it("should use in-memory cache on subsequent requests", async () => {
      (prisma.topic.count as any).mockResolvedValue(10);
      (prisma.subject.count as any).mockResolvedValue(1);

      const mockUsers = [
        { id: "user-1", onboardingComplete: true, diagnosticResult: JSON.stringify({ strengthMap: { S: 80 } }) },
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "user-1", _sum: { coverageScore: 8 } },
      ]);
      (prisma.userProgress.findMany as any).mockResolvedValue([{ coverageScore: 8 }]);
      (prisma.user.findUnique as any).mockResolvedValue(mockUsers[0]);

      // First call populates cache
      await PeerBenchmarkingService.getPeerBenchmark("user-1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      // Second call uses cache
      await PeerBenchmarkingService.getPeerBenchmark("user-1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1); // Still 1

      // Clearing cache forces re-fetch
      PeerBenchmarkingService._clearCache();
      await PeerBenchmarkingService.getPeerBenchmark("user-1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
    });
  });
});
