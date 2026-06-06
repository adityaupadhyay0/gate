import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific key
   * and increments the count if they are within the limit.
   *
   * @param userId The ID of the user
   * @param key The rate limit key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window duration in hours
   * @returns RateLimitResult
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number = 20,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    // Find existing rate limit record
    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key
        }
      }
    });

    // If no record exists or it's expired, create/reset it
    if (!rateLimit || now > rateLimit.resetAt) {
      const resetAt = addHours(now, windowHours);

      const newRateLimit = await prisma.rateLimit.upsert({
        where: {
          userId_key: {
            userId,
            key
          }
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt
        },
        update: {
          count: 1,
          resetAt
        }
      });

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        reset: newRateLimit.resetAt
      };
    }

    // Check if limit is exceeded
    if (rateLimit.count >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt
      };
    }

    // Increment count
    const updatedRateLimit = await prisma.rateLimit.update({
      where: {
        userId_key: {
          userId,
          key
        }
      },
      data: {
        count: {
          increment: 1
        }
      }
    });

    return {
      allowed: true,
      limit,
      remaining: limit - updatedRateLimit.count,
      reset: updatedRateLimit.resetAt
    };
  }
}
