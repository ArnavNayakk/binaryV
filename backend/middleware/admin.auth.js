import jwt from "jsonwebtoken";
import employeModel from "../models/employe/employe.model.js";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "../utils/customError.js";

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.cookies?.accessToken || req.headers["authorization"];
    console.log("auth header", authHeader);

    // Check if token is provided
    if (!authHeader) {
      throw new UnauthorizedError("No token provided");
    }

    // Extract token (supports 'Bearer <token>' and raw token)
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      throw new UnauthorizedError("Token missing");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);

    if (!decoded?.id?._id && !decoded?._id) {
      throw new UnauthorizedError("Invalid or malformed token");
    }

    // Attach user to request
    req.user = { id: decoded?.id?._id || decoded?._id };

    // Check if user exists in DB
    const user = await employeModel.findById(req.user.id).populate("role", "role");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check role
    if (user.role.role !== "admin") {
      throw new ForbiddenError("Access denied. Admins only.");
    }

    console.log("Admin verified:", user._id);
    next();
  } catch (error) {
    // Handle JWT-specific errors
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Session expired. Please log in again."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid token. Authentication failed."));
    }

    next(error); // Forward to global error handler
  }
};

export default authAdmin;
