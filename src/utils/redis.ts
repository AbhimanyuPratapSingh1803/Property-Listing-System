import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URI,
});

redisClient.on("error", (err) => {
  console.error("Redis error: ", err);
});

redisClient.on("ready", () => {
  console.log("Redis started.");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    await redisClient.ping();
    console.log("Connected to Redis successfully");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};

export { connectRedis, redisClient };
