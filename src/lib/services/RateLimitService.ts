import prisma from "@/lib/db/prisma";

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

export class RateLimitService {
  /**
   * Checks and enforces rate limiting for a given key.
   * Uses a database-backed window tracking mechanism.
   */
  static async checkRateLimit({
    key,
    limit,
    windowMs
  }: RateLimitOptions): Promise<RateLimitResult> {
    const now = new Date();

    // Find active rate limit record for key where current time < expiresAt
    const existing = await prisma.rateLimit.findFirst({
      where: {
        key,
        expiresAt: {
          gt: now
        }
      }
    });

    if (!existing) {
      // Clean up old expired entries for this key (housekeeping)
      await prisma.rateLimit.deleteMany({
        where: {
          key,
          expiresAt: {
            lte: now
          }
        }
      });

      // Create new window
      const expiresAt = new Date(now.getTime() + windowMs);
      await prisma.rateLimit.create({
        data: {
          key,
          count: 1,
          windowStart: now,
          expiresAt
        }
      });

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetInSeconds: Math.ceil(windowMs / 1000)
      };
    }

    // Active window exists
    const resetInSeconds = Math.max(
      1,
      Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)
    );

    if (existing.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        resetInSeconds
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: {
        id: existing.id
      },
      data: {
        count: {
          increment: 1
        }
      }
    });

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - updated.count),
      resetInSeconds
    };
  }
}
