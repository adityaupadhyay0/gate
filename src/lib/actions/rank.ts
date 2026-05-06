"use server";

import { generate30DaySprint } from "@/lib/engines/ROIEngine";
import { auth } from "@/lib/auth/auth";

export async function getSprintAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return await generate30DaySprint(session.user.id);
}
