import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific key.
   * If not, it increments the count.
   * Returns an object indicating whether they are limited, and the remaining count.
   */
  static async checkAndIncrement(userId: string, key: string, limit: number, windowHours: number = 24) {
    const now = new Date();

    const rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: {
          userId,
          key
        }
      }
    });

    if (!rateLimit) {
      // First time usage
      const resetAt = addHours(now, windowHours);
      await prisma.rateLimit.create({
        data: {
          userId,
          key,
          count: 1,
          resetAt
        }
      });

      return {
        isLimited: false,
        remaining: limit - 1,
        resetAt,
        limit
      };
    }

    // Check if window has expired
    if (now > rateLimit.resetAt) {
      const resetAt = addHours(now, windowHours);
      await prisma.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          count: 1,
          resetAt
        }
      });

      return {
        isLimited: false,
        remaining: limit - 1,
        resetAt,
        limit
      };
    }

    // Window still active, check count
    if (rateLimit.count >= limit) {
      return {
        isLimited: true,
        remaining: 0,
        resetAt: rateLimit.resetAt,
        limit
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
      resetAt: rateLimit.resetAt,
      limit
    };
  }
}
