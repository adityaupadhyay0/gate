import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific key.
   * If not exceeded, increments the count.
   *
   * @param userId The ID of the user
   * @param key The feature key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window duration in hours
   */
  static async checkLimit(
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

    // If no record exists or the reset window has passed
    if (!rateLimit || now > rateLimit.resetAt) {
      const resetAt = addHours(now, windowHours);

      const newLimit = await prisma.rateLimit.upsert({
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
        isAllowed: true,
        limit,
        remaining: limit - 1,
        reset: resetAt,
      };
    }

    // Check if limit is exceeded
    if (rateLimit.count >= limit) {
      return {
        isAllowed: false,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt,
      };
    }

    // Increment count
    const updatedLimit = await prisma.rateLimit.update({
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
      remaining: limit - updatedLimit.count,
      reset: rateLimit.resetAt,
    };
  }
}
