const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { ROLES } = require('../../src/constants/roles');

describe('Admin module', () => {
  it('rejects non-admins from every admin route', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app).get('/api/v1/admin/dashboard').set('Authorization', authHeader(accessToken));
    expect(res.status).toBe(403);
  });

  it('lists users with role filtering and pagination, and can deactivate one', async () => {
    const { accessToken: adminToken } = await createAdmin();
    const { user: customer } = await registerUser(ROLES.CUSTOMER);
    await registerUser(ROLES.RESTAURANT_OWNER);

    const listRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', authHeader(adminToken))
      .query({ role: ROLES.CUSTOMER, page: 1, limit: 10 });
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.every((u) => u.role === ROLES.CUSTOMER)).toBe(true);
    expect(listRes.body.meta).toMatchObject({ page: 1, limit: 10 });

    const deactivateRes = await request(app)
      .patch(`/api/v1/admin/users/${customer._id}/status`)
      .set('Authorization', authHeader(adminToken))
      .send({ isActive: false });
    expect(deactivateRes.status).toBe(200);
    expect(deactivateRes.body.data.isActive).toBe(false);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: customer.email, password: 'SuperSecret123' });
    expect(loginRes.status).toBe(403);
  });

  it('lists restaurants including unapproved ones, and can approve them', async () => {
    const { accessToken: adminToken } = await createAdmin();
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);

    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send({
        name: 'Admin Test Diner',
        cuisine: ['american'],
        address: { line1: '1 Test St', city: 'Testville', state: 'TS', postalCode: '00000', country: 'USA' },
        location: { coordinates: [0, 0] },
      });
    const restaurantId = restaurantRes.body.data._id;

    const pendingList = await request(app)
      .get('/api/v1/admin/restaurants')
      .set('Authorization', authHeader(adminToken))
      .query({ isApproved: false });
    expect(pendingList.body.data.some((r) => r._id === restaurantId)).toBe(true);

    const approveRes = await request(app)
      .patch(`/api/v1/admin/restaurants/${restaurantId}/approve`)
      .set('Authorization', authHeader(adminToken))
      .send({ isApproved: true });
    expect(approveRes.body.data.isApproved).toBe(true);
  });

  it('lists delivery partner profiles with the user populated', async () => {
    const { accessToken: adminToken } = await createAdmin();
    const { accessToken: partnerToken } = await registerUser(ROLES.DELIVERY_PARTNER);

    // Touching the profile endpoint lazily creates the DeliveryPartnerProfile document.
    await request(app).get('/api/v1/delivery/profile').set('Authorization', authHeader(partnerToken));

    const res = await request(app)
      .get('/api/v1/admin/delivery-partners')
      .set('Authorization', authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].user).toHaveProperty('name');
  });

  it('returns platform-wide dashboard analytics', async () => {
    const { accessToken: adminToken } = await createAdmin();
    const res = await request(app).get('/api/v1/admin/dashboard').set('Authorization', authHeader(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('usersByRole');
    expect(res.body.data).toHaveProperty('ordersByStatus');
    expect(res.body.data).toHaveProperty('totalRevenue');
  });
});
