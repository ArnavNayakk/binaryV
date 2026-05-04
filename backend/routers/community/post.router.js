import express from "express";
import { createPost, getCommunityPosts, updatePost } from "../../controllers/community/post.controller.js";
import authUser from "../../middleware/auth.js";
import { uploadMultipleImages } from "../../middleware/multer/multer.js";

const postRouter = express.Router();

// CREATE POST
postRouter.post(
  "/",authUser,uploadMultipleImages(),
  createPost
);

postRouter.post('/edit/:id',authUser,uploadMultipleImages(),updatePost)

// GET ALL POSTS OF A COMMUNITY
postRouter.get(
  "/community/:id",
  authUser,
  getCommunityPosts
);

export default postRouter;
