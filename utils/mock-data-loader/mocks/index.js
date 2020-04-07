const COUNTRIES = require('./countries');
const BOND_CURRENCIES = require('./bond-currencies');
const INDUSTRY_SECTORS = require('./industry-sectors');
const USERS = require('./users');
const BANKS = require('./banks');
const MANDATORY_CRITERIA = require('./mandatoryCriteria');
const ELIGIBILITY_CRITERIA = require('./eligibilityCriteria');
const SUPPORTING_DOCUMENTATION = require('./supportingDocumentation');
const CONTRACTS = require('./contracts');
const TRANSACTIONS = require('./transactions');

const MOCKS = {
  USERS,
  BANKS,
  BOND_CURRENCIES,
  COUNTRIES,
  INDUSTRY_SECTORS,
  MANDATORY_CRITERIA,
  CONTRACTS,
  TRANSACTIONS,
};

module.exports = MOCKS;
