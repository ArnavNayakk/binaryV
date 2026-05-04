import express from "express";
import {
  addTutorial,
  updateTutorial,
  getAllTutorials,
  getTutorialById,
  deleteTutorial
} from "../../controllers/Frontend/tutorial.controller.js";
import adminAuth from "../../middleware/admin.auth.js";

const tutorialRouter = express.Router();

// CREATE Tutorial
tutorialRouter.post("/", adminAuth, addTutorial);

// UPDATE Tutorial
tutorialRouter.put("/:id", adminAuth, updateTutorial);

// GET All Tutorials (Paginated)
tutorialRouter.get("/get", getAllTutorials);

// GET Tutorial By ID
tutorialRouter.get("/get/:id", getTutorialById);

// DELETE Tutorial
tutorialRouter.delete("/delete/:id",adminAuth, deleteTutorial);

export default tutorialRouter;
