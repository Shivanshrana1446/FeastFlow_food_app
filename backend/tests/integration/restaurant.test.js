const path = require('path');
const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { ROLES } = require('../../src/constants/roles');

const FIXTURE_IMAGE = path.join(__dirname, '../fixtures/tiny.png');

const restaurantPayload = {
  name: "Tony's Pizzeria",
  description: 'Wood-fired pizza',
  cuisine: ['italian', 'pizza'],
  address: { line1: '1 Main St', city: 'Springfield', state: 'IL', postalCode: '62701', country: 'USA' },
  location: { coordinates: [-89.65, 39.78] },
  minOrderAmount: 10,
};

describe('Restaurant module', () => {
  it('lists only the caller\'s own restaurants via /restaurants/mine, including unapproved ones', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: otherOwnerToken } = await registerUser(ROLES.RESTAURANT_OWNER);

    const mine = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(otherOwnerToken))
      .send({ ...restaurantPayload, name: 'Other Place' });

    const res = await request(app).get('/api/v1/restaurants/mine').set('Authorization', authHeader(ownerToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]._id).toBe(mine.body.data._id);
    expect(res.body.data[0].isApproved).toBe(false);
  });

  it('rejects restaurant creation from an unauthenticated caller', async () => {
    const res = await request(app).post('/api/v1/restaurants').send(restaurantPayload);
    expect(res.status).toBe(401);
  });

  it('rejects restaurant creation from a customer', async () => {
    const { accessToken } = await registerUser(ROLES.CUSTOMER);
    const res = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(accessToken))
      .send(restaurantPayload);
    expect(res.status).toBe(403);
  });

  it('rejects an invalid restaurant payload with 400', async () => {
    const { accessToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const res = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(accessToken))
      .send({ name: 'A' });
    expect(res.status).toBe(400);
  });

  it('lets a restaurantOwner create a restaurant, category, and menu item', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);

    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    expect(restaurantRes.status).toBe(201);
    expect(restaurantRes.body.data.isApproved).toBe(false);
    const restaurantId = restaurantRes.body.data._id;

    const categoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Pizzas' });
    expect(categoryRes.status).toBe(201);

    const menuItemRes = await request(app)
      .post('/api/v1/menu-items')
      .set('Authorization', authHeader(ownerToken))
      .send({
        restaurant: restaurantId,
        category: categoryRes.body.data._id,
        name: 'Margherita',
        price: 12,
        isVeg: true,
      });
    expect(menuItemRes.status).toBe(201);

    const menuRes = await request(app).get(`/api/v1/restaurants/${restaurantId}/menu`);
    expect(menuRes.status).toBe(200);
    expect(menuRes.body.data.categories).toHaveLength(1);
    expect(menuRes.body.data.categories[0].items).toHaveLength(1);
    expect(menuRes.body.data.categories[0].items[0].name).toBe('Margherita');
  });

  it('excludes unapproved restaurants from public search until an admin approves them', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    const beforeApproval = await request(app).get('/api/v1/restaurants').query({ q: "Tony's" });
    expect(beforeApproval.body.data.find((r) => r._id === restaurantId)).toBeUndefined();

    const { accessToken: adminToken } = await createAdmin();
    const approveRes = await request(app)
      .patch(`/api/v1/admin/restaurants/${restaurantId}/approve`)
      .set('Authorization', authHeader(adminToken))
      .send({ isApproved: true });
    expect(approveRes.status).toBe(200);

    const afterApproval = await request(app).get('/api/v1/restaurants').query({ q: "Tony's" });
    expect(afterApproval.body.data.find((r) => r._id === restaurantId)).toBeDefined();
  });

  it('prevents a different restaurantOwner from updating someone else\'s restaurant', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    const { accessToken: otherOwnerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const res = await request(app)
      .patch(`/api/v1/restaurants/${restaurantId}`)
      .set('Authorization', authHeader(otherOwnerToken))
      .send({ name: 'Hijacked Name' });
    expect(res.status).toBe(403);
  });

  it('updates a restaurant\'s location without wiping the GeoJSON type MongoDB needs for the 2dsphere index', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    // Mirrors what the owner dashboard's edit form actually sends: coordinates only, no `type`.
    const res = await request(app)
      .patch(`/api/v1/restaurants/${restaurantId}`)
      .set('Authorization', authHeader(ownerToken))
      .send({ location: { coordinates: [1, 1] } });

    expect(res.status).toBe(200);
    expect(res.body.data.location).toEqual({ type: 'Point', coordinates: [1, 1] });

    // A `$nearSphere` query is what actually invokes the 2dsphere index — the true test that the
    // geo key extracted correctly rather than merely that the field looks right in isolation.
    const nearby = await request(app).get('/api/v1/restaurants').query({ lat: 1, lng: 1, radiusKm: 5 });
    expect(nearby.status).toBe(200);
  });

  it('supports filtering and searching menu items', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    // Cross-restaurant search only surfaces approved restaurants' dishes.
    const { accessToken: adminToken } = await createAdmin();
    await request(app)
      .patch(`/api/v1/admin/restaurants/${restaurantId}/approve`)
      .set('Authorization', authHeader(adminToken))
      .send({ isApproved: true });

    const categoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Mains' });
    const categoryId = categoryRes.body.data._id;

    await request(app)
      .post('/api/v1/menu-items')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, category: categoryId, name: 'Veggie Burger', price: 8, isVeg: true });
    await request(app)
      .post('/api/v1/menu-items')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, category: categoryId, name: 'Chicken Burger', price: 10, isVeg: false });

    const vegOnly = await request(app).get('/api/v1/menu-items').query({ restaurant: restaurantId, isVeg: true });
    expect(vegOnly.body.data).toHaveLength(1);
    expect(vegOnly.body.data[0].name).toBe('Veggie Burger');

    const priceFiltered = await request(app)
      .get('/api/v1/menu-items')
      .query({ restaurant: restaurantId, minPrice: 9 });
    expect(priceFiltered.body.data).toHaveLength(1);
    expect(priceFiltered.body.data[0].name).toBe('Chicken Burger');

    const searched = await request(app).get('/api/v1/menu-items').query({ q: 'chicken' });
    expect(searched.body.data.some((i) => i.name === 'Chicken Burger')).toBe(true);
  });

  it('uploads a restaurant logo and cover image', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/restaurants/${restaurantId}/images`)
      .set('Authorization', authHeader(ownerToken))
      .attach('logo', FIXTURE_IMAGE)
      .attach('cover', FIXTURE_IMAGE);

    expect(res.status).toBe(200);
    expect(res.body.data.logoUrl).toEqual(expect.stringContaining('https://res.cloudinary.com/'));
    expect(res.body.data.coverImageUrl).toEqual(expect.stringContaining('https://res.cloudinary.com/'));
  });

  it('rejects an image upload with no logo or cover file attached', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/restaurants/${restaurantId}/images`)
      .set('Authorization', authHeader(ownerToken));

    expect(res.status).toBe(400);

    const unchanged = await request(app).get(`/api/v1/restaurants/${restaurantId}`);
    expect(unchanged.body.data.logoUrl).toBeUndefined();
  });

  it("rejects an image upload from a restaurant owner who doesn't own the restaurant, before touching the file", async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    const { accessToken: otherOwnerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const res = await request(app)
      .patch(`/api/v1/restaurants/${restaurantId}/images`)
      .set('Authorization', authHeader(otherOwnerToken))
      .attach('logo', FIXTURE_IMAGE);

    expect(res.status).toBe(403);

    const unchanged = await request(app).get(`/api/v1/restaurants/${restaurantId}`);
    expect(unchanged.body.data.logoUrl).toBeUndefined();
  });

  it('deletes a restaurant along with its categories and menu items', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const restaurantRes = await request(app)
      .post('/api/v1/restaurants')
      .set('Authorization', authHeader(ownerToken))
      .send(restaurantPayload);
    const restaurantId = restaurantRes.body.data._id;

    const categoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Mains' });
    await request(app)
      .post('/api/v1/menu-items')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, category: categoryRes.body.data._id, name: 'Soup', price: 5 });

    const deleteRes = await request(app)
      .delete(`/api/v1/restaurants/${restaurantId}`)
      .set('Authorization', authHeader(ownerToken));
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/v1/restaurants/${restaurantId}`);
    expect(getRes.status).toBe(404);

    const menuItemsRes = await request(app).get('/api/v1/menu-items').query({ restaurant: restaurantId });
    expect(menuItemsRes.body.data).toHaveLength(0);
  });
});
