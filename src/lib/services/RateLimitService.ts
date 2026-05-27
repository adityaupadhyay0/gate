import prisma from "@/lib/db/prisma";
import { addHours, isAfter } from "date-fns";

export class RateLimitService {
  /**
   * Checks if a user has exceeded a rate limit for a specific key.
   * If not exceeded, increments the count.
   * @param userId - The ID of the user.
   * @param key - The unique key for the rate limit (e.g., 'ai_explain').
   * @param limit - The maximum number of requests allowed within the window.
   * @param windowHours - The duration of the window in hours.
   * @returns An object containing the current count, limit, and reset time.
   */
  static async checkLimit(
    userId: string,
    key: string,
    limit: number,
    windowHours: number
  ) {
    const now = new Date();

    // Find existing rate limit record
    let record = await prisma.rateLimit.findUnique({
      where: {
        userId_key: { userId, key },
      },
    });

    // If no record exists or the window has expired, reset/create it
    if (!record || isAfter(now, record.resetAt)) {
      record = await prisma.rateLimit.upsert({
        where: {
          userId_key: { userId, key },
        },
        create: {
          userId,
          key,
          count: 1,
          resetAt: addHours(now, windowHours),
        },
        update: {
          count: 1,
          resetAt: addHours(now, windowHours),
        },
      });
    } else {
      // Within window, increment count if under limit
      // (or even if over, so we track attempted usage, but the caller handles blocking)
      record = await prisma.rateLimit.update({
        where: { id: record.id },
        data: {
          count: {
            increment: 1,
          },
        },
      });
    }

    return {
      count: record.count,
      limit,
      remaining: Math.max(0, limit - record.count),
      resetAt: record.resetAt,
    };
  }
}
