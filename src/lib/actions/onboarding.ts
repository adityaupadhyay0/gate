"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { DiagnosticEngine } from "@/lib/engines/DiagnosticEngine";

export async function submitDiagnosticResults(answers: { pyqId: string, isCorrect: boolean }[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await DiagnosticEngine.processResults(session.user.id, answers);
}
