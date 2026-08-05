# Database Schema

MongoDB, via Mongoose. Source of truth for field-level detail is always
`backend/src/models/*.model.js` — this document is the normalization rationale and
collection-relationship map that doesn't fit in code comments.

See also: [ER_DIAGRAM.md](./ER_DIAGRAM.md) for the visual relationship diagram, and
[../ARCHITECTURE.md §3](../ARCHITECTURE.md#3-mongoose-models) for indexing/hook details.

## Collections

| Collection | Purpose | Normalization notes |
|---|---|---|
| `users` | Single collection for all 4 roles (`customer`, `restaurantOwner`, `deliveryPartner`, `admin`), discriminated by `role`. Embeds `addresses[]` (owned 1:1 by the user, never queried standalone). | Avoids a 4-table auth split; role-specific *extended* profile data (vehicle info) lives in its own collection since it has a different lifecycle and is only relevant to one role. |
| `restaurants` | One document per restaurant. References `owner` (User). Embeds opening hours & geo location (`GeoJSON Point`) for `$geoNear`/`$nearSphere` queries. | Not embedded in `users` — restaurants are queried/searched/sorted independently of their owner far more often than joined with it. |
| `categories` | Menu categories scoped to a restaurant (e.g. "Starters"). | Kept separate from `menuItems` so a restaurant's category list can be fetched without pulling every item. |
| `menuItems` | Dish documents, referencing `restaurant` + `category`. | Normalized (not embedded in `restaurants`) because menu items are paginated/searched/sorted independently and a restaurant can have hundreds of items — embedding would blow past MongoDB's practical document-growth comfort zone. |
| `carts` | One active cart per `(user, restaurant)` pair. Line items reference `menuItem` but snapshot `name`/`price` at add-time. | Kept as its own collection (not embedded in `users`) since carts churn constantly and shouldn't bloat the user document. |
| `orders` | Immutable snapshot of a placed order: line items, pricing breakdown, status history, refs to `user`, `restaurant`, `deliveryPartner`. | Line items are embedded (denormalized) *by design* — an order must remain historically accurate even if the menu item's price/name later changes. |
| `payments` | One document per payment attempt against an order (supports Razorpay retries after a dismissed/failed checkout). | Separate from `orders` so payment status changes (and a future webhook) don't touch the order document, and there's a clean place for `gatewayOrderId`/`transactionId`. |
| `reviews` | Customer review of a restaurant, tied to the `order` that unlocked it. | Separate collection so restaurant rating aggregation queries don't compete with order traffic. |
| `deliveryPartnerProfiles` | Extended profile for `deliveryPartner` role users: vehicle info, live location, availability, current order. | Split from `users` because it's high-write (location pings) and only exists for one role — keeping it off the `users` document avoids unrelated writes contending on the same doc. |
| `notifications` | In-app notification per user (order placed, status changes, etc.), polled by the frontend. | Separate collection, indexed on `(user, isRead, createdAt)`, so unread-count queries stay cheap regardless of order volume. |

## Collection relationships

```
users (1) ──< restaurants (owner)              [1 owner : many restaurants]
users (1) ──< deliveryPartnerProfiles (user)    [1:1]
users (1) ──< carts (user)                      [1 : many, one active per restaurant]
users (1) ──< orders (user)                     [1 : many]
users (1) ──< reviews (user)                    [1 : many]
users (1) ──< notifications (user)              [1 : many]

restaurants (1) ──< categories (restaurant)     [1 : many]
restaurants (1) ──< menuItems (restaurant)      [1 : many]
restaurants (1) ──< carts (restaurant)          [1 : many]
restaurants (1) ──< orders (restaurant)         [1 : many]
restaurants (1) ──< reviews (restaurant)        [1 : many]

categories (1) ──< menuItems (category)         [1 : many]

orders (1) ──< payments (order)                 [1 : many, retries]
orders (1) ──  reviews (order)                  [1 : 0..1]
orders (1) ──  deliveryPartnerProfiles           [assigned via deliveryPartner ref + currentOrder]
```

## Indexing highlights

- `users.email` — unique index (login lookup + duplicate-registration check)
- `restaurants.location`, `deliveryPartnerProfiles.currentLocation` — `2dsphere` (proximity search)
- `restaurants.name` / `.cuisine`, `menuItems.name` / `.description` — text indexes (search)
- `restaurants` — compound `(isApproved, createdAt)` covering the public listing's default filter + sort
- `menuItems` — compound `(restaurant, isAvailable)` covering a restaurant's menu-page query
- `orders` — compound indexes on `(user, createdAt)`, `(restaurant, status, createdAt)`, and `(deliveryPartner, status, createdAt)`, covering each role's list-my-orders query
- `payments`, `notifications` — indexed on their owning-user/order reference for role-scoped list queries

Full index definitions live next to each schema in `backend/src/models/*.model.js`.
