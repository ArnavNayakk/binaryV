import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/customError.js";

const authUser = async (req, res, next) => {
  try {
    console.log("Auth middleware triggered");

    const authHeader = req.headers["authorization"] || req.cookies.accessToken;
    console.log("from auth", authHeader);

    // No token provided
    if (!authHeader) {
      throw new UnauthorizedError("No token provided");
    }

    // Extract Bearer token or direct token
    const token = authHeader.split(" ")[1] || authHeader;
    if (!token) {
      throw new UnauthorizedError("Token missing");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id?._id && !decoded?._id) {
      throw new ForbiddenError("Invalid or malformed token");
    }

    // Attach user ID to request
    req.user = { id: decoded?.id?._id || decoded?._id || decoded?.id };
    req.userId = req.user.id;
    console.log("Authenticated user:", req.user.id);

    next();
  } catch (error) {
    // JWT-specific errors 
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Session expired. Please login again."));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid token. Authentication failed."));
    }

    // Pass all other errors to global handler
    next(error);
  }
};

export default authUser;
