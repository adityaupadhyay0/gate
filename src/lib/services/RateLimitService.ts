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
   * Checks if a user has exceeded the rate limit for a specific feature.
   * @param userId The ID of the user.
   * @param key The feature key (e.g., 'ai-explain').
   * @param limit The maximum number of requests allowed in the window.
   * @param windowHours The window size in hours.
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
        userId_key: { userId, key },
      },
    });

    // If no record exists or the window has expired, reset it
    if (!rateLimit || now > rateLimit.resetAt) {
      const resetAt = addHours(now, windowHours);

      const newRecord = await prisma.rateLimit.upsert({
        where: {
          userId_key: { userId, key },
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
        success: true,
        limit,
        remaining: limit - 1,
        reset: newRecord.resetAt,
      };
    }

    // If within window, check count
    if (rateLimit.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt,
      };
    }

    // Increment count
    const updatedRecord = await prisma.rateLimit.update({
      where: {
        userId_key: { userId, key },
      },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      success: true,
      limit,
      remaining: limit - updatedRecord.count,
      reset: updatedRecord.resetAt,
    };
  }
}
