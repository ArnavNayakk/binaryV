import { body } from "express-validator";

export const createEmployeValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("role")
    .optional()
    .isMongoId()
    .withMessage("Invalid role ID"),

  body("contact")
    .notEmpty()
    .withMessage("Contact number is required")
    .isNumeric()
    .withMessage("Contact must be numeric")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact must be 10 digits"),

  body("joiningDate")
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Invalid joining date"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),

  body("qualification")
    .trim()
    .notEmpty()
    .withMessage("Qualification is required"),

  body("createdBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid creator ID"),
];

export const updateEmployeValidator = [
  body("name")
    .optional()
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  body("role")
    .optional()
    .isMongoId()
    .withMessage("Invalid role ID"),

  body("contact")
    .optional()
    .isNumeric()
    .withMessage("Contact must be numeric")
    .isLength({ min: 10, max: 10 })
    .withMessage("Contact must be 10 digits"),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid joining date"),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other"])
    .withMessage("Invalid gender"),

  body("qualification")
    .optional()
    .trim(),

  body("updatedBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid updater ID"),
];
