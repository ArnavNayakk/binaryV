// sockets/index.js
import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import Message from "./models/community/message.model.js";
import MessageRead from "./models/community/messageRead.model.js";
import CommunityMember from "./models/community/communityMember.model.js";
import JoinRequest from "./models/community/joinRequest.model.js";
import { sendCommunityNotification } from "./helpers/notification.helper.js";
import cookie from "cookie";
import {sub} from "./config/redis/redisClient.js"


const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const socketOrigins = (
  process.env.FRONTEND_URLS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let io;
const onlineUsers = new Map();

export function initSocket(app, PORT) {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: socketOrigins,
      credentials: true,
    },
    pingTimeout: 30000,
  });

  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers?.cookie;
      if (!rawCookie) return next(new Error("Unauthorized"));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.accessToken;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded?.id?._id || decoded?._id || decoded?.id || null;

      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  function emitToUser(userId, event, payload) {
    const sockets = onlineUsers.get(userId?.toString());
    if (!sockets) return;
    for (const sid of sockets) {
      io.to(sid).emit(event, payload);
    }
  }

  sub.subscribe("tradeClosed", () => {
    console.log("Subscribed to Redis channel: tradeClosed");
  });

  sub.on("message", (channel, message) => {
    if (channel === "tradeClosed") {
      const data = JSON.parse(message);
      console.log("Redis → Socket Emit trade:closed", data);
      io.to(data.userId).emit("trade:closed", data);
    }
  });

  io.on("connection", async (socket) => {
    const uid = socket.user?.toString();
    if (!uid) {
      socket.disconnect(true);
      return;
    }

    console.log("Socket connected:", socket.id, uid);

    const set = onlineUsers.get(uid) || new Set();
    set.add(socket.id);
    onlineUsers.set(uid, set);

    socket.join(uid);

    try {
      const memberships = await CommunityMember.find({ user: uid }).select(
        "community"
      );
      memberships.forEach((m) => {
        socket.join(m.community.toString());
      });
    } catch (err) {
      console.error("Auto join error:", err.message);
    }

    socket.on("joinCommunity", (communityId) => {
      if (communityId) socket.join(communityId);
    });

    socket.on("community:join:request", async ({ communityId }) => {
      try {
        const existing = await JoinRequest.findOne({
          community: communityId,
          user: uid,
        });

        if (existing) {
          return socket.emit("error", { message: "Request already sent" });
        }

        await JoinRequest.create({
          community: communityId,
          user: uid,
          status: "pending",
        });

        const admins = await CommunityMember.find({
          community: communityId,
          role: { $in: ["admin", "moderator"] },
        }).select("user");

        admins.forEach((admin) => {
          emitToUser(admin.user.toString(), "community:join:newRequest", {
            userId: uid,
            communityId,
          });
        });
      } catch (err) {
        console.error("Join request error:", err.message);
        socket.emit("error", { message: err.message });
      }
    });

    socket.on(
      "community:join:accept",
      async ({ communityId, requestUserId }) => {
        try {
          const me = await CommunityMember.findOne({
            community: communityId,
            user: uid,
          });

          if (!me || !["admin", "moderator"].includes(me.role)) {
            return socket.emit("error", { message: "Not authorized" });
          }

          await JoinRequest.findOneAndUpdate(
            { community: communityId, user: requestUserId },
            { status: "approved" }
          );

          await CommunityMember.findOneAndUpdate(
            { community: communityId, user: requestUserId },
            { role: "member" },
            { upsert: true }
          );

          emitToUser(requestUserId, "community:join:approved", {
            communityId,
          });

          io.to(communityId).emit("community:member:added", {
            userId: requestUserId,
            communityId,
          });
        } catch (err) {
          console.error("Accept error:", err.message);
          socket.emit("error", { message: err.message });
        }
      }
    );

    socket.on(
      "community:join:reject",
      async ({ communityId, requestUserId }) => {
        try {
          const me = await CommunityMember.findOne({
            community: communityId,
            user: uid,
          });

          if (!me || !["admin", "moderator"].includes(me.role)) {
            return socket.emit("error", { message: "Not authorized" });
          }

          await JoinRequest.findOneAndUpdate(
            { community: communityId, user: requestUserId },
            { status: "rejected" }
          );

          emitToUser(requestUserId, "community:join:rejected", {
            communityId,
            message: "Your join request was rejected",
          });

          io.to(communityId).emit("community:member:removed", {
            userId: requestUserId,
            communityId,
          });
        } catch (err) {
          console.error("Reject request error:", err.message);
          socket.emit("error", { message: err.message });
        }
      }
    );

    socket.on("message:send", async (payload) => {
      try {
        const {
          communityId,
          text,
          images = [],
          replyToMessage = null,
          replyToPost = null,
          mentions = [],
        } = payload || {};

        const messageType =
          images?.length > 0 ? (text ? "mixed" : "image") : "text";

        const message = await Message.create({
          community: communityId,
          sender: uid,
          text,
          images,
          messageType,
          replyToMessage,
          replyToPost,
          mentions,
        });

        await MessageRead.create({
          message: message._id,
          user: uid,
          community: communityId,
        });

        const fullMessage = await Message.findById(message._id)
          .populate("sender", "userName image")
          .populate({
            path: "replyToMessage",
            select: "text sender",
            populate: {
              path: "sender",
              select: "userName image",
            },
          })
          .populate({
            path: "replyToPost",
            select: "content author",
            populate: {
              path: "author",
              select: "userName image",
            },
          });

        io.to(communityId).emit("message:new", fullMessage);

        await sendCommunityNotification({
          communityId,
          senderId: uid,
          type: replyToMessage || replyToPost ? "reply" : "message",
          payload: { messageId: message._id, communityId, text },
          excludeSender: true,
        });

        if (Array.isArray(mentions)) {
          for (const mentionedUserId of mentions) {
            if (!mentionedUserId || mentionedUserId.toString() === uid)
              continue;

            await sendCommunityNotification({
              communityId,
              senderId: uid,
              type: "mention",
              payload: { messageId: message._id, communityId, text },
              recipientId: mentionedUserId.toString(),
            });
          }
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("message:read", async ({ messageId, communityId }) => {
      try {
        await MessageRead.updateOne(
          { message: messageId, user: uid },
          { $setOnInsert: { community: communityId, readAt: new Date() } },
          { upsert: true }
        );
        socket.to(communityId).emit("message:read", { messageId, userId: uid });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("typing:start", ({ communityId }) => {
      socket.to(communityId).emit("typing:start", { userId: uid });
    });

    socket.on("typing:stop", ({ communityId }) => {
      socket.to(communityId).emit("typing:stop", { userId: uid });
    });

    socket.on("notification:read", async (notificationId) => {
      try {
        await Notification.updateOne(
          { _id: notificationId, recipient: uid },
          { $set: { read: true } }
        );
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("disconnect", () => {
      const set = onlineUsers.get(uid);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) onlineUsers.delete(uid);
      }
      console.log("Socket disconnected:", socket.id, uid);
    });
  });

  server.on("error", (err) => {
    // Prevent hard crash when another instance is already bound to the port.
    if (err?.code === "EADDRINUSE") {
      console.error(
        `Socket server not started: port ${PORT} is already in use (EADDRINUSE).`
      );
      return;
    }
    console.error("Socket server error:", err?.message || err);
  });

  server.listen(PORT, () => {
    console.log("Server + WebSocket running on port", PORT);
  });

  io._onlineUsers = onlineUsers;
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}
