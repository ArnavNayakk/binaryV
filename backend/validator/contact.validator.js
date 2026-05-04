import { body } from "express-validator";

export const createContactValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("query")
    .trim()
    .notEmpty()
    .withMessage("Query is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Query must be between 10 and 1000 characters"),
];
