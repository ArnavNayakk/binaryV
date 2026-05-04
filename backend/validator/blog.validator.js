import { body } from "express-validator";

export const createBlogValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),

  body("slug")
    .optional()
    .trim()
    .isLowercase()
    .withMessage("Slug must be lowercase"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  body("bannerImage")
    .optional()
    .isString()
    .withMessage("Banner image must be a string"),

  body("sections")
    .isArray({ min: 1 })
    .withMessage("At least one section is required"),

  body("sections.*.subTitle")
    .trim()
    .notEmpty()
    .withMessage("Section subtitle is required"),

  body("sections.*.subDescription")
    .notEmpty()
    .withMessage("Section description is required"),

  body("browseOtherTopics")
    .optional()
    .isArray()
    .withMessage("Browse other topics must be an array"),

  body("browseOtherTopics.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid blog ID in browseOtherTopics"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tag cannot be empty"),

  body("createdBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid admin ID"),
];
