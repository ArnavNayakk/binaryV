import { safeParse } from "../../helpers/safeParse.js";
import Blog from "../../models/blog/blog.model.js";

export const createBlog = async (req, res, next) => {
  try {
    const body = req?.body ?? {};

    const title = body?.title?.trim();
    const description = body?.description?.trim();

    // Parse incoming fields safely
    const sections = safeParse(body?.sections, []);
    const browseOtherTopics = safeParse(body?.browseOtherTopics, []);
    const tags = safeParse(body?.tags, []);

    // File path (using multer)
    const bannerImage = req?.file
      ? `/uploads/blogs/images/${req.file.filename}`
      : null;

    const newBlog = new Blog({
      title,
      description,
      bannerImage,
      sections,
      browseOtherTopics,
      tags,
      createdBy: req?.user?._id ?? null,
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const page = Number(req?.query?.page) || 1;
    const limit = Number(req?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBlogs = await Blog.countDocuments();

    const blogs = await Blog.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("browseOtherTopics");

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      data: blogs,
      pagination: {
        totalBlogs,
        currentPage: page,
        totalPages: Math.ceil(totalBlogs / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blogId = req?.params?.id;

    const blog = await Blog.findById(blogId).populate("browseOtherTopics");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Get Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching blog",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const blogId = req?.params?.id;

    const body = req?.body ?? {};

    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Parse safely
    const sections = safeParse(body?.sections, existingBlog.sections);
    const browseOtherTopics = safeParse(
      body?.browseOtherTopics,
      existingBlog.browseOtherTopics
    );
    const tags = safeParse(body?.tags, existingBlog.tags);

    // New banner
    const bannerImage = req.file
      ? `/uploads/blogs/images/${req.file.filename}`
      : existingBlog.bannerImage;

    existingBlog.title = body?.title?.trim() ?? existingBlog.title;
    existingBlog.description = body?.description ?? existingBlog.description;
    existingBlog.sections = sections;
    existingBlog.tags = tags;
    existingBlog.browseOtherTopics = browseOtherTopics;
    existingBlog.bannerImage = bannerImage;
    existingBlog.lastUpdated = Date.now();

    // Auto-slug update if title changed
    if (body?.title) existingBlog.slug = undefined;

    await existingBlog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: existingBlog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating blog",
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blogId = req?.params?.id;

    const deleted = await Blog.findByIdAndDelete(blogId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting blog",
    });
  }
};
