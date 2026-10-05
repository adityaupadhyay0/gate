"use server";

import { generate30DaySprint } from "@/lib/engines/ROIEngine";
import { PeerBenchmarkingService } from "@/lib/services/PeerBenchmarkingService";
import { auth } from "@/lib/auth/auth";

export async function getSprintAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return await generate30DaySprint(session.user.id);
}

export async function getPeerBenchmarkAction() {
  const session = await auth();
  const userId = session?.user?.id || "guest";
  return await PeerBenchmarkingService.getUserBenchmark(userId);
}
