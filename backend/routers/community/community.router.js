import express from "express";
import {
  createCommunity,
  joinCommunity,
  blockMember,
  getAllCommunity,
  getMemberByCommunity,
  getCommunityByUser,
  updateCommunity,
  getUserCreatedCommunity,
  getCommunityJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  getCommunityDataById,
} from "../../controllers/community/community.controller.js";
import authUser from "../../middleware/auth.js";
import { uploadSingleImage } from "../../middleware/multer/multer.js";

const communityRouter = express.Router();

// Create community
communityRouter.post(
  "/create",

  (req, res, next) => {
    req.uploadFolder = "communities";
    next();
  },
  uploadSingleImage("image"),
    authUser,
  createCommunity
);

communityRouter.post(
  "/edit/:id",
  
  (req, res, next) => {
    req.uploadFolder = "communities";
    next();
  },
  uploadSingleImage(),
  authUser,
  updateCommunity
);

// Join community
communityRouter.post("/join/:id", authUser, joinCommunity);

// Block / Unblock member (admin only)
communityRouter.post("/block/:id", authUser, blockMember);

communityRouter.get("/get", authUser, getAllCommunity);

communityRouter.get("/member/:id", authUser, getMemberByCommunity);

communityRouter.get("/request/:id",authUser,getCommunityJoinRequests)

communityRouter.get("/user", authUser, getCommunityByUser);

communityRouter.get("/creater", authUser, getUserCreatedCommunity);

communityRouter.post('/approve/:id/:requestId',authUser, approveJoinRequest);

communityRouter.post('/reject/:id/:requestId',authUser,rejectJoinRequest);

communityRouter.get('/community-data/:id',authUser, getCommunityDataById)

export default communityRouter;
