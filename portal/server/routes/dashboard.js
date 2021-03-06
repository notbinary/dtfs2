import express from 'express';
import api from '../api';
import buildDashboardFilters from './buildDashboardFilters';
import buildTransactionFilters from './buildTransactionFilters';

import {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} from '../helpers';

import validateToken from './middleware/validate-token';

const router = express.Router();
const PAGESIZE = 20;
const primaryNav = 'dashboard';

router.use('/dashboard/*', validateToken);

router.get('/dashboard', async (req, res) => {
  req.session.dashboardFilters = null;
  res.redirect('/dashboard/0');
});

router.get('/dashboard/transactions', async (req, res) => {
  req.session.transactionFilters = null;
  return res.redirect('/dashboard/transactions/0');
});

router.get('/dashboard/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const { isUsingAdvancedFilter, filters } = buildTransactionFilters(req.session.transactionFilters, req.session.user);

  const transactionData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(transactionData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: transactionData.count,
  };

  return res.render('dashboard/transactions.njk', {
    pages,
    transactions: transactionData.transactions,
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
    successMessage: getFlashSuccessMessage(req),
    filter: {
      isUsingAdvancedFilter,
      ...req.session.transactionFilters,
    },
    primaryNav,
    user: req.session.user,
  });
});

router.post('/dashboard/transactions/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const transactionFilters = req.body;

  req.session.transactionFilters = transactionFilters;

  const { isUsingAdvancedFilter, filters } = buildTransactionFilters(transactionFilters, req.session.user);

  const transactionData = await getApiData(
    api.transactions(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(transactionData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: transactionData.count,
  };

  return res.render('dashboard/transactions.njk', {
    pages,
    transactions: transactionData.transactions,
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
    successMessage: getFlashSuccessMessage(req),
    filter: {
      isUsingAdvancedFilter,
      ...req.session.transactionFilters,
    },
    user: req.session.user,
  });
});

router.get('/dashboard/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  // when a user with checker role views the dashboard, default to status=readyForApproval
  // when a user with maker AND checker role views the dashboard, do not default to status=readyForApproval
  const { roles } = req.session.user;

  const userisMaker = roles.includes('maker');
  const userisChecker = roles.includes('checker');
  const userIsMakerAndChecker = (userisMaker && userisChecker);

  if (!req.session.dashboardFilters) {
    // set some default behaviours for the filters...
    req.session.dashboardFilters = {};

    // default filter settings for a checker
    if (userisChecker && !userIsMakerAndChecker) {
      req.session.dashboardFilters.filterByStatus = 'readyForApproval';
      req.session.dashboardFilters.isUsingAdvancedFilter = true;
    }

    // default to hiding abandoned deals
    req.session.dashboardFilters.filterByShowAbandonedDeals = false;
  }

  const { isUsingAdvancedFilter, filters } = buildDashboardFilters(req.session.dashboardFilters, req.session.user);

  const dealData = await getApiData(
    api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(dealData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: dealData.count,
  };

  return res.render('dashboard/deals.njk', {
    pages,
    contracts: dealData.deals,
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
    successMessage: getFlashSuccessMessage(req),
    filter: {
      isUsingAdvancedFilter,
      ...req.session.dashboardFilters,
    },
    primaryNav,
    user: req.session.user,
  });
});

router.post('/dashboard/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  const dashboardFilters = req.body;
  req.session.dashboardFilters = dashboardFilters;

  const { isUsingAdvancedFilter, filters } = buildDashboardFilters(dashboardFilters, req.session.user);

  const dealData = await getApiData(
    api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(dealData.count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: dealData.count,
  };

  return res.render('dashboard/deals.njk', {
    pages,
    contracts: dealData.deals,
    banks: await getApiData(
      api.banks(userToken),
      res,
    ),
    filter: {
      isUsingAdvancedFilter,
      ...dashboardFilters,
    },
    primaryNav,
    user: req.session.user,
  });
});

export default router;
