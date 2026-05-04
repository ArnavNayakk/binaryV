import express from "express";
import { addRole, getRole } from "../../controllers/employe/role.controller.js";

const roleRouter = express.Router();

// Add new role
roleRouter.post("/add", addRole);

// Get all roles
roleRouter.get("/get", getRole);

export default roleRouter;
