import { describe, it, expect, beforeEach, vi } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    topic: {
      count: vi.fn()
    },
    userProgress: {
      findMany: vi.fn(),
      groupBy: vi.fn()
    }
  }
}));

describe("PeerBenchmarkingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  it("should calculate peer metrics correctly for a calibrated user", async () => {
    // Mock user
    const mockUser = {
      id: "user-1",
      diagnosticResult: JSON.stringify({
        strengthMap: {
          Algorithms: 80,
          OS: 90,
          DBMS: 70
        }
      }),
      onboardingComplete: true
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.topic.count).mockResolvedValue(10);

    // User progress: 5 topics completed with score 1.0 each => 5 / 10 = 50% coverage
    vi.mocked(prisma.userProgress.findMany).mockResolvedValue([
      { coverageScore: 1.0 },
      { coverageScore: 1.0 },
      { coverageScore: 1.0 },
      { coverageScore: 1.0 },
      { coverageScore: 1.0 }
    ] as any);

    // Cohort peers
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      mockUser,
      {
        id: "peer-2",
        diagnosticResult: JSON.stringify({
          strengthMap: { Algorithms: 50, OS: 50, DBMS: 50 }
        })
      }
    ] as any);

    vi.mocked(prisma.userProgress.groupBy).mockResolvedValue([
      { userId: "user-1", _sum: { coverageScore: 5.0 } },
      { userId: "peer-2", _sum: { coverageScore: 2.0 } }
    ] as any);

    const metrics = await PeerBenchmarkingService.getUserPeerMetrics("user-1");

    // Diag avg = (80 + 90 + 70) / 3 = 80
    // Coverage = (5 / 10) * 100 = 50%
    // Score = round(80 * 0.4 + 50 * 0.6) = round(32 + 30) = 62
    expect(metrics.isCalibrated).toBe(true);
    expect(metrics.userScore).toBe(62);
    expect(metrics.estimatedRank).toBe(1);
    expect(metrics.topPercentile).toBe(1);
    expect(metrics.percentileHighlight).toBe("Top 1%");
    expect(metrics.rankEstimationText).toBe("Top 2000");
  });

  it("should handle uncalibrated users without diagnostic result", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "uncalibrated-user",
      diagnosticResult: null,
      onboardingComplete: false
    } as any);

    vi.mocked(prisma.topic.count).mockResolvedValue(10);
    vi.mocked(prisma.userProgress.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    vi.mocked(prisma.userProgress.groupBy).mockResolvedValue([]);

    const metrics = await PeerBenchmarkingService.getUserPeerMetrics("uncalibrated-user");

    expect(metrics.isCalibrated).toBe(false);
    expect(metrics.userScore).toBe(0);
    expect(metrics.rankEstimationText).toBe("Not Calibrated");
    expect(metrics.topPercentile).toBe(1);
  });

  it("should respect cache and clear cache via _clearCache()", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      diagnosticResult: null,
      onboardingComplete: true
    } as any);

    vi.mocked(prisma.topic.count).mockResolvedValue(10);
    vi.mocked(prisma.userProgress.findMany).mockResolvedValue([]);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    vi.mocked(prisma.userProgress.groupBy).mockResolvedValue([]);

    await PeerBenchmarkingService.getUserPeerMetrics("user-1");
    expect(prisma.topic.count).toHaveBeenCalledTimes(1);

    // Call again, should use cache for topic count & distribution
    await PeerBenchmarkingService.getUserPeerMetrics("user-1");
    expect(prisma.topic.count).toHaveBeenCalledTimes(1);

    // Clear cache
    PeerBenchmarkingService._clearCache();

    await PeerBenchmarkingService.getUserPeerMetrics("user-1");
    expect(prisma.topic.count).toHaveBeenCalledTimes(2);
  });
});
