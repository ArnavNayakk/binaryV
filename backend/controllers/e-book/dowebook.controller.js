import path from "path";
import fs from "fs";
import Book from "../../models/e-book/ebook.model.js";

const downloadBook = async (req, res) => {
  try {
    const slug = req?.params?.slug;

    // Custom readable message
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Book identifier is missing. Please provide a valid book slug.",
      });
    }

    const book = await Book.findOne({ slug });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "The requested book could not be found.",
      });
    }

    const filePath = path.join("uploads", "e-books", book?.file);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "The book file is missing from the server.",
      });
    }

    return res.download(filePath, book?.file, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong while downloading the book. Please try again.",
        });
      }
    });

  } catch (error) {
    // Final catch block → always user readable
    return res.status(500).json({
      success: false,
      message: "Unable to process your request at the moment. Please try again later.",
      error: error?.message, // Optional for debugging
    });
  }
};

export { downloadBook };
