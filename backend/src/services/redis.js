import IORedis from 'ioredis';
import config from '../config/index.js';

// Use REDIS_URL env or fall back to config.redisUrl if set
const redisUrl = process.env.REDIS_URL || config.redisUrl || 'redis://localhost:6379';
const redis = new IORedis(redisUrl);

redis.on('error', (err) => {
  console.warn('Redis connection error', err && err.message ? err.message : err);
});
redis.on('connect', () => {
  console.info('Redis connected');
});

export async function getJson(key) {
  const v = await redis.get(key);
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch (e) {
    // If parsing fails, return raw value
    return v;
  }
}

export async function setJson(key, obj, ttlSeconds = 300) {
  const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
  if (ttlSeconds && Number(ttlSeconds) > 0) {
    await redis.set(key, s, 'EX', Number(ttlSeconds));
  } else {
    await redis.set(key, s);
  }
}

export async function delKey(...keys) {
  if (!keys || keys.length === 0) return 0;
  return redis.del(...keys);
}

export async function delByPattern(pattern) {
  // scan and delete matching keys
  return new Promise((resolve, reject) => {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const keys = [];
    stream.on('data', (resultKeys) => {
      if (resultKeys.length) keys.push(...resultKeys);
    });
    stream.on('end', async () => {
      if (keys.length) {
        try {
          await redis.del(...keys);
          resolve(keys.length);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(0);
      }
    });
    stream.on('error', reject);
  });
}

// Simple counters for instrumentation (e.g., cache hits/misses)
export async function incrCounter(name) {
  try {
    return await redis.incr(name);
  } catch (err) {
    console.warn('Failed to incr redis counter', name, err && err.message ? err.message : err);
    return null;
  }
}

export async function getCounter(name) {
  try {
    const v = await redis.get(name);
    return v ? Number(v) : 0;
  } catch (err) {
    console.warn('Failed to get redis counter', name, err && err.message ? err.message : err);
    return 0;
  }
}

export default redis;