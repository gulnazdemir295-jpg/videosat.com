/**
 * Express Middleware for Request/Response Logging
 * Winston logger ile entegre
 */

const logger = require('./logger');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Response finish event
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });

  next();
};

/**
 * Error logging middleware
 */
const errorLogger = (err, req, res, next) => {
  logger.logError(err, req);
  next(err);
};

/**
 * API call logging middleware
 */
const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  const userId = req.user ? req.user.email : null;

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logAPI(
      req.originalUrl,
      req.method,
      res.statusCode,
      responseTime,
      userId
    );
  });

  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  apiLogger
};

