/**
 * Error Handler Middleware Unit Tests
 */

const { AppError, asyncHandler } = require('../../middleware/error-handler');

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an AppError with default status code', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.status).toBe('error');
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Not found', 404);
      expect(error.statusCode).toBe(404);
      expect(error.status).toBe('fail');
    });

    it('should include errors array when provided', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const error = new AppError('Validation error', 400, errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const asyncFn = async (req, res, next) => {
        res.json({ success: true });
      };
      const handler = asyncHandler(asyncFn);
      
      const req = {};
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await handler(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch and pass errors to next', async () => {
      const asyncFn = async (req, res, next) => {
        throw new Error('Test error');
      };
      const handler = asyncHandler(asyncFn);
      
      const req = {};
      const res = {};
      const next = jest.fn();

      await handler(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});

