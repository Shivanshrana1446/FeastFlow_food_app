const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { createApprovedRestaurant, createMenuItem } = require('../helpers/fixtures');
const { ROLES } = require('../../src/constants/roles');

async function placeOrder(customerToken, menuItemId, paymentMethod = 'cashOnDelivery') {
  await request(app)
    .post('/api/v1/cart/items')
    .set('Authorization', authHeader(customerToken))
    .send({ menuItem: menuItemId, quantity: 1 });

  return request(app)
    .post('/api/v1/orders')
    .set('Authorization', authHeader(customerToken))
    .send({
      deliveryAddress: { line1: '1 Home Rd', city: 'Metropolis', state: 'NY', postalCode: '10001', country: 'USA' },
      paymentMethod,
    });
}

describe('Payment module', () => {
  it("lets the paying customer view their payment, but blocks other customers", async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    const orderRes = await placeOrder(customerToken, menuItemId);
    const paymentId = orderRes.body.data.payment._id;

    const ownRes = await request(app)
      .get(`/api/v1/payments/${paymentId}`)
      .set('Authorization', authHeader(customerToken));
    expect(ownRes.status).toBe(200);
    expect(ownRes.body.data.status).toBe('pending'); // COD stays pending until delivered

    const { accessToken: otherCustomerToken } = await registerUser(ROLES.CUSTOMER);
    const otherRes = await request(app)
      .get(`/api/v1/payments/${paymentId}`)
      .set('Authorization', authHeader(otherCustomerToken));
    expect(otherRes.status).toBe(403);

    const adminRes = await request(app)
      .get(`/api/v1/payments/${paymentId}`)
      .set('Authorization', authHeader(adminToken));
    expect(adminRes.status).toBe(200);
  });

  it('returns 404 for a nonexistent payment', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app)
      .get('/api/v1/payments/64b7f9c9f9c9f9c9f9c9f9c9')
      .set('Authorization', authHeader(accessToken));
    expect(res.status).toBe(404);
  });

  it('settles a card payment as paid immediately when the mock gateway approves it', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    const originalRandom = Math.random;
    Math.random = () => 0.99; // comfortably above the decline threshold
    let orderRes;
    try {
      orderRes = await placeOrder(customerToken, menuItemId, 'card');
    } finally {
      Math.random = originalRandom;
    }

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.payment.status).toBe('paid');
    expect(orderRes.body.data.payment.transactionId).toEqual(expect.stringContaining('SIM-'));
  });

  it('blocks checkout when the mock gateway declines the charge, leaving the cart intact', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    const originalRandom = Math.random;
    Math.random = () => 0; // guaranteed decline
    let orderRes;
    try {
      orderRes = await placeOrder(customerToken, menuItemId, 'upi');
    } finally {
      Math.random = originalRandom;
    }

    expect(orderRes.status).toBe(400);
    expect(orderRes.body.message).toEqual(expect.stringContaining('Payment failed'));

    const cartRes = await request(app).get('/api/v1/cart').set('Authorization', authHeader(customerToken));
    expect(cartRes.body.data.items).toHaveLength(1);

    const ordersRes = await request(app).get('/api/v1/orders').set('Authorization', authHeader(customerToken));
    expect(ordersRes.body.data).toHaveLength(0);
  });
});
