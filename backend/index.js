import express from "express";
import connectDB from "./config/db/mogoose.db.js";
import "dotenv/config";
import { initSocket } from "./socket.js";

import dotenv from "dotenv";
dotenv.config();
// import { initSocket } from "./socket.js"; // uncomment if socket.js is converted to ESM
import router from "./routers/index.router.js";
import { errorHandler } from "./middleware/errorhandler.middleware.js";
import configureExpress from "./config/express/express.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4000;

configureExpress(app)

// If Mongo is down, keep the API server alive but fail requests gracefully.
app.use("/api", (req, res, next) => {
  const dbOptionalRoutes = new Set([
    "GET:/auth/refreshaccessToken",
    "POST:/auth/signOut",
  ]);

  const routeKey = `${req.method}:${req.path}`;
  if (dbOptionalRoutes.has(routeKey)) {
    return next();
  }

  if (globalThis.__mongoConnected === false) {
    return res.status(503).json({
      message: "Service temporarily unavailable. Database is not connected.",
    });
  }
  return next();
});

// ---------- ROUTES ----------
app.use("/api", router);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.get("/", (req, res) => res.send("API is working"));
app.use(errorHandler)


//websocket
// ---------- SERVER START ----------
const startServer = async () => {
  try {
    const conn = await connectDB();
    if (conn) console.log("MongoDB connected successfully");
    // Start SOCKET Server (works even when DB is unavailable)
    initSocket(app, PORT);
   } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    initSocket(app, PORT); // uncomment if using socket

  } 
};

startServer();
