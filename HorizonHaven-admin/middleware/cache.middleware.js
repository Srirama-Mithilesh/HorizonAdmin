// middleware/cache.middleware.js
import redisClient from "../config/redis.js";

export function cache(keyPrefix) {
  return async (req, res, next) => {
    const key = keyPrefix + JSON.stringify(req.params ?? req.query ?? "");

    try {
      const cached = await redisClient.get(key);

      if (cached) {
        console.log("⚡ Redis Cache Hit:", key);
        return res.json(JSON.parse(cached));
      }

      console.log("⏳ Redis Cache Miss:", key);
      res.sendResponse = res.json;

      res.json = async (body) => {
        await redisClient.setEx(key, 3600, JSON.stringify(body)); // cache for 1 hour
        return res.sendResponse(body);
      };

      next();
    } catch (error) {
      console.error("Redis Middleware Error:", error);
      next(); // continue even if Redis is down
    }
  };
}
