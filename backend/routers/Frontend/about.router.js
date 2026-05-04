import express from "express";
import {
  addAbout,
  updateAbout,
  getAbout,
  getAboutById,
  deleteAbout,
} from "../../controllers/Frontend/about.controller.js";
import adminAuth from "../../middleware/admin.auth.js";
import { uploadSingleImage } from "../../middleware/multer/multer.js";

const aboutRouter = express.Router();

aboutRouter.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "about";
    next();
  },
  uploadSingleImage("aboutImg"),
  adminAuth,
  addAbout
);
aboutRouter.put(
  "/:id",
  (req, res, next) => {
    req.uploadFolder = "about";
    next();
  },
  uploadSingleImage("aboutImg"),
  adminAuth,
  updateAbout
);
aboutRouter.get("/get-all", getAbout);
aboutRouter.get("/get/:id", getAboutById);
aboutRouter.delete("/delete/:id", adminAuth, deleteAbout);

export default aboutRouter;
