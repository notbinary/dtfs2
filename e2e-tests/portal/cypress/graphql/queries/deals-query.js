const dealsQuery = `
query {
  deals {
    deals{
      _id
      product
    }
  }
}`;

module.exports = dealsQuery;
