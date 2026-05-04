
// Base class for all custom errors

export class CustomError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}


// 400 - Bad Request

export class BadRequestError extends CustomError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

//  * 401 - Unauthorized
 
export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized Access") {
    super(message, 401);
  }
}


// 403 - Forbidden

export class ForbiddenError extends CustomError {
  constructor(message = "Access Forbidden") {
    super(message, 403);
  }
}


// 404 - Not Found
 
export class NotFoundError extends CustomError {
  constructor(message = "Resource Not Found") {
    super(message, 404);
  }
}


// 409 - Conflict (e.g., duplicate entry)
  
export class ConflictError extends CustomError {
  constructor(message = "Conflict: Resource already exists") {
    super(message, 409);
  }
}

// 422 - Unprocessable Entity (validation error)

export class ValidationError extends CustomError {
  constructor(message = "Invalid data provided") {
    super(message, 422);
  }
}


//  500 - Internal Server Error

export class InternalServerError extends CustomError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
  }
}
