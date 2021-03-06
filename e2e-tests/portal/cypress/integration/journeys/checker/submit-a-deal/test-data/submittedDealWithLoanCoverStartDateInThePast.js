const moment = require('moment');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = moment().add(1, 'month');
  const dealSubmissionDate = moment().subtract(1, 'day').utc().valueOf();
  const coverStartDateBeforeDealSubmissionDate = moment(dealSubmissionDate).subtract(1, 'week').utc().valueOf();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const deal = JSON.parse(JSON.stringify(dealReadyToSubmitForReview()));

  deal.details.submissionDate = dealSubmissionDate;

  deal.loanTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.loanTransactions.items[0]['coverEndDate-day'] = moment(aMonthInTheFuture).format('DD');
  deal.loanTransactions.items[0]['coverEndDate-month'] = moment(aMonthInTheFuture).format('MM');
  deal.loanTransactions.items[0]['coverEndDate-year'] = moment(aMonthInTheFuture).format('YYYY');
  deal.loanTransactions.items[0].facilityStage = 'Unconditional';

  return deal;
};
