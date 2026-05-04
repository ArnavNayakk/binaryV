import { body } from "express-validator";

export const createTutorialValidator = [
  body("videoLink")
    .trim()
    .notEmpty()
    .withMessage("Video link is required")
    .isURL()
    .withMessage("Invalid video URL"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
];

export const updateTutorialValidator = [
  body("videoLink")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid video URL"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
];
