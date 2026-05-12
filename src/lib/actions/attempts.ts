"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { CompletionEngine } from "@/lib/engines/CompletionEngine";
import { revalidateTag } from "next/cache";

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

  // Update Streak
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentStreak: true, lastAttemptDate: true }
  });

  if (user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = user.lastAttemptDate ? new Date(user.lastAttemptDate) : null;
    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    let newStreak = user.currentStreak;

    if (!lastDate) {
      newStreak = 1;
    } else {
      const diffDays = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentStreak: newStreak,
        lastAttemptDate: new Date()
      }
    });
  }

  // Invalidate cache
  revalidateTag(`user-progress-${session.user.id}`);
  revalidateTag(`user-streak-${session.user.id}`);

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

  const log = await prisma.mistakeLog.create({
    data: {
      userId: session.user.id,
      pyqId: data.pyqId,
      mistakeType: data.mistakeType,
      confidenceBefore: data.confidenceBefore,
      timeSpent: data.timeSpent
    }
  });

  revalidateTag(`user-mistakes-${session.user.id}`);
  return log;
}
