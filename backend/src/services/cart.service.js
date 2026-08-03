const Cart = require('../models/cart.model');
const MenuItem = require('../models/menuItem.model');
const ApiError = require('../utils/ApiError');

/** Resolves add-on prices from the menu item's own definition — never trust client-supplied prices. */
function resolveAddOns(menuItem, requestedAddOns = []) {
  return requestedAddOns.map((requested) => {
    const canonical = menuItem.addOns.find((a) => a.name === requested.name);
    if (!canonical) {
      throw ApiError.badRequest(`Add-on '${requested.name}' is not available for this item`);
    }
    return { name: canonical.name, price: canonical.price };
  });
}

function sameAddOns(a = [], b = []) {
  if (a.length !== b.length) return false;
  const key = (list) => list.map((x) => `${x.name}:${x.price}`).sort().join('|');
  return key(a) === key(b);
}

async function getCart(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('restaurant', 'name isOpen isApproved');
  return cart;
}

async function addItem(userId, payload) {
  const menuItem = await MenuItem.findById(payload.menuItem);
  if (!menuItem || !menuItem.isAvailable) {
    throw ApiError.badRequest('Menu item is not available');
  }

  const resolvedAddOns = resolveAddOns(menuItem, payload.addOns);

  let cart = await Cart.findOne({ user: userId });

  if (cart && cart.restaurant.toString() !== menuItem.restaurant.toString()) {
    // A customer orders from one restaurant at a time; switching restaurants replaces the cart.
    await cart.deleteOne();
    cart = null;
  }

  if (!cart) {
    cart = new Cart({ user: userId, restaurant: menuItem.restaurant, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.menuItem.toString() === menuItem._id.toString() && sameAddOns(item.addOns, resolvedAddOns)
  );

  if (existingItem) {
    existingItem.quantity += payload.quantity;
  } else {
    cart.items.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: payload.quantity,
      addOns: resolvedAddOns,
    });
  }

  await cart.save();
  return cart;
}

async function updateItemQuantity(userId, itemId, quantity) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound('Cart item not found');

  item.quantity = quantity;
  await cart.save();
  return cart;
}

async function removeItem(userId, itemId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound('Cart item not found');

  item.deleteOne();
  await cart.save();
  return cart;
}

async function clearCart(userId) {
  await Cart.deleteOne({ user: userId });
}

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };
