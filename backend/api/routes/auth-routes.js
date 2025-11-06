const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateToken
} = require('../middleware/auth-middleware');
const userService = require('../services/user-service');
const emailService = require('../services/email-service');

const router = express.Router();

// Rate limiting - Auth endpoint'leri için daha sıkı
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Her IP için 15 dakikada maksimum 5 istek
  message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false
});

// Input validation helper
function validateInput(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Girdi doğrulama hatası',
      errors: errors.array()
    });
  }
  next();
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - companyName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               companyName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [hammaddeci, uretici, toptanci, satici, musteri]
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla kaydedildi
 *       400:
 *         description: Validation hatası
 *       409:
 *         description: Email zaten kayıtlı
 */
router.post('/register',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir email adresi gerekli')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalı'),
    body('companyName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Şirket adı 2-100 karakter arasında olmalı'),
    body('role')
      .isIn(['hammaddeci', 'uretici', 'toptanci', 'satici', 'musteri'])
      .withMessage('Geçerli bir rol seçin')
  ],
  validateInput,
  async (req, res) => {
    try {
      const { email, password, companyName, role, phone, address } = req.body;

      // Kullanıcı zaten var mı kontrol et
      const existingUser = await userService.getUser(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Bu email adresi zaten kayıtlı.'
        });
      }

      // Şifreyi hash'le
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Kullanıcı oluştur
      const userData = {
        email,
        password: hashedPassword,
        companyName,
        role,
        phone: phone || '',
        address: address || '',
        hasTime: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await userService.saveUser(userData);

      // Token oluştur (şifreyi token'a ekleme)
      const tokenPayload = {
        userId: email,
        email,
        role,
        companyName
      };

      const accessToken = generateToken(tokenPayload, '15m');
      const refreshToken = generateRefreshToken({ userId: email });

      res.status(201).json({
        success: true,
        message: 'Kayıt başarılı',
        data: {
          user: {
            email,
            companyName,
            role
          },
          accessToken,
          refreshToken,
          expiresIn: '15m'
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Kayıt işlemi sırasında bir hata oluştu.'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *       401:
 *         description: Email veya şifre hatalı
 */
router.post('/login',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir email adresi gerekli')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Şifre gerekli')
  ],
  validateInput,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Kullanıcıyı bul
      const user = await userService.getUser(email);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Email veya şifre hatalı.'
        });
      }

      // Şifre kontrolü
      // Eğer kullanıcı eski sistemden geliyorsa (password hash yok), geçiş yap
      let passwordValid = false;
      if (user.password) {
        passwordValid = await bcrypt.compare(password, user.password);
      } else {
        // Eski sistem: SHA256 hash kontrolü (frontend'de yapılıyor)
        // Bu durumda frontend'den hash'lenmiş şifre gelir
        // Şimdilik sadece yeni kayıtlar için bcrypt kullanıyoruz
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Lütfen şifrenizi sıfırlayın veya yeni bir hesap oluşturun.'
        });
      }

      if (!passwordValid) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Email veya şifre hatalı.'
        });
      }

      // Token oluştur
      const tokenPayload = {
        userId: user.email,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      };

      const accessToken = generateToken(tokenPayload, '15m');
      const refreshToken = generateRefreshToken({ userId: user.email });

      res.json({
        success: true,
        message: 'Giriş başarılı',
        data: {
          user: {
            email: user.email,
            companyName: user.companyName,
            role: user.role,
            hasTime: user.hasTime || false
          },
          accessToken,
          refreshToken,
          expiresIn: '15m'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Giriş işlemi sırasında bir hata oluştu.'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Access token yenile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token başarıyla yenilendi
 *       401:
 *         description: Geçersiz refresh token
 */
router.post('/refresh',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token gerekli')
  ],
  validateInput,
  async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Geçersiz veya süresi dolmuş refresh token.'
        });
      }

      // Kullanıcıyı bul
      const user = await userService.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Kullanıcı bulunamadı.'
        });
      }

      // Yeni token oluştur
      const tokenPayload = {
        userId: user.email,
        email: user.email,
        role: user.role,
        companyName: user.companyName
      };

      const accessToken = generateToken(tokenPayload, '15m');
      const newRefreshToken = generateRefreshToken({ userId: user.email });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: '15m'
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Token yenileme sırasında bir hata oluştu.'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Token doğrula ve kullanıcı bilgilerini getir
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token geçerli
 *       401:
 *         description: Geçersiz token
 */
