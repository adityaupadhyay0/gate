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
   * Default: 20 requests per 24 hours.
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number = 20,
    windowHours: number = 24
  ): Promise<RateLimitResult> {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    // If no record exists or the reset time has passed, reset the limit
    if (!rateLimit || now > rateLimit.resetAt) {
      const resetAt = addHours(now, windowHours);

      const newLimit = await prisma.rateLimit.upsert({
        where: {
          userId_key: { userId, key }
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
        isAllowed: true,
        limit,
        remaining: limit - 1,
        reset: resetAt
      };
    }

    // If within window, check if allowed before incrementing
    if (rateLimit.count >= limit) {
      return {
        isAllowed: false,
        limit,
        remaining: 0,
        reset: rateLimit.resetAt
      };
    }

    // Increment count
    const updatedLimit = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        count: { increment: 1 }
      }
    });

    return {
      isAllowed: true,
      limit,
      remaining: limit - updatedLimit.count,
      reset: rateLimit.resetAt
    };
  }

  /**
   * Retrieves current usage without incrementing.
   */
  static async getUsage(userId: string, key: string): Promise<{ count: number; resetAt: Date } | null> {
    return prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      },
      select: {
        count: true,
        resetAt: true
      }
    });
  }
}
