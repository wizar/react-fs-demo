class BaseHttpError extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.status = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends BaseHttpError {
  constructor(message) {
    super(message, 400);
  }
}

class ForbiddenError extends BaseHttpError {
  constructor(message) {
    super(message, 403);
  }
}

class InternalError extends BaseHttpError {
  constructor(message) {
    super(message, 500);
  }
}

class UnauthorizedError extends BaseHttpError {
  constructor(message) {
    super(message, 401);
  }
}

module.exports = {
  BaseHttpError,
  BadRequestError,
  ForbiddenError,
  InternalError,
  UnauthorizedError
}