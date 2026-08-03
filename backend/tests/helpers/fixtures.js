const request = require('supertest');
const app = require('../../src/app');

/** Creates a restaurant owned by `ownerToken` and approves it via `adminToken`. Returns the restaurant id. */
async function createApprovedRestaurant(ownerToken, adminToken, overrides = {}) {
  const res = await request(app)
    .post('/api/v1/restaurants')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      name: overrides.name || 'Fixture Diner',
      cuisine: overrides.cuisine || ['general'],
      address: overrides.address || {
        line1: '1 Fixture St',
        city: 'Fixtureville',
        state: 'FX',
        postalCode: '00000',
        country: 'USA',
      },
      location: overrides.location || { coordinates: [0, 0] },
      minOrderAmount: overrides.minOrderAmount ?? 0,
    });

  if (res.status !== 201) {
    throw new Error(`Failed to create fixture restaurant: ${JSON.stringify(res.body)}`);
  }
  const restaurantId = res.body.data._id;

  await request(app)
    .patch(`/api/v1/admin/restaurants/${restaurantId}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ isApproved: true });

  return restaurantId;
}

/** Creates a category + a menu item under it. Returns { categoryId, menuItemId }. */
async function createMenuItem(ownerToken, restaurantId, overrides = {}) {
  const categoryRes = await request(app)
    .post('/api/v1/categories')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ restaurant: restaurantId, name: overrides.categoryName || 'Mains' });
  const categoryId = categoryRes.body.data._id;

  const itemRes = await request(app)
    .post('/api/v1/menu-items')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      restaurant: restaurantId,
      category: categoryId,
      name: overrides.name || 'Fixture Dish',
      price: overrides.price ?? 10,
      isVeg: overrides.isVeg ?? true,
      addOns: overrides.addOns || [],
    });

  if (itemRes.status !== 201) {
    throw new Error(`Failed to create fixture menu item: ${JSON.stringify(itemRes.body)}`);
  }

  return { categoryId, menuItemId: itemRes.body.data._id };
}

module.exports = { createApprovedRestaurant, createMenuItem };
