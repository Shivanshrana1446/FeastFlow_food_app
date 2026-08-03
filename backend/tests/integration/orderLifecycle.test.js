const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { ROLES } = require('../../src/constants/roles');

describe('End-to-end order lifecycle across all four roles', () => {
  it('goes from cart to checkout to delivery to review', async () => {
    // --- Setup: owner creates and gets an approved, listed restaurant with a menu item ---
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);

    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send({
        name: 'Curry House',
        cuisine: ['indian'],
        address: { line1: '9 Spice Rd', city: 'Metropolis', state: 'NY', postalCode: '10001', country: 'USA' },
        location: { coordinates: [-73.98, 40.75] },
        minOrderAmount: 5,
      });
    expect(restaurantRes.status).toBe(201);
    const restaurantId = restaurantRes.body.data._id;

    const { accessToken: adminToken } = await createAdmin();
    const approveRes = await request(app)
      .patch(`/api/v1/admin/restaurants/${restaurantId}/approve`)
      .set('Authorization', authHeader(adminToken))
      .send({ isApproved: true });
    expect(approveRes.status).toBe(200);

    const categoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Curries' });
    const categoryId = categoryRes.body.data._id;

    const menuItemRes = await request(app)
      .post('/api/v1/menu-items')
      .set('Authorization', authHeader(ownerToken))
      .send({
        restaurant: restaurantId,
        category: categoryId,
        name: 'Butter Chicken',
        price: 15,
        addOns: [{ name: 'Extra Naan', price: 2 }],
      });
    const menuItemId = menuItemRes.body.data._id;

    // --- Customer: browse, cart, checkout ---
    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    const addToCartRes = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: menuItemId, quantity: 2, addOns: [{ name: 'Extra Naan', price: 999 }] });
    expect(addToCartRes.status).toBe(201);
    // Server resolves add-on price from the menu item definition, ignoring the forged client price.
    expect(addToCartRes.body.data.items[0].addOns[0].price).toBe(2);

    const cartRes = await request(app).get('/api/v1/cart').set('Authorization', authHeader(customerToken));
    expect(cartRes.body.data.items).toHaveLength(1);
    expect(cartRes.body.data.items[0].quantity).toBe(2);

    const placeOrderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', authHeader(customerToken))
      .send({
        deliveryAddress: {
          line1: '5 Home Ave',
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10002',
          country: 'USA',
        },
        paymentMethod: 'cashOnDelivery',
      });
    expect(placeOrderRes.status).toBe(201);
    const { order, payment } = placeOrderRes.body.data;
    expect(order.status).toBe('placed');
    // subtotal = (15 + 2) * 2 = 34
    expect(order.pricing.subtotal).toBe(34);
    expect(payment.status).toBe('pending'); // COD stays pending until delivered

    const emptiedCart = await request(app).get('/api/v1/cart').set('Authorization', authHeader(customerToken));
    expect(emptiedCart.body.data).toBeNull();

    // --- Restaurant owner: manage order through prep pipeline ---
    const ownerOrdersRes = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', authHeader(ownerToken));
    expect(ownerOrdersRes.body.data.some((o) => o._id === order._id)).toBe(true);

    for (const status of ['confirmed', 'preparing', 'readyForPickup']) {
      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', authHeader(ownerToken))
        .send({ status });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(status);
    }

    // A customer must never be able to push order status transitions themselves.
    const forbiddenRes = await request(app)
      .patch(`/api/v1/orders/${order._id}/status`)
      .set('Authorization', authHeader(customerToken))
      .send({ status: 'delivered' });
    expect(forbiddenRes.status).toBe(403);

    // --- Delivery partner: accept, pick up, deliver ---
    const { accessToken: partnerToken } = await registerUser(ROLES.DELIVERY_PARTNER);

    const availableRes = await request(app)
      .get('/api/v1/delivery/orders/available')
      .set('Authorization', authHeader(partnerToken));
    expect(availableRes.body.data.some((o) => o._id === order._id)).toBe(true);

    const acceptRes = await request(app)
      .patch(`/api/v1/delivery/orders/${order._id}/accept`)
      .set('Authorization', authHeader(partnerToken));
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe('assigned');

    const assignedRes = await request(app)
      .get('/api/v1/delivery/orders/assigned')
      .set('Authorization', authHeader(partnerToken));
    expect(assignedRes.body.data.some((o) => o._id === order._id)).toBe(true);

    const pickedUpRes = await request(app)
      .patch(`/api/v1/delivery/orders/${order._id}/picked-up`)
      .set('Authorization', authHeader(partnerToken));
    expect(pickedUpRes.body.data.status).toBe('pickedUp');

    const outForDeliveryRes = await request(app)
      .patch(`/api/v1/delivery/orders/${order._id}/out-for-delivery`)
      .set('Authorization', authHeader(partnerToken));
    expect(outForDeliveryRes.body.data.status).toBe('outForDelivery');

    const deliveredRes = await request(app)
      .patch(`/api/v1/delivery/orders/${order._id}/delivered`)
      .set('Authorization', authHeader(partnerToken));
    expect(deliveredRes.status).toBe(200);
    expect(deliveredRes.body.data.status).toBe('delivered');

    const historyRes = await request(app)
      .get('/api/v1/delivery/orders/history')
      .set('Authorization', authHeader(partnerToken));
    expect(historyRes.body.data.some((o) => o._id === order._id)).toBe(true);

    // COD payment should now be settled since the order was delivered.
    const paymentAfterDelivery = await request(app)
      .get(`/api/v1/payments/${payment._id}`)
      .set('Authorization', authHeader(customerToken));
    expect(paymentAfterDelivery.body.data.status).toBe('paid');

    // --- Customer: track order (status history) and review ---
    const trackRes = await request(app)
      .get(`/api/v1/orders/${order._id}`)
      .set('Authorization', authHeader(customerToken));
    expect(trackRes.body.data.status).toBe('delivered');
    const statuses = trackRes.body.data.statusHistory.map((h) => h.status);
    expect(statuses).toEqual([
      'placed',
      'confirmed',
      'preparing',
      'readyForPickup',
      'assigned',
      'pickedUp',
      'outForDelivery',
      'delivered',
    ]);

    const reviewRes = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', authHeader(customerToken))
      .send({ order: order._id, rating: 5, comment: 'Fantastic!' });
    expect(reviewRes.status).toBe(201);

    const duplicateReviewRes = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', authHeader(customerToken))
      .send({ order: order._id, rating: 4 });
    expect(duplicateReviewRes.status).toBe(409);

    const restaurantAfterReview = await request(app).get(`/api/v1/restaurants/${restaurantId}`);
    expect(restaurantAfterReview.body.data.ratingAvg).toBe(5);
    expect(restaurantAfterReview.body.data.ratingCount).toBe(1);

    const reviewsList = await request(app).get('/api/v1/reviews').query({ restaurant: restaurantId });
    expect(reviewsList.body.data).toHaveLength(1);

    // --- Owner: dashboard reflects the completed order ---
    const dashboardRes = await request(app)
      .get(`/api/v1/restaurants/${restaurantId}/dashboard`)
      .set('Authorization', authHeader(ownerToken));
    expect(dashboardRes.body.data.ordersByStatus.delivered).toBe(1);
    expect(dashboardRes.body.data.totalRevenue).toBeGreaterThan(0);
  });
});
