import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis | null = null
const limiters: Record<string, Ratelimit> = {}

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return redis
}

function getLimiter(id: string, requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`): Ratelimit {
  if (!limiters[id]) {
    limiters[id] = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix: `rl:${id}`,
    })
  }
  return limiters[id]
}

/**
 * Returns true = allowed, false = rate-limited.
 * failOpen: if true, allows when Upstash is unreachable (default false = fail-closed).
 */
export async function checkRateLimit(
  id: string,
  identifier: string,
  requests: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`,
  failOpen = false,
): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return failOpen
  }
  try {
    const { success } = await getLimiter(id, requests, window).limit(identifier)
    return success
  } catch {
    return failOpen
  }
}
