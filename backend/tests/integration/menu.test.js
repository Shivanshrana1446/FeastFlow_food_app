const path = require('path');
const request = require('supertest');
const app = require('../../src/app');
const { registerUser, createAdmin, authHeader } = require('../helpers/auth');
const { createApprovedRestaurant, createMenuItem } = require('../helpers/fixtures');
const { ROLES } = require('../../src/constants/roles');

const FIXTURE_IMAGE = path.join(__dirname, '../fixtures/tiny.png');

describe('Menu item module', () => {
  it('fetches a single menu item by id', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { name: 'Solo Dish' });

    const res = await request(app).get(`/api/v1/menu-items/${menuItemId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Solo Dish');
  });

  it('returns 404 for a nonexistent menu item', async () => {
    const res = await request(app).get('/api/v1/menu-items/64b7f9c9f9c9f9c9f9c9f9c9');
    expect(res.status).toBe(404);
  });

  it("prevents a different owner from updating or deleting someone else's menu item", async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId);

    const { accessToken: otherOwnerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const updateRes = await request(app)
      .patch(`/api/v1/menu-items/${menuItemId}`)
      .set('Authorization', authHeader(otherOwnerToken))
      .send({ price: 1 });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/v1/menu-items/${menuItemId}`)
      .set('Authorization', authHeader(otherOwnerToken));
    expect(deleteRes.status).toBe(403);
  });

  it('updates and then deletes a menu item', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId, { price: 20 });

    const updateRes = await request(app)
      .patch(`/api/v1/menu-items/${menuItemId}`)
      .set('Authorization', authHeader(ownerToken))
      .send({ price: 25 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.price).toBe(25);

    const deleteRes = await request(app)
      .delete(`/api/v1/menu-items/${menuItemId}`)
      .set('Authorization', authHeader(ownerToken));
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/v1/menu-items/${menuItemId}`);
    expect(getRes.status).toBe(404);
  });

  it('uploads a menu item image', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId);

    const res = await request(app)
      .patch(`/api/v1/menu-items/${menuItemId}/image`)
      .set('Authorization', authHeader(ownerToken))
      .attach('image', FIXTURE_IMAGE);

    expect(res.status).toBe(200);
    expect(res.body.data.imageUrl).toEqual(expect.stringContaining('https://res.cloudinary.com/'));
  });

  it("rejects an image upload from an owner who doesn't own the item's restaurant", async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId);

    const { accessToken: otherOwnerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const res = await request(app)
      .patch(`/api/v1/menu-items/${menuItemId}/image`)
      .set('Authorization', authHeader(otherOwnerToken))
      .attach('image', FIXTURE_IMAGE);

    expect(res.status).toBe(403);

    const unchanged = await request(app).get(`/api/v1/menu-items/${menuItemId}`);
    expect(unchanged.body.data.imageUrl).toBeUndefined();
  });

  it('rejects a non-image file upload', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { menuItemId } = await createMenuItem(ownerToken, restaurantId);

    const res = await request(app)
      .patch(`/api/v1/menu-items/${menuItemId}/image`)
      .set('Authorization', authHeader(ownerToken))
      .attach('image', Buffer.from('not an image'), { filename: 'note.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
  });
});

describe('Category module', () => {
  it('rejects creating a duplicate category name for the same restaurant', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);

    await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Starters' });

    const dupRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Starters' });
    expect(dupRes.status).toBe(409);
  });

  it('updates a category name', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { categoryId } = await createMenuItem(ownerToken, restaurantId, { categoryName: 'Old Name' });

    const res = await request(app)
      .patch(`/api/v1/categories/${categoryId}`)
      .set('Authorization', authHeader(ownerToken))
      .send({ name: 'New Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New Name');
  });

  it('refuses to delete a category that still has menu items', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);
    const { categoryId } = await createMenuItem(ownerToken, restaurantId);

    const res = await request(app)
      .delete(`/api/v1/categories/${categoryId}`)
      .set('Authorization', authHeader(ownerToken));
    expect(res.status).toBe(409);
  });

  it('deletes an empty category', async () => {
    const { accessToken: ownerToken } = await registerUser(ROLES.RESTAURANT_OWNER);
    const { accessToken: adminToken } = await createAdmin();
    const restaurantId = await createApprovedRestaurant(ownerToken, adminToken);

    const categoryRes = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', authHeader(ownerToken))
      .send({ restaurant: restaurantId, name: 'Empty Category' });

    const deleteRes = await request(app)
      .delete(`/api/v1/categories/${categoryRes.body.data._id}`)
      .set('Authorization', authHeader(ownerToken));
    expect(deleteRes.status).toBe(200);
  });
});
