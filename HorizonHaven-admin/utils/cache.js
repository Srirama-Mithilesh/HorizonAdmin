import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

redis.on('error', (err) => {
  console.warn('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

const DEFAULT_TTL = 300;

export const cacheGet = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Cache get error for key ${key}:`, error.message);
    return null;
  }
};

export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.warn(`Cache set error for key ${key}:`, error.message);
  }
};

export const cacheDelete = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.warn(`Cache delete error for key ${key}:`, error.message);
  }
};

export const cacheDeletePattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn(`Cache delete pattern error for pattern ${pattern}:`, error.message);
  }
};

export default redis;
