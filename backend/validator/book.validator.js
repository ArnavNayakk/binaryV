import { body } from "express-validator";


export const createBookValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Book title is required")
    .isLength({ min: 2 })
    .withMessage("Book title must be at least 2 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .isLength({ min: 2 })
    .withMessage("Slug must be at least 2 characters")
    .custom(value => {
      if (value !== value.toLowerCase()) {
        throw new Error("Slug must be lowercase");
      }
      return true;
    }),
];


export const updateBookValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Book title must be at least 2 characters"),

  body("slug")
    .optional()
    .trim()
    .custom(value => {
      if (value !== value.toLowerCase()) {
        throw new Error("Slug must be lowercase");
      }
      return true;
    }),
];
