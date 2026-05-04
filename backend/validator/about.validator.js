import { body } from "express-validator";

export const createAboutValidator = [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("subTitle")
    .trim()
    .notEmpty()
    .withMessage("Subtitle is required")
    .isLength({ min: 3 })
    .withMessage("Subtitle must be at least 3 characters"),

  body("subDescription")
    .trim()
    .notEmpty()
    .withMessage("Sub description is required")
    .isLength({ min: 10 })
    .withMessage("Sub description must be at least 10 characters"),
];

export const updateAboutValidator = [
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("subTitle")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Subtitle must be at least 3 characters"),

  body("subDescription")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Sub description must be at least 10 characters"),
];
