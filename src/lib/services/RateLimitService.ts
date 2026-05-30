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
   * Checks and increments the rate limit for a given user and key.
   * @param userId The ID of the user.
   * @param key A unique key for the rate limited feature (e.g., 'ai-explain').
   * @param limit The maximum number of requests allowed in the window.
   * @param windowHours The window duration in hours.
   */
  static async check(
    userId: string,
    key: string,
    limit: number = 20,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Find existing rate limit record
    const record = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key,
        },
      },
    });

    // If no record exists or the window has expired, reset/create it
    if (!record || isAfter(now, record.resetAt)) {
      const resetAt = addHours(now, windowHours);

      const newRecord = await prisma.rateLimit.upsert({
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
        success: true,
        limit,
        remaining: limit - 1,
        reset: newRecord.resetAt,
      };
    }

    // If limit reached
    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: record.resetAt,
      };
    }

    // Increment existing record
    const updatedRecord = await prisma.rateLimit.update({
      where: {
        id: record.id,
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
      remaining: Math.max(0, limit - updatedRecord.count),
      reset: updatedRecord.resetAt,
    };
  }
}
