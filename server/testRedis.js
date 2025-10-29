require("dotenv").config();
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => console.log("✅ Redis connected successfully!"));
redis.on("error", (err) => console.error("❌ Redis connection error:", err));

redis.set("test_key", "hello world");
redis.get("test_key", (err, result) => {
  if (err) console.error(err);
  else console.log("Redis test result:", result);
  redis.quit();
});
