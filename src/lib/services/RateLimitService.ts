import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  isLimited: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks and increments the rate limit for a specific user and key.
   * @param userId The ID of the user.
   * @param key The feature key (e.g., 'ai-explain').
   * @param limit The maximum number of requests allowed in the window.
   * @param windowHours The window size in hours (default 24).
   */
  static async getRateLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
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

    if (!rateLimit || isAfter(now, rateLimit.resetAt)) {
      // Create or reset the rate limit window
      const resetAt = addHours(now, windowHours);

      const newRateLimit = await prisma.rateLimit.upsert({
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
        reset: resetAt,
      };
    }

    if (rateLimit.count >= limit) {
      return {
        isLimited: true,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt,
      };
    }

    // Increment existing window
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
      isLimited: false,
      limit,
      remaining: limit - updatedRateLimit.count,
      reset: rateLimit.resetAt,
    };
  }
}
