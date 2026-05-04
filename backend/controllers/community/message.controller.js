// controllers/messageController.js
import Message from "../../models/community/message.model.js";
import MessageRead from "../../models/community/messageRead.model.js";
import Post from "../../models/community/post.model.js";
import mongoose from "mongoose";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/customError.js";
import { safeParse } from "../../helpers/safeParse.js";
import { getIO } from "../../socket.js";
import { sendCommunityNotification } from "../../helpers/notification.helper.js";
import communityMemberModel from "../../models/community/communityMember.model.js";

// Send a message (REST endpoint)
export const sendMessage = async (req, res, next) => {
  try {
    const body = req?.body ?? {};
    const sender = req?.user?.id;
    const { communityId } = req?.params;

    if (!sender) throw new UnauthorizedError();
    if (!communityId) throw new BadRequestError("Community id required");

    const isMember = await communityMemberModel.exists({
      user: sender,
      community: communityId,
    });
    
    if (!isMember) {
      throw new ForbiddenError("You are not a member of this community");
    }

    const text = body?.text?.trim() || null;
    const replyToMessage = body?.replyToMessage || null;
    const replyToPost = body?.replyToPost || null;
    const mentions = safeParse(body?.mentions, []);

    const images = req?.files?.length
      ? req.files.map((file) => `/uploads/messages/images/${file.filename}`)
      : [];

    if (!text && images.length === 0) {
      throw new BadRequestError("Message cannot be empty");
    }

    if (replyToMessage) {
      const parent = await Message.findById(replyToMessage).select("community");
      if (!parent || parent.community.toString() !== communityId) {
        throw new BadRequestError("Invalid replyToMessage");
      }
    }

    if (replyToPost) {
      const post = await Post.findById(replyToPost).select("community");
      if (!post || post.community.toString() !== communityId) {
        throw new BadRequestError("Invalid replyToPost");
      }
    }

    const messageType = images.length ? (text ? "mixed" : "image") : "text";

    const message = await Message.create({
      community: communityId,
      sender,
      text,
      images,
      messageType,
      replyToMessage,
      replyToPost,
      mentions,
    });

    await MessageRead.create({
      message: message._id,
      user: sender,
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

    // emit realtime
    const io = getIO();
    io.to(communityId).emit("message:new", fullMessage);

    // Mention notifications (individual)
    if (Array.isArray(mentions) && mentions.length) {
      for (const mentionedUserId of mentions) {
        if (!mentionedUserId) continue;
        if (mentionedUserId.toString() === sender.toString()) continue;

        await sendCommunityNotification({
          communityId,
          senderId: sender,
          type: "mention",
          payload: { messageId: message._id, text },
          excludeSender: false,
          recipientId: mentionedUserId.toString(),
        });
      }
    }

    // Reply vs Message notification (community)
    if (replyToMessage || replyToPost) {
      await sendCommunityNotification({
        communityId,
        senderId: sender,
        type: "reply",
        payload: { messageId: message._id, replyToMessage, replyToPost, text },
        excludeSender: true,
      });
    } else {
      await sendCommunityNotification({
        communityId,
        senderId: sender,
        type: "message",
        payload: { messageId: message._id, text },
        excludeSender: true,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: fullMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Fetch messages (pagination)
export const getMessages = async (req, res, next) => {
  try {
    const communityId = req?.params?.id;
    const limit = Math.min(parseInt(req?.query?.limit || "50", 10), 100);
    const before = req?.query?.before ? new Date(req?.query?.before) : null;

    const query = { community: communityId };
    if (before) query.createdAt = { $lt: before };

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
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
      })
      .lean();

    res.status(200).json({ success: true, data: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

// Mark as read
export const markMessageRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId, communityId } = req?.body || {};

    const isMember = await communityMemberModel.exists({
      user: userId,
      community: communityId,
    });
    if (!isMember) {
      throw new ForbiddenError("You are not a member of this community");
    }

    await MessageRead.updateOne(
      { message: messageId, user: userId },
      { $setOnInsert: { community: communityId, readAt: new Date() } },
      { upsert: true }
    );

    const io = getIO();
    io.to(communityId).emit("message:read", { messageId, userId });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Get unread count
export const getUnreadCount = async (req, res, next) => {
  try {
    const user = req.user.id;
    const { communityId } = req.params;

    const totalMessages = await Message.countDocuments({
      community: communityId,
    });
    const readCount = await MessageRead.countDocuments({
      community: communityId,
      user,
    });

    res
      .status(200)
      .json({ success: true, unread: Math.max(0, totalMessages - readCount) });
  } catch (error) {
    next(error);
  }
};

// Edit message
export const editMessage = async (req, res, next) => {
  try {
    const user = req?.user?.id;
    const messageId = req?.params?.id;
    const { text } = req?.body || {};

    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    if (message.sender.toString() !== user) {
      throw new UnauthorizedError();
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    const updated = await Message.findById(message._id).populate(
      "sender",
      "userName image"
    );

    const io = getIO();
    io.to(message.community.toString()).emit("message:edited", updated);

    // optional: notification for edit (rare)
    // await sendCommunityNotification({ communityId: message.community, senderId: user, type: "edit", payload: { messageId, text } });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Delete message (soft)
export const deleteMessage = async (req, res, next) => {
  try {
    const user = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    const isAdmin = req.user.role === "admin";
    if (message.sender.toString() !== user && !isAdmin) {
      throw new UnauthorizedError();
    }

    message.deleted = true;
    await message.save();

    const io = getIO();
    io.to(message.community.toString()).emit("message:deleted", { messageId });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const addReaction = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const messageId = req?.params?.id;
    const { emoji } = req?.body || {};

    if (!emoji) throw new BadRequestError("Emoji is required");

    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    // Check if user already reacted
    const existingReaction = message.reaction.find(
      (r) => r.user.toString() === userId
    );

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        return res.status(200).json({ success: true, alreadyReacted: true });
      }
      existingReaction.emoji = emoji; // update emoji
    } else {
      message.reaction.push({ user: userId, emoji }); // add new reaction
    }

    await message.save();

    // emit realtime update
    const io = getIO();
    io.to(message.community.toString()).emit("message:reaction:add", {
      messageId,
      userId,
      emoji,
    });

    // send notification to message owner (exclude if same user)
    if (message.sender.toString() !== userId) {
      await sendCommunityNotification({
        communityId: message.community,
        senderId: userId,
        type: "reaction",
        payload: { messageId, emoji },
        excludeSender: false,
        recipientId: message.sender.toString(),
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Remove reaction
export const removeReaction = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const messageId = req?.params?.id;

    const message = await Message.findById(messageId);
    if (!message) throw new NotFoundError("Message not found");

    const reactionIndex = message.reaction.findIndex(
      (r) => r.user.toString() === userId
    );

    if (reactionIndex === -1) {
      return res.status(200).json({ success: true, alreadyRemoved: true });
    }

    const removedReaction = message.reaction.splice(reactionIndex, 1)[0];
    await message.save();

    const io = getIO();
    io.to(message.community.toString()).emit("message:reaction:remove", {
      messageId,
      userId,
      emoji: removedReaction.emoji,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
