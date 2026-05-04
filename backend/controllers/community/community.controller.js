import Community from "../../models/community/community.model.js";
import CommunityMember from "../../models/community/communityMember.model.js";
import Notification from "../../models/community/notification.model.js";
import JoinRequest from "../../models/community/joinRequest.model.js";
import { getIO } from "../../socket.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/customError.js";
import joinRequestModel from "../../models/community/joinRequest.model.js";

export async function createCommunity(req, res) {
  try {
    const userId = req?.user?.id || req?.user?._id;
    const body = req?.body ?? {};

    const name = body?.name?.trim();
    const description = body?.description?.trim();
    const privacy = body?.privacy?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Community name is required",
      });
    }

    // Check duplicate
    const existing = await Community.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Community already exists",
      });
    }

    const image = req?.file
      ? `/uploads/communities/images/${req.file.filename}`
      : null;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Community image is required",
      });
    }

    // Create community
    const community = await Community.create({
      name,
      description,
      creator: userId,
      image,
      privacy,
    });

    // Add creator as admin
    await CommunityMember.create({
      community: community._id,
      user: userId,
      role: "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Community created successfully",
      community,
    });
  } catch (err) {
    console.error("Create Community Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export const updateCommunity = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id;
    const communityId = req?.params?.id;
    const body = req?.body ?? {};

    const name = body?.name?.trim();
    const description = body?.description?.trim();
    const privacy = body?.privacy?.trim();

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "Community ID is required",
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    const memberData = await CommunityMember.findOne({ user: userId });

    if (memberData.role !== "admin" || memberData.role !== "moderator") {
      throw new ForbiddenError("Member dont have access to update");
    }

    if (name && name !== community.name) {
      const existing = await Community.findOne({ name });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Community name already exists",
        });
      }
    }

    const image = req?.file
      ? `/uploads/communities/images/${req.file.filename}`
      : null;

    if (name) community.name = name;
    if (description) community.description = description;
    if (image) community.image = image;
    if (privacy) community.privacy = privacy;

    community.updatedBy = userId;

    await community.save();

    return res.status(200).json({
      success: true,
      message: "Community updated successfully",
      data: community,
    });
  } catch (error) {
    next(error);
  }
};

export const joinCommunity = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const communityId = req?.params?.id;

    const community = await Community.findById(communityId);
    if (!community) throw new NotFoundError("Community not found");

    const alreadyMember = await CommunityMember.findOne({
      community: communityId,
      user: userId,
    });

    if (alreadyMember) throw new BadRequestError("Already a member");

    // PUBLIC Community → Direct join
    if (community.privacy === "public") {
      const member = await CommunityMember.create({
        community: communityId,
        user: userId,
        role: "member",
      });

      const io = getIO();
      io.to(communityId.toString()).emit("memberJoined", {
        userId,
        communityId,
      });

      return res.status(200).json({
        success: true,
        message: "Joined community successfully",
        member,
      });
    }

    // PRIVATE Community → Check if already requested
    const existingRequest = await JoinRequest.findOne({
      community: communityId,
      user: userId,
    });

    if (existingRequest) {
      throw new BadRequestError("Join request already sent");
    }

    const jr = await JoinRequest.create({
      community: communityId,
      user: userId,
      status: "pending",
    });

    await jr.populate([{ path: "community" }, { path: "user" }]);

    // Notify admins via socket (real-time)
    const io = getIO();
    io.to(communityId.toString()).emit("joinRequestCreated", {
      request: jr,
    });

    return res.status(200).json({
      success: true,
      message: "Join request sent",
      request: jr,
    });
  } catch (err) {
    next(err);
  }
};

export const getRequest = async (req, res) => {
  try {
    const userId = req?.user?.id || req?.user?._id;
    const { communityId } = req?.params?.id || {};
    const admin = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: { $in: ["admin", "moderator"] },
    });

    if (!admin) throw new UnauthorizedError("Access denied");
    const request = await joinRequestModel.find({ community: communityId });
    res
      .status(200)
      .json({ success: true, message: "Successfull", data: request });
  } catch (error) {
    next(error);
  }
};

