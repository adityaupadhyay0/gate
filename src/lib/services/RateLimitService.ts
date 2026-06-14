import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific key.
   * If not exceeded, increments the count.
   *
   * @param userId The ID of the user
   * @param key The unique key for the rate limit (e.g., 'ai_explain')
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

    // Find existing rate limit record
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    // If no record exists or the reset window has passed, reset the limit
    if (!rateLimit || isAfter(now, rateLimit.resetAt)) {
      const resetAt = addHours(now, windowHours);

      const newRateLimit = await prisma.rateLimit.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: {
          count: 1,
          resetAt,
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt,
        },
      });

      return {
        isAllowed: true,
        limit,
        remaining: limit - 1,
        resetAt: newRateLimit.resetAt,
      };
    }

    // Check if limit is reached
    if (rateLimit.count >= limit) {
      return {
        isAllowed: false,
        limit,
        remaining: 0,
        resetAt: rateLimit.resetAt,
      };
    }

    // Increment existing count
    const updatedRateLimit = await prisma.rateLimit.update({
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
      isAllowed: true,
      limit,
      remaining: limit - updatedRateLimit.count,
      resetAt: updatedRateLimit.resetAt,
    };
  }
}
