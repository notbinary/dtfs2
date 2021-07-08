const { findPaginatedDeals, findDeals } = require('../../v1/controllers/deal.controller');

const { dbHelpers } = require('./helpers');

const queryDeals = async (_, { params = {} }, ctx) => {
  const {
    start = 0, pagesize, filters = [], sort = [],
  } = params;

  const dbFilters = filters.map((clause) => ({
    [clause.field]: clause.operator ? dbHelpers.createDbQuery(clause.operator, clause.value) : clause.value,
  }));

  const deals = pagesize
    ? await findPaginatedDeals(ctx.user, start, pagesize, dbFilters, sort)
    : await findDeals(ctx.user, dbFilters, sort);

  console.log({ deals });

  return deals;
};

module.exports = queryDeals;
