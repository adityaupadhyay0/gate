import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a given key.
   * If the limit window has passed, it resets the count.
   *
   * @param userId The ID of the user
   * @param key The rate limit key (e.g., 'ai-explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window size in hours
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ): Promise<RateLimitResult> {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.upsert({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      update: {},
      create: {
        userId,
        key,
        count: 0,
        resetAt: addHours(now, windowHours),
      },
    });

    // If resetAt is in the past, reset the count and new resetAt
    if (rateLimit.resetAt < now) {
      const updated = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 0,
          resetAt: addHours(now, windowHours),
        },
      });
      return {
        allowed: true,
        remaining: limit,
        limit,
        reset: updated.resetAt,
      };
    }

    const remaining = Math.max(0, limit - rateLimit.count);

    return {
      allowed: rateLimit.count < limit,
      remaining,
      limit,
      reset: rateLimit.resetAt,
    };
  }

  /**
   * Increments the usage count for a user.
   */
  static async increment(userId: string, key: string) {
    await prisma.rateLimit.update({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });
  }
}
