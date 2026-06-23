import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export class RateLimitService {
  /**
   * Checks if a user has exceeded their rate limit for a specific key.
   * If not, it increments the count and returns the current status.
   *
   * @param userId The ID of the user to check
   * @param key The rate limit key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The rolling window size in hours
   * @returns An object containing whether the request is allowed, remaining requests, and reset time
   */
  static async checkAndIncrement(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ) {
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

    // If no record exists or the reset window has passed, start a new window
    if (!rateLimit || isAfter(now, rateLimit.resetAt)) {
      const resetAt = addHours(now, windowHours);

      const newLimit = await prisma.rateLimit.upsert({
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
        remaining: limit - 1,
        resetAt: newLimit.resetAt
      };
    }

    // If the limit has been reached
    if (rateLimit.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: rateLimit.resetAt
      };
    }

    // Otherwise, increment the count
    const updatedLimit = await prisma.rateLimit.update({
      where: {
        id: rateLimit.id
      },
      data: {
        count: {
          increment: 1
        }
      }
    });

    return {
      allowed: true,
      remaining: limit - updatedLimit.count,
      resetAt: updatedLimit.resetAt
    };
  }
}
