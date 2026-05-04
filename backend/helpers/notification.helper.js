import Notification from "../models/community/notification.model.js";
import CommunityMember from "../models/community/communityMember.model.js"
import { getIO } from "../socket.js";

export async function createPostNotification({
  recipients,
  senderId,
  postId,
  communityId,
}) {
  if (!recipients?.length) return;

  // Save notifications in DB
  const notifications = recipients.map((m) => ({
    recipient: m.user,
    sender: senderId,
    type: "post",
    payload: {
      postId,
      communityId,
      message: "New post added in community",
    },
  }));

  const savedNotifications = await Notification.insertMany(notifications);

  // Realtime emit to online users
  const io = getIO();

  for (const notif of savedNotifications) {
    const targetUserId = notif.recipient.toString();
    const sockets = io._onlineUsers?.get(targetUserId);

    if (sockets) {
      for (const sid of sockets) {
        io.to(sid).emit("notification", notif);
      }
    }
  }
}


export const sendCommunityNotification = async ({
  communityId,
  senderId,
  type,
  payload = {},
  excludeSender = true,
  recipientId = null,
}) => {
  const io = getIO();

  const toInsert = [];

  if (recipientId) {
    // single recipient (e.g., mention)
    if (excludeSender && recipientId.toString() === senderId.toString()) return [];
    const notif = {
      recipient: recipientId,
      sender: senderId,
      type,
      payload,
    };
    toInsert.push(notif);

    // realtime (user room must exist; sockets.join(userId) is set in socket init)
    io.to(recipientId.toString()).emit("notification:new", notif);

    await Notification.insertMany(toInsert);
    return toInsert;
  }

  // Broadcast to all community members (except sender if excludeSender)
  const members = await CommunityMember.find({ community: communityId }).select("user");

  for (const m of members) {
    const r = m.user.toString();
    if (excludeSender && r === senderId.toString()) continue;

    const notif = {
      recipient: r,
      sender: senderId,
      type,
      payload,
    };
    toInsert.push(notif);

    // realtime emit to user room
    io.to(r).emit("notification:new", notif);
  }

  if (toInsert.length) {
    await Notification.insertMany(toInsert);
  }

  return toInsert;
};