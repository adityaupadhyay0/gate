import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  isLimited: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded a rate limit for a specific key.
   *
   * @param userId - The ID of the user.
   * @param key - The rate limit key (e.g., 'ai_explain').
   * @param limit - The maximum number of requests allowed in the window.
   * @param windowHours - The duration of the rate limit window in hours.
   * @returns A RateLimitResult object.
   */
  static async checkRateLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ): Promise<RateLimitResult> {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    if (!rateLimit || now > rateLimit.resetAt) {
      // Create or reset the rate limit
      const resetAt = addHours(now, windowHours);
      const updated = await prisma.rateLimit.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt,
        },
        update: {
          count: 1,
          resetAt,
        },
      });

      return {
        isLimited: false,
        limit,
        remaining: limit - 1,
        resetAt: updated.resetAt,
      };
    }

    if (rateLimit.count >= limit) {
      return {
        isLimited: true,
        limit,
        remaining: 0,
        resetAt: rateLimit.resetAt,
      };
    }

    // Increment the count
    const updated = await prisma.rateLimit.update({
      where: {
        id: rateLimit.id,
      },
      data: {
        count: {
          increment: 1,
        },
      },
    });

    return {
      isLimited: false,
      limit,
      remaining: limit - updated.count,
      resetAt: updated.resetAt,
    };
  }
}
