import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLowercase()
    .withMessage("Username must be lowercase")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .if(body("googleId").not().exists())
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("googleId")
    .optional()
    .isString()
    .withMessage("Google ID must be a string"),

  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth"),

  body("country")
    .optional()
    .isString(),

  body("currency")
    .optional()
    .isString(),
];
