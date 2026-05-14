"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { CompletionEngine } from "@/lib/engines/CompletionEngine";

export async function saveAttempt(data: {
  pyqId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  confidenceLevel?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Calculate Personal Difficulty
  let personalDifficulty = 0.5;
  if (data.isCorrect) {
    personalDifficulty = data.timeSpent > 120 ? 0.6 : 0.3;
  } else {
    personalDifficulty = 0.8;
  }

  // Use FSRS to update memory state
  const rating = data.isCorrect ? (data.confidenceLevel! >= 4 ? 4 : 3) : 1;
  const { RevisionEngine } = await import("@/lib/engines/RevisionEngine");
  const attempt = await RevisionEngine.updateFSRS(
    session.user.id,
    data.pyqId,
    rating as any,
    data.timeSpent
  );

  // Update coverage and topic status
  await CompletionEngine.check(session.user.id, attempt.pyq.topicId);

  // Background Optimization Check (Throttled to every 50 attempts)
  // We don't await this to keep the UI snappy
  const attemptCount = await prisma.attempt.count({ where: { userId: session.user.id } });
  if (attemptCount >= 50 && attemptCount % 50 === 0) {
    const { WeightOptimizationService } = await import("@/lib/services/WeightOptimizationService");
    WeightOptimizationService.optimize(session.user.id).catch(err => {
      console.error("FSRS Optimization failed:", err);
    });
  }

  return attempt;
}

export async function logMistake(data: {
  pyqId: string;
  mistakeType: string;
  confidenceBefore: number;
  timeSpent: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.mistakeLog.create({
    data: {
      userId: session.user.id,
      pyqId: data.pyqId,
      mistakeType: data.mistakeType,
      confidenceBefore: data.confidenceBefore,
      timeSpent: data.timeSpent
    }
  });
}
