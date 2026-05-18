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
  const rating = data.confidenceLevel || (data.isCorrect ? 3 : 1);
  const { RevisionEngine } = await import("@/lib/engines/RevisionEngine");
  const attempt = await RevisionEngine.updateFSRS(
    session.user.id,
    data.pyqId,
    rating as any,
    data.timeSpent
  );

  // Update coverage and topic status
  await CompletionEngine.check(session.user.id, attempt.pyq.topicId);

  // Trigger FSRS weight optimization periodically (e.g., every 50 attempts)
  const attemptCount = await prisma.attempt.count({ where: { userId: session.user.id } });
  if (attemptCount >= 50 && attemptCount % 50 === 0) {
    const { WeightOptimizationService } = await import("@/lib/services/WeightOptimizationService");
    // Run in background (not awaiting to avoid blocking response)
    WeightOptimizationService.optimizeForUser(session.user.id).catch(console.error);
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
