const request = require('supertest');
const app = require('../../src/app');

const credentials = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  password: 'SuperSecret123',
};

function extractRefreshCookie(res) {
  const setCookie = res.headers['set-cookie'] || [];
  return setCookie.find((c) => c.startsWith('refreshToken='));
}

describe('Auth flow', () => {
  it('registers a new customer and returns an access token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(extractRefreshCookie(res)).toBeDefined();
  });

  it('rejects duplicate registration with 409', async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);
    const res = await request(app).post('/api/v1/auth/register').send(credentials);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid input with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);

    const good = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    expect(good.status).toBe(200);
    expect(good.body.data).toHaveProperty('accessToken');

    const bad = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: 'wrongpassword' });
    expect(bad.status).toBe(401);
  });

  it('returns the current user for GET /auth/me with a valid token', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(credentials);
    const { accessToken } = registerRes.body.data;

    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(credentials.email);
  });

  it('rejects /auth/me without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rotates tokens via /auth/refresh-token using the httpOnly cookie', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(credentials);
    const cookie = extractRefreshCookie(registerRes);

    const res = await request(app).post('/api/v1/auth/refresh-token').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('logs out and clears the refresh cookie', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(credentials);
    const { accessToken } = registerRes.body.data;

    const res = await request(app).post('/api/v1/auth/logout').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('disables /auth/bootstrap-admin entirely when ADMIN_BOOTSTRAP_SECRET is not configured', async () => {
    const res = await request(app).post('/api/v1/auth/bootstrap-admin').send({
      name: 'Should Not Work',
      email: 'should-not-work@example.com',
      password: 'SuperSecret123',
      secret: 'any-value-at-all',
    });
    expect(res.status).toBe(403);
  });
});
