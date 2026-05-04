import { body } from "express-validator";

export const createDownloadValidator = [
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

  body("feature")
    .isArray({ min: 1 })
    .withMessage("At least one feature is required"),

  body("feature.*.subTitle")
    .trim()
    .notEmpty()
    .withMessage("Feature subtitle is required"),

  body("feature.*.subDescription")
    .trim()
    .notEmpty()
    .withMessage("Feature description is required"),

  body("downloadLink")
    .trim()
    .notEmpty()
    .withMessage("Download link is required")
    .isURL()
    .withMessage("Invalid download link URL"),
];

export const updateDownloadValidator = [
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

  body("feature")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Feature must be an array"),

  body("feature.*.subTitle")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Feature subtitle cannot be empty"),

  body("feature.*.subDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Feature description cannot be empty"),

  body("downloadLink")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid download link URL"),
];
