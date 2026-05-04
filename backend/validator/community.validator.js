import { body } from "express-validator";

export const createCommunityValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Community name is required")
    .isLength({ min: 3 })
    .withMessage("Community name must be at least 3 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("creator")
    .notEmpty()
    .withMessage("Creator is required")
    .isMongoId()
    .withMessage("Invalid creator ID"),

  body("privacy")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Privacy must be public or private"),
];

export const updateCommunityValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Community name must be at least 3 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("privacy")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Privacy must be public or private"),

  body("updatedBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID"),
];
