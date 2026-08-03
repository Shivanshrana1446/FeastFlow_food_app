const path = require('path');
const request = require('supertest');
const app = require('../../src/app');
const { registerUser, authHeader } = require('../helpers/auth');
const { ROLES } = require('../../src/constants/roles');

const FIXTURE_IMAGE = path.join(__dirname, '../fixtures/tiny.png');

describe('User profile module', () => {
  it('lets a user fetch and update their own profile', async () => {
    const { user, accessToken } = await registerUser(ROLES.CUSTOMER);

    const getRes = await request(app).get(`/api/v1/users/${user._id}`).set('Authorization', authHeader(accessToken));
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.email).toBe(user.email);
    expect(getRes.body.data.password).toBeUndefined();

    const updateRes = await request(app)
      .patch(`/api/v1/users/${user._id}`)
      .set('Authorization', authHeader(accessToken))
      .send({ name: 'Updated Name', phone: '5550001111' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Updated Name');
    expect(updateRes.body.data.phone).toBe('5550001111');
  });

  it("prevents a user from viewing or editing someone else's profile", async () => {
    const { user: userA } = await registerUser(ROLES.CUSTOMER);
    const { accessToken: tokenB } = await registerUser(ROLES.CUSTOMER);

    const getRes = await request(app).get(`/api/v1/users/${userA._id}`).set('Authorization', authHeader(tokenB));
    expect(getRes.status).toBe(403);

    const patchRes = await request(app)
      .patch(`/api/v1/users/${userA._id}`)
      .set('Authorization', authHeader(tokenB))
      .send({ name: 'Hijacked' });
    expect(patchRes.status).toBe(403);
  });

  it('requires authentication for profile routes', async () => {
    const { user } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app).get(`/api/v1/users/${user._id}`);
    expect(res.status).toBe(401);
  });

  it('manages the address book: add, update, remove', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);

    const addRes = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', authHeader(accessToken))
      .send({ label: 'Home', line1: '1 Main St', city: 'Metropolis', state: 'NY', postalCode: '10001' });
    expect(addRes.status).toBe(201);
    expect(addRes.body.data.addresses).toHaveLength(1);
    const addressId = addRes.body.data.addresses[0]._id;

    const updateRes = await request(app)
      .patch(`/api/v1/users/me/addresses/${addressId}`)
      .set('Authorization', authHeader(accessToken))
      .send({ label: 'Work' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.addresses[0].label).toBe('Work');

    const removeRes = await request(app)
      .delete(`/api/v1/users/me/addresses/${addressId}`)
      .set('Authorization', authHeader(accessToken));
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data.addresses).toHaveLength(0);
  });

  it('rejects an invalid address payload with 400', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app)
      .post('/api/v1/users/me/addresses')
      .set('Authorization', authHeader(accessToken))
      .send({ line1: '' });
    expect(res.status).toBe(400);
  });

  it('uploads a profile avatar', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);

    const res = await request(app)
      .patch('/api/v1/users/me/avatar')
      .set('Authorization', authHeader(accessToken))
      .attach('avatar', FIXTURE_IMAGE);

    expect(res.status).toBe(200);
    expect(res.body.data.avatarUrl).toEqual(expect.stringContaining('https://res.cloudinary.com/'));
    expect(res.body.data.avatarPublicId).toBeUndefined();
  });

  it('rejects an avatar upload with no file attached', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app).patch('/api/v1/users/me/avatar').set('Authorization', authHeader(accessToken));
    expect(res.status).toBe(400);
  });

  it('requires authentication to upload an avatar', async () => {
    const res = await request(app).patch('/api/v1/users/me/avatar');
    expect(res.status).toBe(401);
  });
});
