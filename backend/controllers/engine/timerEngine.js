// // engine/timerEngine.js
// // SIMPLE VERSION (NO REDIS)
// // For development only

// import EventEmitter from "events";

// const emitter = new EventEmitter();
// const timers = {}; // store setTimeout references

// // Schedule an expiry
// function schedule(timestampMs, payload) {
//   console.log("[timerEngine] Scheduled:", payload);

//   const now = Date.now();
//   const delay = Math.max(0, timestampMs - now);

//   const id = setTimeout(() => {
//     emitter.emit("tick", payload);
//   }, delay);

//   timers[payload.tradeId] = id;
//   return true;
// }

// // Cancel a scheduled expiry
// function cancel(payload) {
//   const id = timers[payload.tradeId];
//   if (id) {
//     clearTimeout(id);
//     delete timers[payload.tradeId];
//     console.log("[timerEngine] Cancelled:", payload);
//   }
// }

// function start() {
//   console.log("[timerEngine] SIMPLE TIMER ENGINE RUNNING (NO REDIS)");
// }

// function stop() {
//   Object.values(timers).forEach(clearTimeout);
//   console.log("[timerEngine] STOPPED");
// }

// function onTick(fn) {
//   emitter.on("tick", fn);
// }

// export default {
//   schedule,
//   cancel,
//   start,
//   stop,
//   onTick
// };









// engine/timerEngine.js
// Redis sorted-set scheduler (distributed). Emits 'tick' events when items mature.
// API:
//  schedule(timestampMs, payload)  - add job
//  cancel(payload)                - remove job by payload JSON
//  onTick(fn)                     - subscribe to tick events (fn(payload))
//  start() / stop()
//
// Requires: ioredis

import IORedis from "ioredis";
import EventEmitter from "events";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redis = new IORedis(REDIS_URL);
const SCHED_KEY = "trading:scheduler:v1";
const POLL_MS = Number(process.env.TIMER_POLL_MS || 250);
const DRIFT_MS = Number(process.env.TIMER_DRIFT_MS || 1000);
const BATCH = Number(process.env.TIMER_BATCH || 200);

const emitter = new EventEmitter();
let running = false;

async function schedule(timestampMs, payload) {
  // console.log("I am timerEngine(schedule)")
  if (!timestampMs || !payload) throw new Error("timerEngine.schedule requires timestampMs and payload");
  const member = JSON.stringify(payload);
  await redis.zadd(SCHED_KEY, Number(timestampMs), member);
  return true;
}

async function cancel(payload) {
  // console.log("I am timerEngine(cancel)")
  const member = JSON.stringify(payload);
  await redis.zrem(SCHED_KEY, member);
  return true;
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function pollLoop() {
  // console.log("I am timerEngine(pollLoop)")
  while (running) {
    try {
      const now = Date.now() + DRIFT_MS;
      const members = await redis.zrangebyscore(SCHED_KEY, 0, now, "LIMIT", 0, BATCH);
      if (members && members.length) {
        for (const member of members) {
          // attempt to claim by removing; if removed count=1 we claim
          const removed = await redis.zrem(SCHED_KEY, member);
          if (removed) {
            try {
              const payload = JSON.parse(member);
              emitter.emit("tick", payload);
            } catch (err) {
              console.error("[timerEngine] invalid payload JSON", err);
            }
          }
        }
        // continue immediately to catch more items
        continue;
      }
    } catch (err) {
      console.error("[timerEngine] poll error", err?.message || err);
    }
    await sleep(POLL_MS);
  }
}

function start() {
  // console.log("I am timerEngine(start)")
  if (running) return;
  running = true;
  pollLoop().catch(e => console.error("[timerEngine] pollLoop crashed", e));
  console.log("[timerEngine] started");
}

function stop() {
  // console.log("I am timerEngine(stop)")
  running = false;
  // console.log("[timerEngine] stopped");
}

function onTick(fn) { emitter.on("tick", fn); }

export default { schedule, cancel, start, stop, onTick, redis };
