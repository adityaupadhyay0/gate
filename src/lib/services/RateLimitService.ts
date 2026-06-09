import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  isLimited: boolean;
  remaining: number;
  limit: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a given key.
   * Increments the count if not limited.
   *
   * @param userId The ID of the user
   * @param key The feature key (e.g., 'ai_explain')
   * @param limit Maximum requests allowed in the window
   * @param windowHours The window duration in hours
   */
  static async checkRateLimit(
    userId: string,
    key: string,
    limit: number = 20,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.upsert({
      where: {
        userId_key: {
          userId,
          key
        }
      },
      update: {},
      create: {
        userId,
        key,
        count: 0,
        resetAt: addHours(now, windowHours)
      }
    });

    // If window has expired, reset it
    if (now > rateLimit.resetAt) {
      const updated = await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          resetAt: addHours(now, windowHours)
        }
      });

      return {
        isLimited: false,
        remaining: limit - 1,
        limit,
        reset: updated.resetAt
      };
    }

    // If limit reached
    if (rateLimit.count >= limit) {
      return {
        isLimited: true,
        remaining: 0,
        limit,
        reset: rateLimit.resetAt
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        count: {
          increment: 1
        }
      }
    });

    return {
      isLimited: false,
      remaining: limit - updated.count,
      limit,
      reset: updated.resetAt
    };
  }
}
