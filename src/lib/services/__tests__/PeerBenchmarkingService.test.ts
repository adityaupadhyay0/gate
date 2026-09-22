import { describe, it, expect, beforeEach } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "@/lib/db/prisma";

describe("PeerBenchmarkingService", () => {
  beforeEach(async () => {
    PeerBenchmarkingService._clearCache();
    await prisma.userProgress.deleteMany();
    await prisma.user.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
  });

  it("should correctly calculate composite score formula", () => {
    const diagnosticJson = JSON.stringify({
      strengthMap: {
        "algo": 80,
        "os": 90,
        "dbms": 70
      }
    });

    // 3 subjects total in strengthMap, sum = 240, avg = 80
    // composite = (80 * 0.4) + (50 * 0.6) = 32 + 30 = 62
    const result = PeerBenchmarkingService.calculateCompositeScore(50, diagnosticJson, 3);
    expect(result.score).toBe(62);
    expect(result.isCalibrated).toBe(true);
  });

  it("should handle uncalibrated users with 0 diagnostic score", () => {
    const result = PeerBenchmarkingService.calculateCompositeScore(50, null, 12);
    expect(result.score).toBe(30); // 0 * 0.4 + 50 * 0.6 = 30
    expect(result.isCalibrated).toBe(false);
  });

  it("should calculate rank and percentile accurately against peer distribution", async () => {
    const subject = await prisma.subject.create({
      data: { name: "Algorithms", slug: "algo" }
    });

    const topic1 = await prisma.topic.create({
      data: { name: "Sorting", slug: "sorting", subjectId: subject.id }
    });

    const user1 = await prisma.user.create({
      data: {
        id: "user-1",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { "algo": 90 } })
      }
    });

    const user2 = await prisma.user.create({
      data: {
        id: "user-2",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { "algo": 40 } })
      }
    });

    await prisma.userProgress.create({
      data: { userId: user1.id, topicId: topic1.id, coverageScore: 1.0 }
    });

    await prisma.userProgress.create({
      data: { userId: user2.id, topicId: topic1.id, coverageScore: 0.2 }
    });

    const benchmark1 = await PeerBenchmarkingService.getBenchmark("user-1", 100, user1.diagnosticResult as string);
    expect(benchmark1.userScore).toBe(96); // 90*0.4 + 100*0.6 = 36 + 60 = 96
    expect(benchmark1.estimatedRank).toBe("Top 100");
    // With rank = 1 out of 2 users: ((2 - 1) / 2) * 100 = 50
    expect(benchmark1.percentile).toBe(50);

    // Clear cache to recalculate with fresh data
    PeerBenchmarkingService._clearCache();

    const benchmark2 = await PeerBenchmarkingService.getBenchmark("user-2", 20, user2.diagnosticResult as string);
    expect(benchmark2.userScore).toBe(28); // 40*0.4 + 20*0.6 = 16 + 12 = 28
    expect(benchmark2.estimatedRank).toBe("Top 10000");
    // With rank = 2 out of 2 users: ((2 - 2) / 2) * 100 = 0 -> clamped to 1
    expect(benchmark2.percentile).toBe(1);
  });

  it("should utilize 10-minute in-memory cache and allow _clearCache", async () => {
    const user1 = await prisma.user.create({
      data: {
        id: "cached-user",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { "algo": 50 } })
      }
    });

    const benchmark1 = await PeerBenchmarkingService.getBenchmark(user1.id, 50, user1.diagnosticResult as string);
    expect(benchmark1.totalOnboardedPeers).toBe(1);

    // Create another user without clearing cache
    await prisma.user.create({
      data: {
        id: "uncached-user",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { "algo": 80 } })
      }
    });

    const benchmark2 = await PeerBenchmarkingService.getBenchmark(user1.id, 50, user1.diagnosticResult as string);
    // Peer count remains 1 from cache
    expect(benchmark2.totalOnboardedPeers).toBe(1);

    // Explicitly clear cache
    PeerBenchmarkingService._clearCache();

    const benchmark3 = await PeerBenchmarkingService.getBenchmark(user1.id, 50, user1.diagnosticResult as string);
    // Peer count updates to 2 after cache clear
    expect(benchmark3.totalOnboardedPeers).toBe(2);
  });
});
