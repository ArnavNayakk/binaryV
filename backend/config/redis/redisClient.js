import Redis from "ioredis";

export const pub = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

export const sub = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

pub.on("connect", () => console.log("Redis Publisher Connected"));
sub.on("connect", () => console.log("Redis Subscriber Connected"));
