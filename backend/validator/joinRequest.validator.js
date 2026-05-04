import { body } from "express-validator";


export const createJoinRequestValidator = [
  body("community")
    .notEmpty()
    .withMessage("Community is required")
    .isMongoId()
    .withMessage("Invalid community ID"),

  // user should normally come from req.user.id
  body("user")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID"),

  body("message")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Message cannot exceed 300 characters"),
];


export const updateJoinRequestValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be approved or rejected"),

  body("actionTakenBy")
    .notEmpty()
    .withMessage("Action taker is required")
    .isMongoId()
    .withMessage("Invalid user ID"),

  body("message")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Message cannot exceed 300 characters"),
];
