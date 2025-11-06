const request = require('supertest');
const app = require('../src/app');

describe('API Routes Tests', () => {
  describe('GET /', () => {
    it('should return welcome message with visit count', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('version', '1.0.0');
      expect(res.body).toHaveProperty('visits');
      expect(res.body).toHaveProperty('hostname');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should increment visit counter', async () => {
      const res1 = await request(app).get('/');
      const visits1 = res1.body.visits;

      const res2 = await request(app).get('/');
      const visits2 = res2.body.visits;

      expect(visits2).toBeGreaterThan(visits1);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('should return uptime as a number', async () => {
      const res = await request(app).get('/health');

      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/user/:username', () => {
    it('should return user information', async () => {
      const username = 'alice';
      const res = await request(app).get(`/api/user/${username}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('username', username);
      expect(res.body).toHaveProperty('status', 'active');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should handle special characters in username', async () => {
      const username = 'user-123';
      const res = await request(app).get(`/api/user/${username}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe(username);
    });
  });

  describe('POST /api/calculate', () => {
    it('should calculate sum and product correctly', async () => {
      const res = await request(app)
        .post('/api/calculate')
        .send({ a: 10, b: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body.sum).toBe(15);
      expect(res.body.product).toBe(50);
      expect(res.body.difference).toBe(5);
      expect(res.body.quotient).toBe(2);
    });

    it('should return 400 if parameters are missing', async () => {
      const res = await request(app).post('/api/calculate').send({ a: 10 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 if parameters are not numbers', async () => {
      const res = await request(app)
        .post('/api/calculate')
        .send({ a: 'invalid', b: 5 });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid parameters');
    });

    it('should handle division by zero', async () => {
      const res = await request(app)
        .post('/api/calculate')
        .send({ a: 10, b: 0 });

      expect(res.statusCode).toBe(200);
      expect(res.body.quotient).toBeNull();
    });

    it('should handle negative numbers', async () => {
      const res = await request(app)
        .post('/api/calculate')
        .send({ a: -5, b: 3 });

      expect(res.statusCode).toBe(200);
      expect(res.body.sum).toBe(-2);
      expect(res.body.product).toBe(-15);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Route not found');
    });
  });

  describe('CORS and Security Headers', () => {
    it('should include CORS headers', async () => {
      const res = await request(app).get('/');

      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should include security headers from helmet', async () => {
      const res = await request(app).get('/');

      expect(res.headers).toHaveProperty('x-content-type-options');
    });
  });
});
