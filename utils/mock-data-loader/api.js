const axios = require('axios');
require('dotenv').config();

const { QUERY, apollo } = require('./graphql');

// TODO multiple services talk to the same api; we end up writing basically the same code twice to achieve this
//  ... a binary repo to publish things to so we can share? ... local references in package.json??

const urlRoot = process.env.DEAL_API_URL;

const createBank = async (bank, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/banks`,
    data: bank,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const createBondCurrency = async (bondCurrency, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/bond-currencies`,
    data: bondCurrency,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const createCountry = async (country, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/countries`,
    data: country,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const createDeal = async (deal, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/deals`,
    data: deal,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const createIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/industry-sectors`,
    data: industrySector,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const createMandatoryCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/mandatory-criteria`,
    data: mandatoryCriteria,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const createTransaction = async (transaction, token) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/transactions`,
    data: transaction,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const createUser = async (user) => {
  const response = await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users`,
    data: user,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteBank = async (deal, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/banks/${deal.id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteBondCurrency = async (bondCurrency, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/bond-currencies/${bondCurrency.id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteCountry = async (country, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/countries/${country.code}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteDeal = async (deal, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/deals/${deal._id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteIndustrySector = async (industrySector, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/industry-sectors/${industrySector.code}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteMandatoryCriteria = async (mandatoryCriteria, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/mandatory-criteria/${mandatoryCriteria.id}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteTransaction = async (transaction, token) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/transactions/${transaction.bankFacilityId}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const deleteUser = async (user) => {
  const response = await axios({
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users/${user.username}`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data;
};

const listBanks = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/banks`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.banks;
};

const listBondCurrencies = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/bond-currencies`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.bondCurrencies;
};

const listCountries = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/countries`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.countries;
};

const listDeals = async (token) => {
  const response = await apollo('GET', QUERY.dealsQuery, {}, token);
  return response.data.deals.deals;
};


const listIndustrySectors = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/industry-sectors`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.industrySectors;
};

const listMandatoryCriteria = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      Authorization: token || '',
    },
    url: `${urlRoot}/v1/mandatory-criteria`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.mandatoryCriteria;
};

const listTransactions = async (token) => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || '',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/transactions`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.transactions;
};

const listUsers = async () => {
  const response = await axios({
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
    },
    url: `${urlRoot}/v1/users`,
  }).catch((err) => { console.log(`err: ${err}`); });

  return response.data.users;
};

module.exports = {
  createBank,
  createBondCurrency,
  createCountry,
  createDeal,
  createIndustrySector,
  createMandatoryCriteria,
  createTransaction,
  createUser,
  deleteBank,
  deleteBondCurrency,
  deleteCountry,
  deleteDeal,
  deleteIndustrySector,
  deleteMandatoryCriteria,
  deleteTransaction,
  deleteUser,
  listBanks,
  listBondCurrencies,
  listCountries,
  listDeals,
  listIndustrySectors,
  listMandatoryCriteria,
  listTransactions,
  listUsers,
};