export const approveJoinRequest = async (req, res, next) => {
  try {
    const communityId = req?.params?.id;
    const requestId = req?.params?.requestId;
    const userId = req?.user?.id;

    const request = await JoinRequest.findById(requestId);
    if (!request) throw new NotFoundError("Join request not found");

    const admin = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: { $in: ["admin", "moderator"] },
    });

    if (!admin) throw new UnauthorizedError("Access denied");

    // Create member
    const newMember = await CommunityMember.create({
      community: request.community,
      user: request.user,
      role: "member",
    });

    await JoinRequest.findByIdAndDelete(requestId);

    const io = getIO();
    io.to(communityId.toString()).emit("joinRequestApproved", {
      member: newMember,
    });

    return res.status(200).json({
      success: true,
      message: "Request approved",
      newMember,
    });
  } catch (err) {
    next(err);
  }
};

export const rejectJoinRequest = async (req, res, next) => {
  try {
    const communityId = req?.params?.id;
    const requestId = req?.params?.requestId;
    const userId = req?.user?.id;

    const request = await JoinRequest.findById(requestId);
    if (!request) throw new NotFoundError("Join request not found");

    const admin = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: { $in: ["admin", "moderator"] },
    });

    if (!admin) throw new UnauthorizedError("Access denied");

    await JoinRequest.findByIdAndDelete(requestId);

    const io = getIO();
    io.to(communityId.toString()).emit("joinRequestRejected", {
      requestId,
    });

    return res.status(200).json({
      success: true,
      message: "Request rejected",
    });
  } catch (err) {
    next(err);
  }
};

export const getCommunityJoinRequests = async (req, res, next) => {
  try {
    const communityId = req?.params?.id;
    const userId = req?.user?.id;

    const admin = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      role: { $in: ["admin", "moderator"] },
    });

    if (!admin) throw new UnauthorizedError("Access denied");

    const requests = await JoinRequest.find({
      community: communityId,
      status: "pending",
    })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

//
export const getCommunityDataById = async (req, res, next) => {
  try {
    const communityId = req?.params?.id;
    const community = await Community.findById(communityId);
    const member = await CommunityMember.find({ community: communityId });
    const data = {
      community,
      member,
    };
    res.status(200).json({ success: true, message: "Successfull", data });
  } catch (error) {
    next(error);
  }
};

