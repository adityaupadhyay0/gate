import prisma from "@/lib/db/prisma";

export interface RateLimitOptions {
  action: string;
  identifier: string;
  maxRequests?: number;
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
  headers: Record<string, string>;
}

export class RateLimitService {
  /**
   * Checks if a request is allowed under the rate limit window.
   */
  static async checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
    const {
      action,
      identifier,
      maxRequests = 10,
      windowMs = 10 * 60 * 1000 // Default 10 minutes
    } = options;

    const key = `${action}:${identifier}`;
    const now = new Date();

    const record = await prisma.rateLimit.findUnique({
      where: { key }
    });

    let limit = maxRequests;
    let remaining = 0;
    let resetAt = new Date(now.getTime() + windowMs);
    let allowed = true;
    let retryAfterSeconds = 0;

    if (!record || record.expiresAt <= now) {
      // Window expired or new entry -> reset count
      resetAt = new Date(now.getTime() + windowMs);
      remaining = Math.max(0, limit - 1);
      allowed = true;

      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          expiresAt: resetAt
        },
        update: {
          count: 1,
          expiresAt: resetAt
        }
      });
    } else if (record.count >= limit) {
      // Quota exceeded
      allowed = false;
      remaining = 0;
      resetAt = record.expiresAt;
      retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000));
    } else {
      // Within limit -> increment count
      const updated = await prisma.rateLimit.update({
        where: { key },
        data: {
          count: { increment: 1 }
        }
      });
      allowed = true;
      remaining = Math.max(0, limit - updated.count);
      resetAt = record.expiresAt;
    }

    const headers: Record<string, string> = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(resetAt.getTime() / 1000).toString()
    };

    if (!allowed) {
      headers["Retry-After"] = retryAfterSeconds.toString();
    }

    return {
      allowed,
      limit,
      remaining,
      resetAt,
      retryAfterSeconds,
      headers
    };
  }

  /**
   * Resets the rate limit record for a given action and identifier. Useful for testing or admin overrides.
   */
  static async resetRateLimit(action: string, identifier: string): Promise<void> {
    const key = `${action}:${identifier}`;
    await prisma.rateLimit.deleteMany({
      where: { key }
    });
  }
}
