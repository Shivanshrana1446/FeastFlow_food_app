/**
 * Shared pagination + search + sort executor for list endpoints.
 *
 * @param {import('mongoose').Model} model
 * @param {object} options
 * @param {object} [options.filter] base Mongo filter (e.g. { restaurant: id })
 * @param {string} [options.searchTerm] raw search string from ?q=
 * @param {string[]} [options.searchFields] fields to run a case-insensitive regex search over
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @param {string} [options.sortBy] e.g. "price:asc" or "createdAt:desc"
 * @param {string} [options.populate]
 * @param {boolean} [options.lean=true] skip Mongoose document hydration — every call site here
 *   only ever serializes results straight to JSON, never mutates them, so this is a free win.
 *   Pass `lean: false` only if a caller genuinely needs Mongoose document methods on the results.
 */
async function paginate(model, options = {}) {
  const {
    filter = {},
    searchTerm,
    searchFields = [],
    page = 1,
    limit = 10,
    sortBy,
    populate,
    lean = true,
  } = options;

  const finalFilter = { ...filter };

  if (searchTerm && searchFields.length > 0) {
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    finalFilter.$or = searchFields.map((field) => ({ [field]: regex }));
  }

  const sort = {};
  if (sortBy) {
    sortBy.split(',').forEach((clause) => {
      const [field, direction] = clause.split(':');
      if (field) sort[field] = direction === 'desc' ? -1 : 1;
    });
  } else {
    sort.createdAt = -1;
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;

  let query = model.find(finalFilter).sort(sort).skip(skip).limit(safeLimit);
  if (populate) query = query.populate(populate);
  if (lean) query = query.lean();

  const [results, totalItems] = await Promise.all([
    query.exec(),
    model.countDocuments(finalFilter),
  ]);

  return {
    results,
    meta: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / safeLimit)),
    },
  };
}

module.exports = paginate;
