class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
      },
    });
  }

  res.status(500).json({
    error: {
      message: "Internal server error",
      status: 500,
    },
  });
}

module.exports = {
  ApiError,
  errorHandler,
};
