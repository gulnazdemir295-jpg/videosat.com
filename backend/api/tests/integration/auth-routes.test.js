/**
 * Auth Routes Integration Tests
 * 
 * Bu testler gerçek HTTP istekleri yapar
 * Backend server'ın çalışıyor olması gerekir
 */

const request = require('supertest');
const app = require('../../app');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'test123456',
        companyName: 'Test Company',
        role: 'musteri'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'test123456',
          companyName: 'Test',
          role: 'musteri'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should reject short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '12345',
          companyName: 'Test',
          role: 'musteri'
        })
        .expect(400);
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: `duplicate${Date.now()}@example.com`,
        password: 'test123456',
        companyName: 'Test Company',
        role: 'musteri'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser = {
      email: `login${Date.now()}@example.com`,
      password: 'test123456',
      companyName: 'Test Company',
      role: 'musteri'
    };

    beforeAll(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'test123456'
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should accept forgot password request', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid email format', async () => {
      await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .expect(400);
    });
  });

  describe('GET /api/auth/verify', () => {
    let accessToken;

    beforeAll(async () => {
      // Register and login to get token
      const userData = {
        email: `verify${Date.now()}@example.com`,
        password: 'test123456',
        companyName: 'Test Company',
        role: 'musteri'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/auth/verify')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(403);
    });
  });
});