router.get('/verify',
  authenticateToken,
  async (req, res) => {
    try {
      // Token'dan kullanıcı bilgilerini al
      const user = await userService.getUser(req.user.email);
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Kullanıcı bulunamadı.'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            email: user.email,
            companyName: user.companyName,
            role: user.role,
            hasTime: user.hasTime || false
          }
        }
      });
    } catch (error) {
      console.error('Verify error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Token doğrulama sırasında bir hata oluştu.'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Kullanıcı çıkışı
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Çıkış başarılı
 */
router.post('/logout',
  authenticateToken,
  async (req, res) => {
    // JWT stateless olduğu için backend'de özel bir işlem yok
    // Frontend'de token'ı silmek yeterli
    // İsterseniz refresh token'ları blacklist'e ekleyebilirsiniz
    res.json({
      success: true,
      message: 'Çıkış başarılı'
    });
  }
);

// In-memory reset token storage (production'da DynamoDB kullanılmalı)
const resetTokens = new Map(); // key: token, value: { email, expiresAt }

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Şifre sıfırlama talebi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Şifre sıfırlama email'i gönderildi
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.post('/forgot-password',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir email adresi gerekli')
      .normalizeEmail()
  ],
  validateInput,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Kullanıcıyı bul
      const user = await userService.getUser(email);
      if (!user) {
        // Güvenlik için: Kullanıcı yoksa da başarılı mesaj döndür
        return res.json({
          success: true,
          message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.'
        });
      }

      // Reset token oluştur
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

      // Token'ı sakla
      resetTokens.set(resetToken, {
        email: user.email,
        expiresAt: expiresAt.toISOString()
      });

      // Eski token'ları temizle (aynı email için)
      for (const [token, data] of resetTokens.entries()) {
        if (data.email === user.email && new Date(data.expiresAt) < new Date()) {
          resetTokens.delete(token);
        }
      }

      // Reset URL oluştur
      const resetUrl = `${process.env.FRONTEND_URL || 'https://basvideo.com'}/reset-password.html?token=${resetToken}`;

      // Email gönder
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken, resetUrl);
      } catch (emailError) {
        console.error('Email gönderme hatası:', emailError);
        // Email gönderilemese bile token oluşturuldu, kullanıcıya bilgi ver
      }

      res.json({
        success: true,
        message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Şifre sıfırlama talebi sırasında bir hata oluştu.'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Şifre sıfırla
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Şifre başarıyla sıfırlandı
 *       400:
 *         description: Geçersiz token veya şifre
 *       404:
 *         description: Token bulunamadı veya süresi dolmuş
 */
router.post('/reset-password',
  authLimiter,
  [
    body('token')
      .notEmpty()
      .withMessage('Token gerekli'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Şifre en az 6 karakter olmalı')
  ],
  validateInput,
  async (req, res) => {
    try {
      const { token, password } = req.body;

      // Token'ı kontrol et
      const tokenData = resetTokens.get(token);
      if (!tokenData) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Geçersiz veya süresi dolmuş token.'
        });
      }

      // Token süresi kontrolü
      if (new Date(tokenData.expiresAt) < new Date()) {
        resetTokens.delete(token);
        return res.status(404).json({
          error: 'Not Found',
          message: 'Token süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun.'
        });
      }

      // Kullanıcıyı bul
      const user = await userService.getUser(tokenData.email);
      if (!user) {
        resetTokens.delete(token);
        return res.status(404).json({
          error: 'Not Found',
          message: 'Kullanıcı bulunamadı.'
        });
      }

      // Yeni şifreyi hash'le
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Şifreyi güncelle
      await userService.updateUserPassword(tokenData.email, hashedPassword);

      // Token'ı sil (tek kullanımlık)
      resetTokens.delete(token);

      res.json({
        success: true,
        message: 'Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Şifre sıfırlama sırasında bir hata oluştu.'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   get:
 *     summary: Reset token doğrula
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token geçerli
 *       404:
 *         description: Token geçersiz veya süresi dolmuş
 */
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token gerekli'
      });
    }

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Geçersiz token.'
      });
    }

    if (new Date(tokenData.expiresAt) < new Date()) {
      resetTokens.delete(token);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Token süresi dolmuş.'
      });
    }

    res.json({
      success: true,
      message: 'Token geçerli'
    });
  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Token doğrulama sırasında bir hata oluştu.'
    });
  }
});

