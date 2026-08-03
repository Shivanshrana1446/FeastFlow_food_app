process.env.ADMIN_BOOTSTRAP_SECRET = 'test_bootstrap_secret_at_least_16_chars';

const request = require('supertest');
const app = require('../../src/app');
const { registerUser } = require('../helpers/auth');

const SECRET = process.env.ADMIN_BOOTSTRAP_SECRET;

describe('POST /auth/bootstrap-admin', () => {
  it('creates a new admin account when the secret matches', async () => {
    const res = await request(app).post('/api/v1/auth/bootstrap-admin').send({
      name: 'Site Admin',
      email: 'newadmin@example.com',
      password: 'SuperSecret123',
      secret: SECRET,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.user.email).toBe('newadmin@example.com');
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('promotes an existing account to admin without touching its password', async () => {
    const { user } = await registerUser('customer', { email: 'promote-me@example.com', password: 'OriginalPass123' });
    expect(user.role).toBe('customer');

    const res = await request(app).post('/api/v1/auth/bootstrap-admin').send({
      name: 'Ignored on promotion',
      email: 'promote-me@example.com',
      password: 'IgnoredPassword123',
      secret: SECRET,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'promote-me@example.com', password: 'OriginalPass123' });
    expect(login.status).toBe(200);
    expect(login.body.data.user.role).toBe('admin');
  });

  it('rejects a wrong secret with 403', async () => {
    const res = await request(app).post('/api/v1/auth/bootstrap-admin').send({
      name: 'Nope',
      email: 'nope@example.com',
      password: 'SuperSecret123',
      secret: 'totally-wrong-secret',
    });
    expect(res.status).toBe(403);
  });

  it('rejects a missing secret with 400', async () => {
    const res = await request(app).post('/api/v1/auth/bootstrap-admin').send({
      name: 'Nope',
      email: 'nope2@example.com',
      password: 'SuperSecret123',
    });
    expect(res.status).toBe(400);
  });
});
