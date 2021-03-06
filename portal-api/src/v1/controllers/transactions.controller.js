const transactionFixer = require('./transactions/transactionFixer');

const api = require('../api');

// To return all transactions, use start=0, pagesize<=0
exports.findTransactions = async (requestingUser, start = 0, pagesize = 20, filter) => {
  // try to hide all the horrible logic for filtering in here:
  const transactionFix = transactionFixer(requestingUser, filter);

  // console.log(`filter :: \n${JSON.stringify(filter)}`);
  // work out the mongo query to get all the deals that might contain transactions we care about
  const query = transactionFix.transactionsQuery();
  // console.log(`query :: \n${JSON.stringify(query)}`);
  // get the deals that might contain transactions we care about
  //   ordered by deal.details.dateOfLastAction
  const { deals } = await api.queryDeals(query);

  // use Array.reduce to loop over our list of deals,
  //  accumulating an array of "loans and bonds" suitable to return via the API
  const allTransactions = deals.reduce((transactionsAccumulatedSoFar, deal) => {
    // use our transactionFix toolkit to get the list of bonds+loans that fit the provided filters
    const transactionsForThisDeal = transactionFix.filteredTransactions(deal);
    return transactionsAccumulatedSoFar.concat(transactionsForThisDeal);
  }, []);
  // console.log(`allTransactions :: \n${JSON.stringify(allTransactions)}`);

  // "allTransactions" now holds a list of all the transactions that it would be ok to display
  //  given current user+filtering

  // so now chop that list up based on the pagination instructions..
  // 1) chop off everything before the current page
  const transactionsWithoutPreviousPages = allTransactions.slice(start);
  // 2) chop us down to our max pagesize
  const page = transactionsWithoutPreviousPages.length > pagesize && pagesize > 0
    ? transactionsWithoutPreviousPages.slice(0, pagesize)
    : transactionsWithoutPreviousPages;

  // and finally... return the page of data
  return {
    count: allTransactions.length,
    transactions: page,
  };
};
