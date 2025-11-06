const jwt = require('jsonwebtoken');

// JWT Secret - Environment variable'dan al, yoksa default kullan
const JWT_SECRET = process.env.JWT_SECRET || 'videosat-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'videosat-refresh-secret-key-change-in-production';

/**
 * JWT Token oluştur
 * @param {Object} payload - Token içeriği
 * @param {string} expiresIn - Geçerlilik süresi (örn: '15m', '1h', '7d')
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = '15m') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Refresh token oluştur
 * @param {Object} payload - Token içeriği
 * @returns {string} Refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Token doğrula
 * @param {string} token - JWT token
 * @returns {Object} Decoded token veya null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Refresh token doğrula
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token veya null
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Express middleware - JWT token doğrulama
 * Protected route'lar için kullanılır
 */
function authenticateToken(req, res, next) {
  // Authorization header'dan token al
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Token bulunamadı. Lütfen giriş yapın.' 
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Geçersiz veya süresi dolmuş token.' 
    });
  }

  // Token'dan alınan bilgileri request'e ekle
  req.user = decoded;
  next();
}

/**
 * Optional authentication middleware
 * Token varsa doğrula, yoksa devam et
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - İzin verilen roller
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Kimlik doğrulama gerekli.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Bu işlem için yetkiniz yok.' 
      });
    }

    next();
  };
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  authenticateToken,
  optionalAuth,
  requireRole,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
