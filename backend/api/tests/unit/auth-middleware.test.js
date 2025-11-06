/**
 * Auth Middleware Unit Tests
 */

const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
} = require('../../middleware/auth-middleware');

describe('Auth Middleware', () => {
  const testPayload = {
    userId: 'test@example.com',
    email: 'test@example.com',
    role: 'musteri'
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload, '15m');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateToken(testPayload, '15m');
      const token2 = generateToken({ ...testPayload, role: 'admin' }, '15m');
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testPayload, '15m');
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      const token = generateToken(testPayload, '0s'); // Expired immediately
      // Wait a bit for expiration
      setTimeout(() => {
        const decoded = verifyToken(token);
        expect(decoded).toBeNull();
      }, 1000);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const refreshToken = generateRefreshToken(testPayload);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.').length).toBe(3);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const refreshToken = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(refreshToken);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should return null for invalid refresh token', () => {
      const decoded = verifyRefreshToken('invalid.refresh.token');
      expect(decoded).toBeNull();
    });
  });
});