export async function blockMember(req, res) {
  try {
    const userId = req?.user?.id;
    const communityId = req?.params?.id;
    const { targetUserId, block } = req?.body || {};

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user required" });
    }

    const actingMember = await CommunityMember.findOne({
      community: communityId,
      user: userId,
      blocked: false,
    });

    if (!actingMember) {
      return res.status(403).json({ message: "Not a community member" });
    }

    if (actingMember.role !== "admin") {
      return res.status(403).json({ message: "Only admin can block users" });
    }

    const targetMember = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId,
    });

    if (!targetMember) {
      return res.status(404).json({ message: "Target user not in community" });
    }

    targetMember.blocked = !!block;
    targetMember.blockedAt = block ? new Date() : null;
    await targetMember.save();

    // Save DB notification
    await Notification.create({
      recipient: targetUserId,
      sender: userId,
      type: "custom",
      payload: {
        communityId,
        blocked: !!block,
      },
    });

    // Realtime Notification
    const io = getIO();

    io.to(communityId.toString()).emit("memberBlocked", {
      userId: targetUserId,
      blocked: !!block,
    });

    // Notify specific user if online
    const onlineSockets = io._onlineUsers?.get(targetUserId.toString());
    if (onlineSockets) {
      for (const socketId of onlineSockets) {
        io.to(socketId).emit("userBlocked", {
          communityId,
          blocked: !!block,
        });
      }
    }

    return res.json({
      success: true,
      target: {
        user: targetMember.user,
        blocked: targetMember.blocked,
      },
    });
  } catch (err) {
    console.error("Block Member Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export const getAllCommunity = async (req, res, next) => {
  try {
    const community = await Community.find({ deleted: false });
    res.status(200).json({
      success: true,
      message: "Successful",
      data: community,
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberByCommunity = async (req, res, next) => {
  try {
    const communityId = req?.params?.id;

    if (!communityId) {
      throw new BadRequestError("Community id not found");
    }

    const members = await CommunityMember.find({
      community: communityId,
    }).populate("user", "userName email image");

    res.status(200).json({
      success: true,
      message: "Successful",
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommunityByUser = async (req, res, next) => {
  try {
    const userId = req?.user?.id;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const community = await CommunityMember.find({ user: userId }).populate({
      path: "community",
      match: { deleted: false },
    });

    res.status(200).json({
      success: true,
      message: "Successful",
      data: community,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCreatedCommunity = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const community = await Community.find({ creator: userId });

    res
      .status(200)
      .json({ success: true, message: "Successfull", data: community });
  } catch (error) {
    next(error);
  }
};
export const changeRole = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    const communityId = req?.params?.id;
    const { memberId, role } = req?.body || {};
    const user = await CommunityMember.findOne({
      user: userId,
      community: communityId,
    });
    if (user?.role === "admin") {
      throw new ForbiddenError("Only admin has the access to change the role");
    }
    const memeberData = await CommunityMember.findOneAndUpdate(
      { user: memberId, community: communityId },
      { $set: { role: role } },
      { new: true }
    );
    if (!memeberData) {
      throw new NotFoundError("Thier is no user with this id");
    }
    res
      .status(200)
      .json({ success: true, message: "Success", data: memeberData });
  } catch (error) {
    next(error);
  }
};
export const leaveCommunity = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id;
    const communityId = req?.params?.id;

    if (!userId || !communityId) {
      throw new BadRequestError("Invalid request");
    }

    const member = await CommunityMember.findOne({
      user: userId,
      community: communityId,
    });

    if (!member) {
      throw new NotFoundError("You are not a member of this community");
    }

    const admins = await CommunityMember.find({
      community: communityId,
      role: "admin",
    });

    //  Prevent last admin from leaving
    if (member.role === "admin" && admins.length <= 1) {
      throw new BadRequestError(
        "You must transfer admin rights before leaving the community"
      );
    }

    await CommunityMember.findOneAndDelete({
      user: userId,
      community: communityId,
    });

    res.status(200).json({
      success: true,
      message: "You left the community successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCommunity = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id;
    const communityId = req?.params?.id;

    const member = await CommunityMember.findOne({
      user: userId,
      community: communityId,
    });

    if (!member) {
      throw new NotFoundError("You are not a member of this community");
    }
    await Community.findByIdAndUpdate(communityId, {
      deleted: true,
    });
    await CommunityMember.findOneAndDelete({
      user: userId,
      community: communityId,
    });
    res
      .status(200)
      .json({ success: true, message: "Successfully deleted the community" });
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (req, res) => {
  try {
    const userId = req?.user?._id;
    const { communityId, targetUserId } = req?.body || {};

    if (!userId) throw new ForbiddenError("Unauthorized");

    const requester = await CommunityMember.findOne({
      community: communityId,
      user: userId,
    });

    if (!requester)
      throw new ForbiddenError("You are not part of this community");

    const target = await CommunityMember.findOne({
      community: communityId,
      user: targetUserId,
    });

    if (!target) throw new NotFoundError("User not found in this community");

    const requesterRole = requester?.role;
    const targetRole = target?.role;

    if (requesterRole === "admin" && targetRole === "admin") {
      throw new ForbiddenError("Admin cannot remove another admin");
    }

    if (
      requesterRole === "moderator" &&
      (targetRole === "admin" || targetRole === "moderator")
    ) {
      throw new ForbiddenError(
        "Moderator cannot remove admin or another moderator"
      );
    }

    if (requesterRole === "member") {
      throw new ForbiddenError("You are not allowed to remove members");
    }

    await target.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
