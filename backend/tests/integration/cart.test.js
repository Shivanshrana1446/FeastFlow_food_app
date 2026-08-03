const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { createApprovedRestaurant, createMenuItem } = require('../helpers/fixtures');
const { ROLES } = require('../../src/constants/roles');

describe('Cart module', () => {
  it('requires authentication and the customer role', async () => {
    const anonRes = await request(app).get('/api/v1/cart');
    expect(anonRes.status).toBe(401);

    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const ownerRes = await request(app).get('/api/v1/cart').set('Authorization', authHeader(ownerToken));
    expect(ownerRes.status).toBe(403);
  });

  it('returns null for an empty cart', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app).get('/api/v1/cart').set('Authorization', authHeader(accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it('adds, updates quantity, and removes an item', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 15 });

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    const addRes = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: menuItemId, quantity: 2 });
    expect(addRes.status).toBe(201);
    expect(addRes.body.data.items[0].quantity).toBe(2);
    const itemId = addRes.body.data.items[0]._id;

    const updateRes = await request(app)
      .patch(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', authHeader(customerToken))
      .send({ quantity: 5 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.items[0].quantity).toBe(5);

    const removeRes = await request(app)
      .delete(`/api/v1/cart/items/${itemId}`)
      .set('Authorization', authHeader(customerToken));
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data.items).toHaveLength(0);
  });

  it('replaces the cart when adding an item from a different restaurant', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();

    const restaurantAId = await createApprovedRestaurant(ownerToken, adminToken, { name: 'Restaurant A' });
    const { menuItemId: itemA } = await createMenuItem(ownerToken, restaurantAId, { name: 'Dish A' });

    const { accessToken: ownerTokenB } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantBId = await createApprovedRestaurant(ownerTokenB, adminToken, { name: 'Restaurant B' });
    const { menuItemId: itemB } = await createMenuItem(ownerTokenB, restaurantBId, { name: 'Dish B' });

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: itemA, quantity: 1 });

    const switchRes = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: itemB, quantity: 1 });

    expect(switchRes.status).toBe(201);
    expect(switchRes.body.data.items).toHaveLength(1);
    expect(switchRes.body.data.items[0].name).toBe('Dish B');
    expect(switchRes.body.data.restaurant).toBe(restaurantBId);
  });

  it('rejects adding an unavailable menu item', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId);

    await request(app)
      .patch(`/api/v1/menu-items/${menuItemId}`)
      .set('Authorization', authHeader(ownerToken))
      .send({ isAvailable: false });

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: menuItemId, quantity: 1 });
    expect(res.status).toBe(400);
  });

  it('resolves add-on prices from the menu item, ignoring a forged client price', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, {
      addOns: [{ name: 'Extra Sauce', price: 3 }],
    });

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: menuItemId, quantity: 1, addOns: [{ name: 'Extra Sauce', price: 999 }] });

    expect(res.status).toBe(201);
    expect(res.body.data.items[0].addOns[0].price).toBe(3);
  });

  it('clears the cart entirely', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId);

    const { accessToken: customerToken } = await registerUser(ROLES.CUSTOMER);
    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', authHeader(customerToken))
      .send({ menuItem: menuItemId, quantity: 1 });

    const clearRes = await request(app).delete('/api/v1/cart').set('Authorization', authHeader(customerToken));
    expect(clearRes.status).toBe(200);

    const getRes = await request(app).get('/api/v1/cart').set('Authorization', authHeader(customerToken));
    expect(getRes.body.data).toBeNull();
  });
});