// In-memory verification token storage (production'da DynamoDB kullanılmalı)
const verificationTokens = new Map(); // key: token, value: { email, expiresAt }

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Email doğrulama
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email başarıyla doğrulandı
 *       400:
 *         description: Geçersiz token
 *       404:
 *         description: Token bulunamadı veya süresi dolmuş
 */
router.post('/verify-email',
  [
    body('token')
      .notEmpty()
      .withMessage('Token gerekli')
  ],
  validateInput,
  async (req, res) => {
    try {
      const { token } = req.body;

      // Token'ı kontrol et
      const tokenData = verificationTokens.get(token);
      if (!tokenData) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Geçersiz veya süresi dolmuş token.'
        });
      }

      // Token süresi kontrolü
      if (new Date(tokenData.expiresAt) < new Date()) {
        verificationTokens.delete(token);
        return res.status(404).json({
          error: 'Not Found',
          message: 'Token süresi dolmuş.'
        });
      }

      // Kullanıcıyı bul ve email'i doğrula
      const user = await userService.getUser(tokenData.email);
      if (!user) {
        verificationTokens.delete(token);
        return res.status(404).json({
          error: 'Not Found',
          message: 'Kullanıcı bulunamadı.'
        });
      }

      // Email'i doğrula (user objesine emailVerified field'ı eklenebilir)
      user.emailVerified = true;
      user.updatedAt = new Date().toISOString();
      await userService.saveUser(user);

      // Token'ı sil
      verificationTokens.delete(token);

      res.json({
        success: true,
        message: 'Email adresiniz başarıyla doğrulandı.'
      });
    } catch (error) {
      console.error('Verify email error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Email doğrulama sırasında bir hata oluştu.'
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Email doğrulama linki yeniden gönder
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Doğrulama email'i gönderildi
 */
router.post('/resend-verification',
  authLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Geçerli bir email adresi gerekli')
      .normalizeEmail()
  ],
  validateInput,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Kullanıcıyı bul
      const user = await userService.getUser(email);
      if (!user) {
        // Güvenlik için: Kullanıcı yoksa da başarılı mesaj döndür
        return res.json({
          success: true,
          message: 'Eğer bu email adresi kayıtlıysa, doğrulama bağlantısı gönderildi.'
        });
      }

      // Verification token oluştur
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

      // Token'ı sakla
      verificationTokens.set(verificationToken, {
        email: user.email,
        expiresAt: expiresAt.toISOString()
      });

      // Verification URL oluştur
      const verificationUrl = `${process.env.FRONTEND_URL || 'https://basvideo.com'}/verify-email.html?token=${verificationToken}`;

      // Email gönder (email service'e verification email fonksiyonu eklenebilir)
      try {
        // await emailService.sendVerificationEmail(user.email, verificationToken, verificationUrl);
        console.log('Verification email would be sent to:', user.email);
      } catch (emailError) {
        console.error('Email gönderme hatası:', emailError);
      }

      res.json({
        success: true,
        message: 'Eğer bu email adresi kayıtlıysa, doğrulama bağlantısı gönderildi.'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Doğrulama email'i gönderilirken bir hata oluştu.'
      });
    }
  }
);

module.exports = router;
