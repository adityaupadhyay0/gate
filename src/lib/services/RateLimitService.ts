import prisma from "@/lib/db/prisma";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  totalLimit: number;
}

export class RateLimitService {
  /**
   * Checks whether the request for the given identifier is within rate limits.
   * Uses a sliding/fixed window algorithm backed by Prisma.
   *
   * @param identifier Unique identifier (e.g. `ai_explain:${userId}` or IP)
   * @param limit Max requests allowed per window (default: 10)
   * @param windowInSeconds Window duration in seconds (default: 600 = 10 mins)
   */
  static async check(
    identifier: string,
    limit: number = 10,
    windowInSeconds: number = 600
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowMs = windowInSeconds * 1000;

    const existing = await prisma.rateLimit.findUnique({
      where: { identifier },
    });

    if (!existing) {
      await prisma.rateLimit.create({
        data: {
          identifier,
          requestCount: 1,
          windowStart: now,
        },
      });

      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetInSeconds: windowInSeconds,
        totalLimit: limit,
      };
    }

    const elapsedMs = now.getTime() - existing.windowStart.getTime();

    if (elapsedMs >= windowMs) {
      // Window expired, reset window
      await prisma.rateLimit.update({
        where: { identifier },
        data: {
          requestCount: 1,
          windowStart: now,
        },
      });

      return {
        allowed: true,
        remaining: Math.max(0, limit - 1),
        resetInSeconds: windowInSeconds,
        totalLimit: limit,
      };
    }

    // Still within current window
    const resetInSeconds = Math.max(
      1,
      Math.ceil((windowMs - elapsedMs) / 1000)
    );

    if (existing.requestCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetInSeconds,
        totalLimit: limit,
      };
    }

    const updated = await prisma.rateLimit.update({
      where: { identifier },
      data: {
        requestCount: { increment: 1 },
      },
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.requestCount),
      resetInSeconds,
      totalLimit: limit,
    };
  }

  /**
   * Formats rate limit headers for HTTP responses (e.g. Next.js NextResponse)
   */
  static getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": result.totalLimit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": (
        Math.floor(Date.now() / 1000) + result.resetInSeconds
      ).toString(),
    };

    if (!result.allowed) {
      headers["Retry-After"] = result.resetInSeconds.toString();
    }

    return headers;
  }
}
