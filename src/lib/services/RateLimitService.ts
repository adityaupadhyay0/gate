import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitStatus {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks and increments the rate limit for a specific user and key.
   * @param userId The user's ID
   * @param key The feature key (e.g., 'ai_explain')
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window duration in hours
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<RateLimitStatus> {
    const now = new Date();

    // Find or create the rate limit record
    let rateLimit = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    // If no record exists or the window has expired, reset it
    if (!rateLimit || now > rateLimit.resetAt) {
      const resetAt = addHours(now, windowHours);

      rateLimit = await prisma.rateLimit.upsert({
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
    } else {
      // Increment the existing record
      rateLimit = await prisma.rateLimit.update({
        where: {
          userId_key: { userId, key }
        },
        data: {
          count: { increment: 1 }
        }
      });
    }

    const allowed = rateLimit.count <= limit;
    const remaining = Math.max(0, limit - rateLimit.count);

    return {
      allowed,
      count: rateLimit.count,
      limit,
      remaining,
      resetAt: rateLimit.resetAt
    };
  }
}
