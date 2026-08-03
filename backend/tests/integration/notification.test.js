const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { ROLES } = require('../../src/constants/roles');

describe('Notification module', () => {
  it('notifies a restaurant owner when a new order is placed, and lets them read it', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);

    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send({
        name: 'Notify Diner',
        cuisine: ['thai'],
        address: { line1: '1 Bell St', city: 'Ringtown', state: 'RT', postalCode: '11111', country: 'USA' },
        location: { coordinates: [0, 0] },
      });
    const restaurantId = restaurantRes.body.data._id;

    const { accessToken: adminToken } = await createAdmin();
    await request(app)
      .patch(`/api/v1/admin/restaurants/${restaurantId}/approve`)
      .set('Authorization', authHeader(adminToken))
      .send({ isApproved: true });

    const categoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Curries' });
    const menuItemRes = await request(app)
      .post('/api/v1/menu-items')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, category: categoryRes.body.data._id, name: 'Pad Thai', price: 12 });

    // Before any order, the owner has no notifications.
    const beforeRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', authHeader(ownerToken));
    expect(beforeRes.body.meta.unreadCount).toBe(0);

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: menuItemRes.body.data._id, quantity: 1 });
    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', authHeader(customerToken))
      .send({
        deliveryAddress: { line1: '2 Home Rd', city: 'Ringtown', state: 'RT', postalCode: '22222', country: 'USA' },
        paymentMethod: 'cashOnDelivery',
      });

    const afterRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', authHeader(ownerToken));
    expect(afterRes.status).toBe(200);
    expect(afterRes.body.meta.unreadCount).toBe(1);
    expect(afterRes.body.data).toHaveLength(1);
    expect(afterRes.body.data[0].type).toBe('order_placed');
    expect(afterRes.body.data[0].isRead).toBe(false);

    const notificationId = afterRes.body.data[0]._id;
    const readRes = await request(app)
      .patch(`/api/v1/notifications/${notificationId}/read`)
      .set('Authorization', authHeader(ownerToken));
    expect(readRes.status).toBe(200);
    expect(readRes.body.data.isRead).toBe(true);

    const afterReadRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', authHeader(ownerToken));
    expect(afterReadRes.body.meta.unreadCount).toBe(0);
  });

  it('notifies the customer as their order moves through status changes', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send({
        name: 'Status Diner',
        cuisine: ['mexican'],
        address: { line1: '1 Taco St', city: 'Saltillo', state: 'SL', postalCode: '33333', country: 'USA' },
        location: { coordinates: [0, 0] },
      });
    const restaurantId = restaurantRes.body.data._id;

    const { accessToken: adminToken } = await createAdmin();
    await request(app)
      .patch(`/api/v1/admin/restaurants/${restaurantId}/approve`)
      .set('Authorization', authHeader(adminToken))
      .send({ isApproved: true });

    const categoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Tacos' });
    const menuItemRes = await request(app)
      .post('/api/v1/menu-items')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, category: categoryRes.body.data._id, name: 'Al Pastor', price: 9 });

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: menuItemRes.body.data._id, quantity: 1 });
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', authHeader(customerToken))
      .send({
        deliveryAddress: { line1: '2 Home Rd', city: 'Saltillo', state: 'SL', postalCode: '44444', country: 'USA' },
        paymentMethod: 'cashOnDelivery',
      });
    const orderId = orderRes.body.data.order._id;

    await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', authHeader(ownerToken))
      .send({ status: 'confirmed' });

    const notifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', authHeader(customerToken));
    expect(notifRes.body.data.some((n) => n.type === 'order_status_changed')).toBe(true);
  });

  it('marks all notifications as read in one call', async () => {
    const { accessToken: adminToken } = await createAdmin();
    // Admin has no notifications generated in this test; verify the endpoint is idempotent/safe on an empty set.
    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', authHeader(adminToken));
    expect(res.status).toBe(200);
  });

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });
});
