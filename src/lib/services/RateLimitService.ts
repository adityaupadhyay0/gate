import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks and increments usage for a specific user and feature key.
   * Uses a fixed window that resets 'windowHours' after the first request in a new cycle.
   * Implementation note: We use atomic upsert to increment or initialize.
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    // To prevent concurrent bypass, we check and increment in one flow.
    // However, SQLite via Prisma doesn't easily support conditional updates with increments
    // in a single statement that also returns the previous state for limit checking.

    // We fetch first to check if we are in a NEW window.
    const current = await prisma.rateLimit.findUnique({
      where: { userId_key: { userId, key } }
    });

    if (!current || now > current.resetAt) {
      const resetAt = addHours(now, windowHours);
      const updated = await prisma.rateLimit.upsert({
        where: { userId_key: { userId, key } },
        create: { userId, key, count: 1, resetAt },
        update: { count: 1, resetAt }
      });
      return { allowed: true, limit, remaining: limit - 1, reset: updated.resetAt };
    }

    // If within window, we increment but only if it's below limit.
    // To be more robust, we check count before updating.
    if (current.count >= limit) {
      return { allowed: false, limit, remaining: 0, reset: current.resetAt };
    }

    const updated = await prisma.rateLimit.update({
      where: { id: current.id },
      data: { count: { increment: 1 } }
    });

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - updated.count),
      reset: current.resetAt
    };
  }
}
