const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/v1/health', () => {
  it('returns 200 with a healthy payload', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('database', 'connected');
  });
});

describe('GET /unknown-route', () => {
  it('returns a 404 shaped by the global error handler', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
