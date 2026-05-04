import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById, 
  updateBlog,
  deleteBlog,
} from "../../controllers/blog/blog.controller.js";

import { uploadSingleImage } from "../../middleware/multer/multer.js";
import adminAuth from "../../middleware/admin.auth.js";

const blogRouter = express.Router();

// CREATE BLOG (with banner image)
blogRouter.post(
  "/",
 
  (req, res, next) => {
    req.uploadFolder = "blogs";
    next();
  },
  uploadSingleImage("bannerImage"),
   adminAuth,
  createBlog
);

// GET ALL BLOGS (paginated)
blogRouter.get("/get", getAllBlogs);

// GET BLOG BY ID
blogRouter.get("/get/:id", getBlogById);

// UPDATE BLOG
blogRouter.put(
  "/:id",
 
  (req, res, next) => {
    req.uploadFolder = "blogs";
    next();
  },
  uploadSingleImage("bannerImage"),
   adminAuth,
  updateBlog
);

// DELETE BLOG
blogRouter.delete("/delete/:id", adminAuth, deleteBlog);

export default blogRouter;
