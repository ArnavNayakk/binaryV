import redis from "redis";

const redisClient = redis.createClient();

redisClient.connect()
  .then(() => console.log("Redis Connected"))
  .catch(err => console.log("Redis Error:", err));

export default redisClient;
