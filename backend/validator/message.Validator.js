import { body } from "express-validator";

export const createMessageValidator = [
  body("community")
    .notEmpty()
    .withMessage("Community is required")
    .isMongoId()
    .withMessage("Invalid community ID"),

  body("sender")
    .optional()
    .isMongoId()
    .withMessage("Invalid sender ID"),

  body("text")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Message text cannot exceed 5000 characters"),

  body("messageType")
    .optional()
    .isIn(["text", "image", "mixed"])
    .withMessage("Invalid message type"),

  body("replyToMessage")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid reply message ID"),

  body("replyToPost")
    .optional({ nullable: true })
    .isMongoId()
    .withMessage("Invalid reply post ID"),

  body("mentions")
    .optional()
    .isArray()
    .withMessage("Mentions must be an array"),

  body("mentions.*")
    .optional()
    .isMongoId()
    .withMessage("Invalid mentioned user ID"),
];

export const updateMessageValidator = [
  body("text")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Message text cannot exceed 5000 characters"),

];

export const reactionValidator = [
  body("emoji")
    .notEmpty()
    .withMessage("Emoji is required")
    .isString()
    .withMessage("Emoji must be a string"),

  body("user")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID"),
];
