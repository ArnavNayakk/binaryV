import express from "express";
import authUser from "../../middleware/auth.js";
import {
  sendMessage,
  getMessages,
  markMessageRead,
  getUnreadCount,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction
} from "../../controllers/community/message.controller.js";

import {
  uploadMultipleImages
} from "../../middleware/multer/multer.js";

const messageRouter = express.Router();


// Send message (text + images + reply + mentions)
messageRouter.post(
  "/send/:communityId",
  authUser, (req, res, next) => {
    req.uploadFolder = "messages";
    next();
  },
  uploadMultipleImages("images", 10),
  sendMessage
);

// Get messages with pagination
messageRouter.get(
  "/community/:id",
  authUser,
  getMessages
);

// Edit message
messageRouter.put(
  "/edit/:id",
  authUser,
  editMessage
);

// Delete message (soft delete)
messageRouter.delete(
  "/delete/:messageId",
  authUser,
  deleteMessage
);


// Mark message as read
messageRouter.post(
  "/read",
  authUser,
  markMessageRead
);

// Get unread count for community
messageRouter.get(
  "/unread/:communityId",
  authUser,
  getUnreadCount
);


// Add / update reaction
messageRouter.post(
  "/reaction/:id",
  authUser,
  addReaction
);

// Remove reaction
messageRouter.delete(
  "/reaction/:id",
  authUser,
  removeReaction
);


export default messageRouter;
