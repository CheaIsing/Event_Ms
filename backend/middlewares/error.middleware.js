// errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
    console.error(err); // Log the error for debugging
  
    // Determine the status code
    const statusCode = err.statusCode || 500; // Default to 500 if not set
    const message = err.message || "Internal Server Error"; // Default message
  
    // Send the error response
    res.status(statusCode).json({
      success: false,
      message,
    });
  };
  
  module.exports = errorMiddleware;