import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific feature.
   * Increments the count if within limits.
   *
   * @param userId The ID of the user
   * @param key The feature key (e.g., 'ai-explain')
   * @param limit The maximum number of allowed requests
   * @param windowHours The rolling window in hours
   */
  static async checkLimit(
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

    if (!rateLimit || now > rateLimit.resetAt) {
      // Reset the window
      const newResetAt = addHours(now, windowHours);
      const updated = await prisma.rateLimit.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: {
          count: 1,
          resetAt: newResetAt,
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt: newResetAt,
        },
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: updated.resetAt,
      };
    }

    if (rateLimit.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt,
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
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

    return {
      success: true,
      limit,
      remaining: limit - updated.count,
      reset: updated.resetAt,
    };
  }
}
