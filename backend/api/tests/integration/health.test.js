/**
 * Health Check Integration Tests
 */

const request = require('supertest');
const app = require('../../app');

describe('Health Check', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('version');
    });

    it('should have correct status structure', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(['ok', 'degraded', 'error']).toContain(response.body.status);
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('aws');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp).toBeInstanceOf(Date);
    });

    it('should return valid uptime', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return environment info', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.environment).toBeDefined();
      expect(['development', 'test', 'production']).toContain(response.body.environment);
    });

    it('should return service status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.services.database).toBeDefined();
      expect(response.body.services.aws).toBeDefined();
    });
  });
});
