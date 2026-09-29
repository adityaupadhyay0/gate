import { describe, it, expect, beforeEach, vi } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn()
    },
    userProgress: {
      groupBy: vi.fn(),
      findMany: vi.fn()
    },
    subject: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    topic: {
      count: vi.fn()
    }
  }
}));

describe("PeerBenchmarkingService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    PeerBenchmarkingService._clearCache();
  });

  it("should calculate percentile and rank correctly for a user in a cohort", async () => {
    // Mock database counts
    vi.mocked(prisma.subject.count).mockResolvedValue(10);
    vi.mocked(prisma.topic.count).mockResolvedValue(100);

    // Mock onboarded users
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: "user-1", diagnosticResult: JSON.stringify({ strengthMap: { Algo: 90, OS: 90 } }) } as any,
      { id: "user-2", diagnosticResult: JSON.stringify({ strengthMap: { Algo: 50, OS: 50 } }) } as any,
      { id: "user-3", diagnosticResult: JSON.stringify({ strengthMap: { Algo: 20, OS: 20 } }) } as any,
    ]);

    // Mock user progress sums
    vi.mocked(prisma.userProgress.groupBy).mockResolvedValue([
      { userId: "user-1", _sum: { coverageScore: 80 } },
      { userId: "user-2", _sum: { coverageScore: 50 } },
      { userId: "user-3", _sum: { coverageScore: 10 } },
    ] as any);

    vi.mocked(prisma.subject.findMany).mockResolvedValue([]);

    const result = await PeerBenchmarkingService.getPeerBenchmarking("user-1");

    expect(result.rank).toBe(1);
    expect(result.totalUsers).toBe(3);
    expect(result.topPercentile).toBe(1);
    expect(result.percentileRank).toBe(99);
    expect(result.estimatedRankRange).toBe("Rank #1 Candidate");
  });

  it("should compute lower rank for low score users", async () => {
    vi.mocked(prisma.subject.count).mockResolvedValue(10);
    vi.mocked(prisma.topic.count).mockResolvedValue(100);

    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: "user-1", diagnosticResult: JSON.stringify({ strengthMap: { Algo: 90 } }) } as any,
      { id: "user-2", diagnosticResult: JSON.stringify({ strengthMap: { Algo: 20 } }) } as any,
    ]);

    vi.mocked(prisma.userProgress.groupBy).mockResolvedValue([
      { userId: "user-1", _sum: { coverageScore: 80 } },
      { userId: "user-2", _sum: { coverageScore: 10 } },
    ] as any);

    vi.mocked(prisma.subject.findMany).mockResolvedValue([]);

    const result = await PeerBenchmarkingService.getPeerBenchmarking("user-2");

    expect(result.rank).toBe(2);
    expect(result.totalUsers).toBe(2);
    expect(result.topPercentile).toBe(100);
    expect(result.percentileRank).toBe(0);
  });

  it("should calculate fallback metrics on the fly for non-onboarded user", async () => {
    vi.mocked(prisma.subject.count).mockResolvedValue(10);
    vi.mocked(prisma.topic.count).mockResolvedValue(100);

    // Cohort has user-1
    vi.mocked(prisma.user.findMany).mockResolvedValue([
      { id: "user-1", diagnosticResult: JSON.stringify({ strengthMap: { Algo: 80 } }) } as any,
    ]);

    vi.mocked(prisma.userProgress.groupBy).mockResolvedValue([
      { userId: "user-1", _sum: { coverageScore: 80 } },
    ] as any);

    // Non-onboarded user-new
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-new",
      diagnosticResult: JSON.stringify({ strengthMap: { Algo: 40 } })
    } as any);

    vi.mocked(prisma.userProgress.findMany).mockResolvedValue([
      { coverageScore: 30 }
    ] as any);

    vi.mocked(prisma.subject.findMany).mockResolvedValue([]);

    const result = await PeerBenchmarkingService.getPeerBenchmarking("user-new");

    expect(result).toBeDefined();
    expect(result.totalUsers).toBe(1); // From cached cohort
  });
});
