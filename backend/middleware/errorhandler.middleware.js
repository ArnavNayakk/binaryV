// middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "deployment";

  // Log error stack in non-production environments
  if (!isProduction) {
    console.error("Error:", err);
  }

  // Default values
  const statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong. Please try again later.";

  // Hide internal messages in production
  if (isProduction && statusCode === 500) {
    message = "Internal Server Error. Please try again later.";
  }

  // Send JSON response
  return res.status(statusCode).json({
    success: false,
    message,
    ...(isProduction ? {} : { stack: err.stack, details: err.errors || null }),
  });
};
