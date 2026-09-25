import { describe, it, expect, beforeEach } from "vitest";
import { PeerBenchmarkingService } from "../PeerBenchmarkingService";
import prisma from "@/lib/db/prisma";

describe("PeerBenchmarkingService", () => {
  beforeEach(async () => {
    PeerBenchmarkingService._clearCache();
    await prisma.userProgress.deleteMany();
    await prisma.attempt.deleteMany();
    await prisma.user.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
  });

  it("should return uncalibrated result when user does not exist", async () => {
    const res = await PeerBenchmarkingService.getPeerBenchmarking("non-existent");
    expect(res.isCalibrated).toBe(false);
    expect(res.label).toBe("Uncalibrated");
    expect(res.rank).toBe(0);
  });

  it("should return uncalibrated result when user has no diagnostic result", async () => {
    const user = await prisma.user.create({
      data: {
        id: "user1",
        email: "user1@example.com",
        onboardingComplete: true
      }
    });

    const res = await PeerBenchmarkingService.getPeerBenchmarking(user.id);
    expect(res.isCalibrated).toBe(false);
    expect(res.estimatedRankLabel).toBe("Not Calibrated");
  });

  it("should calculate correct percentile and rank for multiple onboarded users", async () => {
    // Setup subject & topics
    const subject = await prisma.subject.create({
      data: { name: "Computer Science", slug: "cs" }
    });
    const topic1 = await prisma.topic.create({
      data: { name: "Algo", slug: "algo", subjectId: subject.id }
    });

    // User 1: High score (diag avg = 90)
    const user1 = await prisma.user.create({
      data: {
        id: "u1",
        email: "u1@example.com",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({
          strengthMap: { Algo: 90, OS: 90 }
        })
      }
    });

    // User 2: Medium score (diag avg = 50)
    const user2 = await prisma.user.create({
      data: {
        id: "u2",
        email: "u2@example.com",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({
          strengthMap: { Algo: 50, OS: 50 }
        })
      }
    });

    // User 3: Low score (diag avg = 20)
    const user3 = await prisma.user.create({
      data: {
        id: "u3",
        email: "u3@example.com",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({
          strengthMap: { Algo: 20, OS: 20 }
        })
      }
    });

    // Check user1 (highest)
    const res1 = await PeerBenchmarkingService.getPeerBenchmarking(user1.id);
    expect(res1.isCalibrated).toBe(true);
    expect(res1.rank).toBe(1);
    expect(res1.totalUsers).toBe(3);
    expect(res1.label).toBe("Top 33%");

    // Check user3 (lowest)
    const res3 = await PeerBenchmarkingService.getPeerBenchmarking(user3.id);
    expect(res3.rank).toBe(3);
    expect(res3.totalUsers).toBe(3);
    expect(res3.percentile).toBe(1);
  });

  it("should respect cache for rapid subsequent requests", async () => {
    const user1 = await prisma.user.create({
      data: {
        id: "u1",
        email: "u1@example.com",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { Algo: 80 } })
      }
    });

    const res1 = await PeerBenchmarkingService.getPeerBenchmarking(user1.id);
    expect(res1.totalUsers).toBe(1);

    // Create a new user in database without clearing cache
    await prisma.user.create({
      data: {
        id: "u2",
        email: "u2@example.com",
        onboardingComplete: true,
        diagnosticResult: JSON.stringify({ strengthMap: { Algo: 90 } })
      }
    });

    // Cached call should still report 1 user
    const resCached = await PeerBenchmarkingService.getPeerBenchmarking(user1.id);
    expect(resCached.totalUsers).toBe(1);

    // After clearing cache, should report 2 users
    PeerBenchmarkingService._clearCache();
    const resFresh = await PeerBenchmarkingService.getPeerBenchmarking(user1.id);
    expect(resFresh.totalUsers).toBe(2);
  });
});
