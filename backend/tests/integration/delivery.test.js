const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { createApprovedRestaurant, createMenuItem } = require('../helpers/fixtures');
const { ROLES } = require('../../src/constants/roles');

async function createReadyForPickupOrder() {
  const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
  const { accessToken: adminToken } = await createAdmin();
  const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
  const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 12 });

  const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
  await request(app)
    .post('/api/v1/cart/items')
    .set('Authorization', authHeader(customerToken))
    .send({ menuItem: menuItemId, quantity: 1 });
  const orderRes = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', authHeader(customerToken))
    .send({
      deliveryAddress: { line1: '1 Home Rd', city: 'Metropolis', state: 'NY', postalCode: '10001', country: 'USA' },
      paymentMethod: 'cashOnDelivery',
    });
  const orderId = orderRes.body.data.order._id;

  for (const status of ['confirmed', 'preparing', 'readyForPickup']) {
    await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', authHeader(ownerToken))
      .send({ status });
  }

  return orderId;
}

describe('Delivery partner profile module', () => {
  it('rejects non-delivery-partner roles from every delivery route', async () => {
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app).get('/api/v1/delivery/profile').set('Authorization', authHeader(customerToken));
    expect(res.status).toBe(403);
  });

  it('lazily creates a profile on first access, with sensible defaults', async () => {
    const { accessToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const res = await request(app).get('/api/v1/delivery/profile').set('Authorization', authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data.vehicleType).toBe('bike');
    expect(res.body.data.isAvailable).toBe(false);
  });

  it('updates vehicle details', async () => {
    const { accessToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const res = await request(app)
      .patch('/api/v1/delivery/profile')
      .set('Authorization', authHeader(accessToken))
      .send({ vehicleType: 'scooter', vehicleNumber: 'DL01AB1234' });
    expect(res.status).toBe(200);
    expect(res.body.data.vehicleType).toBe('scooter');
    expect(res.body.data.vehicleNumber).toBe('DL01AB1234');
  });

  it('toggles availability', async () => {
    const { accessToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const onRes = await request(app)
      .patch('/api/v1/delivery/availability')
      .set('Authorization', authHeader(accessToken))
      .send({ isAvailable: true });
    expect(onRes.body.data.isAvailable).toBe(true);

    const offRes = await request(app)
      .patch('/api/v1/delivery/availability')
      .set('Authorization', authHeader(accessToken))
      .send({ isAvailable: false });
    expect(offRes.body.data.isAvailable).toBe(false);
  });

  it('updates live location as a GeoJSON point', async () => {
    const { accessToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const res = await request(app)
      .patch('/api/v1/delivery/location')
      .set('Authorization', authHeader(accessToken))
      .send({ coordinates: [77.5946, 12.9716] });
    expect(res.status).toBe(200);
    expect(res.body.data.currentLocation.coordinates).toEqual([77.5946, 12.9716]);
  });

  it('rejects malformed coordinates', async () => {
    const { accessToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const res = await request(app)
      .patch('/api/v1/delivery/location')
      .set('Authorization', authHeader(accessToken))
      .send({ coordinates: [1] });
    expect(res.status).toBe(400);
  });

  it('returns empty lists for available/assigned/history when there is no activity yet', async () => {
    const { accessToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const [available, assigned, history] = await Promise.all([
      request(app).get('/api/v1/delivery/orders/available').set('Authorization', authHeader(accessToken)),
      request(app).get('/api/v1/delivery/orders/assigned').set('Authorization', authHeader(accessToken)),
      request(app).get('/api/v1/delivery/orders/history').set('Authorization', authHeader(accessToken)),
    ]);
    expect(available.body.data).toEqual([]);
    expect(assigned.body.data).toEqual([]);
    expect(history.body.data).toEqual([]);
  });
});

describe('Order acceptance is claim-safe under concurrency', () => {
  it('lets only one of two simultaneous accept requests win, the other gets a conflict', async () => {
    const orderId = await createReadyForPickupOrder();
    const { accessToken: partnerAToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const { accessToken: partnerBToken } = await registerUser(ROLES.DELIVERY_PARTNER);

    const [resA, resB] = await Promise.all([
      request(app).patch(`/api/v1/delivery/orders/${orderId}/accept`).set('Authorization', authHeader(partnerAToken)),
      request(app).patch(`/api/v1/delivery/orders/${orderId}/accept`).set('Authorization', authHeader(partnerBToken)),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([200, 409]);

    const winner = resA.status === 200 ? resA : resB;
    const finalOrder = await request(app)
      .get(`/api/v1/orders/${orderId}`)
      .set('Authorization', authHeader(winner.body.data.deliveryPartner ? partnerAToken : partnerBToken));
    expect(finalOrder.body.data.status).toBe('assigned');
  });

  it('rejects a second accept attempt against an order already assigned to someone else', async () => {
    const orderId = await createReadyForPickupOrder();
    const { accessToken: firstPartnerToken } = await registerUser(ROLES.DELIVERY_PARTNER);
    const { accessToken: secondPartnerToken } = await registerUser(ROLES.DELIVERY_PARTNER);

    const firstRes = await request(app)
      .patch(`/api/v1/delivery/orders/${orderId}/accept`)
      .set('Authorization', authHeader(firstPartnerToken));
    expect(firstRes.status).toBe(200);

    const secondRes = await request(app)
      .patch(`/api/v1/delivery/orders/${orderId}/accept`)
      .set('Authorization', authHeader(secondPartnerToken));
    expect(secondRes.status).toBe(409);
  });
});
