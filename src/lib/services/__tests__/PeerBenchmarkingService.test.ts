import { describe, it, expect, vi, beforeEach } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "../../db/prisma";

vi.mock("../../db/prisma", () => ({
  default: {
    subject: {
      count: vi.fn()
    },
    topic: {
      count: vi.fn()
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    userProgress: {
      groupBy: vi.fn()
    }
  }
}));

describe("PeerBenchmarkingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  describe("calculateScore", () => {
    it("should calculate score using (Diagnostic Average * 0.4) + (Syllabus Coverage * 0.6)", () => {
      const score = PeerBenchmarkingService.calculateScore(80, 50);
      // (80 * 0.4) + (50 * 0.6) = 32 + 30 = 62
      expect(score).toBe(62);
    });

    it("should clamp diagnostic average and syllabus coverage values between 0 and 100", () => {
      const score1 = PeerBenchmarkingService.calculateScore(150, -20);
      // diag clamped to 100, cov clamped to 0 -> (100 * 0.4) + (0 * 0.6) = 40
      expect(score1).toBe(40);

      const score2 = PeerBenchmarkingService.calculateScore(-10, 200);
      // diag clamped to 0, cov clamped to 100 -> (0 * 0.4) + (100 * 0.6) = 60
      expect(score2).toBe(60);
    });
  });

  describe("getUserBenchmarking", () => {
    it("should calculate rank and percentile correctly for multiple onboarded users", async () => {
      (prisma.subject.count as any).mockResolvedValue(10);
      (prisma.topic.count as any).mockResolvedValue(50);

      const mockUsers = [
        {
          id: "user-1",
          diagnosticResult: JSON.stringify({ strengthMap: { OS: 100, Algo: 100 } })
        },
        {
          id: "user-2",
          diagnosticResult: JSON.stringify({ strengthMap: { OS: 50, Algo: 50 } })
        },
        {
          id: "user-3",
          diagnosticResult: null
        }
      ];

      (prisma.user.findMany as any).mockResolvedValue(mockUsers);

      // User 1: 50 coverage units -> 100% syllabus coverage. Diag avg: 200 / 10 = 20. Score = (20*0.4) + (100*0.6) = 8 + 60 = 68.
      // User 2: 25 coverage units -> 50% syllabus coverage. Diag avg: 100 / 10 = 10. Score = (10*0.4) + (50*0.6) = 4 + 30 = 34.
      // User 3: 0 coverage units -> 0% syllabus coverage. Diag avg: 0. Score = 0.
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "user-1", _sum: { coverageScore: 50 } },
        { userId: "user-2", _sum: { coverageScore: 25 } },
        { userId: "user-3", _sum: { coverageScore: 0 } }
      ]);

      const res1 = await PeerBenchmarkingService.getUserBenchmarking("user-1");
      expect(res1.rank).toBe(1);
      expect(res1.totalUsers).toBe(3);
      expect(res1.percentile).toBe(67); // Math.round(((3-1)/3)*100) = 67
      expect(res1.topPercentileLabel).toBe("Top 33%");

      const res2 = await PeerBenchmarkingService.getUserBenchmarking("user-2");
      expect(res2.rank).toBe(2);
      expect(res2.percentile).toBe(33); // Math.round(((3-2)/3)*100) = 33
      expect(res2.topPercentileLabel).toBe("Top 67%");
    });

    it("should use cache on subsequent requests and bypass cache when _clearCache is called", async () => {
      (prisma.subject.count as any).mockResolvedValue(12);
      (prisma.topic.count as any).mockResolvedValue(100);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: "user-1", diagnosticResult: null }
      ]);
      (prisma.userProgress.groupBy as any).mockResolvedValue([
        { userId: "user-1", _sum: { coverageScore: 50 } }
      ]);

      await PeerBenchmarkingService.getUserBenchmarking("user-1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      // Second request should hit cache
      await PeerBenchmarkingService.getUserBenchmarking("user-1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);

      // Clear cache and request again
      PeerBenchmarkingService._clearCache();
      await PeerBenchmarkingService.getUserBenchmarking("user-1");
      expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
    });

    it("should handle user not in onboarded list (guest or incomplete onboarding)", async () => {
      (prisma.subject.count as any).mockResolvedValue(12);
      (prisma.topic.count as any).mockResolvedValue(100);
      (prisma.user.findMany as any).mockResolvedValue([
        { id: "onboarded-1", diagnosticResult: null }
      ]);
      (prisma.userProgress.groupBy as any).mockImplementation((args: any) => {
        if (args.where?.userId === "guest-1") {
          return Promise.resolve([{ userId: "guest-1", _sum: { coverageScore: 20 } }]);
        }
        return Promise.resolve([{ userId: "onboarded-1", _sum: { coverageScore: 80 } }]);
      });
      (prisma.user.findUnique as any).mockResolvedValue({
        diagnosticResult: JSON.stringify({ strengthMap: { OS: 60 } })
      });

      const res = await PeerBenchmarkingService.getUserBenchmarking("guest-1");
      expect(res.score).toBeGreaterThan(0);
      expect(res.rank).toBe(2);
    });
  });
});
