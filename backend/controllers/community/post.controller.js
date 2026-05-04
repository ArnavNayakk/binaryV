import Post from "../../models/community/post.model.js";
import Community from "../../models/community/community.model.js";
import CommunityMember from "../../models/community/communityMember.model.js";
import { getIO } from "../../socket.js";
import path from "path";
import { createPostNotification } from "../../helpers/notification.helper.js";

export async function createPost(req, res,next) {
  try {
    const userId = req?.user?.id;
    const { content, communityId } = req?.body || {};

    if (!communityId) {
      return res.status(400).json({ message: "communityId required" });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const member = await CommunityMember.findOne({
      community: communityId,
      user: userId,
    });

    if (!member) {
      return res.status(403).json({ message: "You are not a community member" });
    }

    if (member.blocked) {
      return res.status(403).json({ message: "You are blocked in this community" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const images = (req.files || []).map((file) => {
      const folder = path.basename(file.destination);
      return `${baseUrl}/uploads/${folder}/${file.filename}`;
    });

    let post = await Post.create({
      community: communityId,
      author: userId,
      content: content || "",
      images,
      type:
        images.length && content
          ? "mixed"
          : images.length
          ? "image"
          : "text",
    });

    post = await post.populate("author", "name email");

    //  GET RECIPIENTS PROPERLY FROM CommunityMember
    const recipients = await CommunityMember.find({
      community: communityId,
      blocked: false,
      user: { $ne: userId },
    }).select("user");

    await createPostNotification({
      recipients,
      senderId: userId,
      postId: post._id,
      communityId,
    });

    //  REALTIME EMIT
    const io = getIO();
    io.to(communityId.toString()).emit("postCreated", post);

    return res.status(201).json({ success: true, post });
  } catch (err) {
    next(err)
  }
}

export async function updatePost(req, res) {
  try {
    const userId = req?.user?.id;
    const postId = req?.params?.id;
    const { content } = req.body;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const post = await Post.findById(postId).populate("community");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const member = await CommunityMember.findOne({
      community: post.community._id,
      user: userId,
      blocked: false,
    });

    if (!member) {
      return res.status(403).json({ message: "You are not a valid member" });
    }

    if (
      content === undefined &&
      (!req.files || req.files.length === 0)
    ) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    if (content !== undefined) {
      post.content = content;
    }

    if (req.files?.length) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const newImages = req.files.map((file) => {
        const folder = path.basename(file.destination);
        return `${baseUrl}/uploads/${folder}/${file.filename}`;
      });

      post.images = [...post.images, ...newImages];
    }

    post.type =
      post.images.length && post.content
        ? "mixed"
        : post.images.length
        ? "image"
        : "text";

    await post.save();
    const updatedPost = await post.populate("author", "name email");

    const io = getIO();
    io.to(post.community._id.toString()).emit("postUpdated", updatedPost);

    return res.status(200).json({ success: true, post: updatedPost });
  } catch (err) {
    console.error("UPDATE POST ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getCommunityPosts(req, res) {
  try {
    const communityId = req.params.id;

    const posts = await Post.find({ community: communityId })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, posts });
  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

