import prisma from "@/lib/db/prisma";
import { addHours } from "date-fns";

export interface RateLimitStatus {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  /**
   * Checks and increments the rate limit for a specific user and key.
   * @param userId The ID of the user
   * @param key The unique key for the feature (e.g., "ai-explain")
   * @param limit The maximum number of requests allowed in the window
   * @param windowHours The window size in hours
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number = 24
  ): Promise<RateLimitStatus> {
    const now = new Date();

    // Find current rate limit record
    const record = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key }
      }
    });

    // If record exists and window has expired, reset it via upsert
    if (record && now > record.resetAt) {
      const resetRecord = await prisma.rateLimit.update({
        where: { id: record.id },
        data: {
          count: 1, // Start at 1 for the current request
          resetAt: addHours(now, windowHours)
        }
      });

      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetAt: resetRecord.resetAt
      };
    }

    // Use upsert for atomic handling of creation/increment
    const finalRecord = await prisma.rateLimit.upsert({
      where: {
        userId_key: { userId, key }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        userId,
        key,
        count: 1,
        resetAt: addHours(now, windowHours)
      }
    });

    const isAllowed = finalRecord.count <= limit;

    return {
      allowed: isAllowed,
      limit,
      remaining: Math.max(0, limit - finalRecord.count),
      resetAt: finalRecord.resetAt
    };
  }
}
