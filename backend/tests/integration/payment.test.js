const crypto = require('crypto');
const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { createApprovedRestaurant, createMenuItem } = require('../helpers/fixtures');
const { ROLES } = require('../../src/constants/roles');

function razorpaySignatureFor(orderId, paymentId) {
  return crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

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

  it('creates a Razorpay order at checkout and leaves the payment pending until verified', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    const orderRes = await placeOrder(customerToken, menuItemId, 'razorpay');

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.payment.status).toBe('pending');
    expect(orderRes.body.data.payment.gatewayOrderId).toEqual(expect.stringContaining('order_test_fake_'));
    expect(orderRes.body.data.razorpayOrder.id).toBe(orderRes.body.data.payment.gatewayOrderId);
    expect(orderRes.body.data.razorpayKeyId).toBe(process.env.RAZORPAY_KEY_ID);
  });

  it('marks the payment paid once the Razorpay signature verifies', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    const orderRes = await placeOrder(customerToken, menuItemId, 'razorpay');
    const razorpayOrderId = orderRes.body.data.razorpayOrder.id;
    const razorpayPaymentId = 'pay_test_fake_1';

    const verifyRes = await request(app)
      .post('/api/v1/payments/razorpay/verify')
      .set('Authorization', authHeader(customerToken))
      .send({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: razorpaySignatureFor(razorpayOrderId, razorpayPaymentId),
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.status).toBe('paid');
    expect(verifyRes.body.data.transactionId).toBe(razorpayPaymentId);
  });

  it('rejects verification with a forged signature and leaves the payment pending', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    const orderRes = await placeOrder(customerToken, menuItemId, 'razorpay');
    const razorpayOrderId = orderRes.body.data.razorpayOrder.id;

    const verifyRes = await request(app)
      .post('/api/v1/payments/razorpay/verify')
      .set('Authorization', authHeader(customerToken))
      .send({ razorpayOrderId, razorpayPaymentId: 'pay_test_fake_2', razorpaySignature: 'not-the-real-signature' });

    expect(verifyRes.status).toBe(400);

    const paymentId = orderRes.body.data.payment._id;
    const paymentRes = await request(app)
      .get(`/api/v1/payments/${paymentId}`)
      .set('Authorization', authHeader(customerToken));
    expect(paymentRes.body.data.status).toBe('pending');
  });

  it("rejects verifying someone else's payment", async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    const { accessToken: otherCustomerToken } = await registerUser(ROLES.CUSTOMER);

    const orderRes = await placeOrder(customerToken, menuItemId, 'razorpay');
    const razorpayOrderId = orderRes.body.data.razorpayOrder.id;
    const razorpayPaymentId = 'pay_test_fake_3';

    const verifyRes = await request(app)
      .post('/api/v1/payments/razorpay/verify')
      .set('Authorization', authHeader(otherCustomerToken))
      .send({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: razorpaySignatureFor(razorpayOrderId, razorpayPaymentId),
      });

    expect(verifyRes.status).toBe(403);
  });
});
