/**
 * Merkezi Error Handling Middleware
 * Tüm hataları yakalar ve standart formatta döner
 */

const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('🚨 Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Geçersiz token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token süresi dolmuş';
  }

  // Express validator errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.array();
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Dosya boyutu çok büyük';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Çok fazla dosya yüklendi';
    } else {
      message = 'Dosya yükleme hatası';
    }
  }

  // DynamoDB errors
  if (err.name === 'ResourceNotFoundException') {
    statusCode = 404;
    message = 'Kaynak bulunamadı';
  }

  // AWS SDK errors
  if (err.$metadata && err.$metadata.httpStatusCode) {
    statusCode = err.$metadata.httpStatusCode;
  }

  // Response
  const response = {
    success: false,
    error: {
      message,
      statusCode,
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper
 * Async route handler'ları otomatik olarak error handler'a yönlendirir
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Route ${req.originalUrl} bulunamadı`,
    404
  );
  next(err);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFoundHandler
};

