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

  const attempt = await prisma.attempt.create({
    data: {
      userId: session.user.id,
      pyqId: data.pyqId,
      userAnswer: data.userAnswer,
      isCorrect: data.isCorrect,
      timeSpent: data.timeSpent,
      memoryScore: data.isCorrect ? 1.0 : 0.5,
      confidenceLevel: data.confidenceLevel,
      personalDifficulty
    },
    include: { pyq: true }
  });

  // Update coverage and topic status
  await CompletionEngine.check(session.user.id, attempt.pyq.topicId);

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
