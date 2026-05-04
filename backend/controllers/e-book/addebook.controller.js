import Book from "../../models/e-book/ebook.model.js";
import slugify from "slugify";

const addBook = async (req, res) => {
  try {
    const title = req?.body?.title;

    // CUSTOM Error Messages (Readable)
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Please provide a book title.",
      });
    }

    if (!req?.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file for the book.",
      });
    }

    // Slugify the title
    const slug = slugify(title, { lower: true });

    const newBook = await Book.create({
      title,
      slug,
      file: req?.file?.filename,
    });

    return res.status(201).json({
      success: true,
      message: "Book uploaded successfully!",
      data: newBook,
    });

  } catch (error) {
    // FRIENDLY INTERNAL ERROR MESSAGE
    return res.status(500).json({
      success: false,
      message: "Something went wrong while uploading the book. Please try again.",
      // optional chaining (not exposed to user in frontend)
      error: error?.message, 
    });
  }
};

export { addBook };
