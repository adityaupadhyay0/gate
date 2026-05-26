import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded the rate limit for a given key.
   *
   * @param userId The ID of the user
   * @param key The specific feature key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed within the window
   * @param windowHours The rolling window size in hours
   */
  static async checkRateLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
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

    // If no record exists or the reset window has passed, create/reset it
    if (!rateLimit || isAfter(now, rateLimit.resetAt)) {
      const resetAt = addHours(now, windowHours);

      const updated = await prisma.rateLimit.upsert({
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
        success: true,
        limit,
        remaining: limit - 1,
        reset: updated.resetAt,
      };
    }

    // If we are within the window, check the count
    if (rateLimit.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt,
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
      success: true,
      limit,
      remaining: limit - updated.count,
      reset: updated.resetAt,
    };
  }
}
