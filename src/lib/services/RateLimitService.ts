import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitStatus {
  isLimited: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks and increments the rate limit for a user and a specific key.
   * Uses a window-based approach.
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<RateLimitStatus> {
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

    // If window expired, reset
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
        limit,
        remaining: limit - 1,
        resetAt: updated.resetAt
      };
    }

    // If already limited, don't increment
    if (rateLimit.count >= limit) {
      return {
        isLimited: true,
        limit,
        remaining: 0,
        resetAt: rateLimit.resetAt
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { id: rateLimit.id },
      data: {
        count: { increment: 1 }
      }
    });

    return {
      isLimited: false,
      limit,
      remaining: limit - updated.count,
      resetAt: updated.resetAt
    };
  }
}
