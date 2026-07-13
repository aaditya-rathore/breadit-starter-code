import { Redis } from '@upstash/redis'

export const isRedisEnabled = Boolean(
  process.env.REDIS_URL && process.env.REDIS_SECRET
)

export const redis = isRedisEnabled
  ? new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.REDIS_SECRET!,
    })
  : null
