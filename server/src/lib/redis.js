import Redis from "ioredis";

let redisClient = null;

export function getRedisClient() {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // don't retry endlessly if Redis is offline
      });

      redisClient.on("error", (err) => {
        console.warn("[Redis Warning] Connection error:", err.message);
      });
    } catch (err) {
      console.warn("[Redis Warning] Could not initialize Redis:", err.message);
    }
  }

  return redisClient;
}

export async function getCache(key) {
  try {
    const client = getRedisClient();
    if (!client) return null;
    if (client.status !== "ready") {
      await client.connect().catch(() => {});
    }
    if (client.status === "ready") {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (err) {
    console.warn(`[Redis Cache Miss/Error] for key ${key}:`, err.message);
  }
  return null;
}

export async function setCache(key, data, ttlSeconds = 300) {
  try {
    const client = getRedisClient();
    if (!client) return;
    if (client.status !== "ready") {
      await client.connect().catch(() => {});
    }
    if (client.status === "ready") {
      await client.setex(key, ttlSeconds, JSON.stringify(data));
    }
  } catch (err) {
    console.warn(`[Redis Set Cache Error] for key ${key}:`, err.message);
  }
}

export async function clearCachePattern(pattern) {
  try {
    const client = getRedisClient();
    if (!client) return;
    if (client.status !== "ready") {
      await client.connect().catch(() => {});
    }
    if (client.status === "ready") {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    }
  } catch (err) {
    console.warn(`[Redis Clear Cache Error] for pattern ${pattern}:`, err.message);
  }
}
