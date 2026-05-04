import Guide from "../../models/guide/guide.model.js";
import mongoose from "mongoose";

// Reusable ID validation function
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// =======================================================
// CREATE GUIDE
// =======================================================
export const createGuide = async (req, res) => {
  try {
    const { title } = req.body || {};

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guide title is required.",
      });
    }

    // 🔥 CHECK FOR DUPLICATE TITLE
    const existingGuide = await Guide.findOne({ title: title.trim() });

    if (existingGuide) {
      return res.status(409).json({
        success: false,
        message: "A guide with this title already exists.",
      });
    }

    const guide = await Guide.create({
      title,
      faqs: [],
    });

    return res.status(201).json({
      success: true,
      message: "Guide created successfully.",
      data: guide,
    });
  } catch (error) {
    console.error("CREATE GUIDE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


// =======================================================
// GET ALL GUIDES
// =======================================================
export const getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find();

    return res.status(200).json({
      success: true,
      data: guides,
    });
  } catch (error) {
    console.error("GET ALL GUIDES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// =======================================================
// GET GUIDE BY ID (query: ?id=)
// =======================================================
export const getGuideById = async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Guide ID (id) is required.",
      });
    }

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID format.",
      });
    }

    const guide = await Guide.findById(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    console.error("GET GUIDE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// =======================================================
// UPDATE GUIDE (query: ?id=)
// =======================================================
export const updateGuide = async (req, res) => {
  try {
    const id = req.query.id;
    const { title } = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Guide ID (id) is required.",
      });
    }

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID format.",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guide title is required.",
      });
    }

    const updatedGuide = await Guide.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedGuide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Guide updated successfully.",
      data: updatedGuide,
    });
  } catch (error) {
    console.error("UPDATE GUIDE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// =======================================================
// DELETE GUIDE (query: ?id=)
// =======================================================
export const deleteGuide = async (req, res) => {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Guide ID (id) is required.",
      });
    }

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID format.",
      });
    }

    const deletedGuide = await Guide.findByIdAndDelete(id);

    if (!deletedGuide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Guide deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE GUIDE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// =======================================================
// ADD FAQ (query: ?guideId=)
// =======================================================
export const addFAQ = async (req, res) => {
  try {
    const guideId = req.query.guideId;
    const { question, answer } = req.body || {};

    if (!guideId) {
      return res.status(400).json({
        success: false,
        message: "guideId is required.",
      });
    }

    if (!isValidId(guideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID.",
      });
    }

    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question and Answer are required.",
      });
    }

    const guide = await Guide.findByIdAndUpdate(
      guideId,
      { $push: { faqs: { question, answer } } },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ added successfully.",
      data: guide,
    });
  } catch (error) {
    console.error("ADD FAQ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// =======================================================
// UPDATE FAQ (query: ?guideId=&faqId=)
// =======================================================
export const updateFAQ = async (req, res) => {
  try {
    const { guideId, faqId } = req.query || {};
    const { question, answer } = req.body || {};

    if (!guideId || !faqId) {
      return res.status(400).json({
        success: false,
        message: "guideId and faqId are required.",
      });
    }

    if (!isValidId(guideId) || !isValidId(faqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs.",
      });
    }

    if (!question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question and Answer are required.",
      });
    }

    const updatedGuide = await Guide.findOneAndUpdate(
      { _id: guideId, "faqs._id": faqId },
      {
        $set: {
          "faqs.$.question": question,
          "faqs.$.answer": answer,
        },
      },
      { new: true }
    );

    if (!updatedGuide) {
      return res.status(404).json({
        success: false,
        message: "Guide or FAQ not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully.",
      data: updatedGuide,
    });
  } catch (error) {
    console.error("UPDATE FAQ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// =======================================================
// DELETE FAQ (query: ?guideId=&faqId=)
// =======================================================
export const deleteFAQ = async (req, res) => {
  try {
    const { guideId, faqId } = req.query || {};

    if (!guideId || !faqId) {
      return res.status(400).json({
        success: false,
        message: "guideId and faqId are required.",
      });
    }

    if (!isValidId(guideId) || !isValidId(faqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs.",
      });
    }

    const updatedGuide = await Guide.findByIdAndUpdate(
      guideId,
      { $pull: { faqs: { _id: faqId } } },
      { new: true }
    );

    if (!updatedGuide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully.",
      data: updatedGuide,
    });
  } catch (error) {
    console.error("DELETE FAQ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
