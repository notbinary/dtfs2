import express from 'express';
import orderBy from 'lodash.orderby';
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
const PAGESIZE = 10;
const primaryNav = 'home';

router.use('/dashboard/*', validateToken);

router.get('/', validateToken, (_, res) => res.redirect('/dashboard'));

router.get('/dashboard', async (req, res) => {
  req.session.dashboardFilters = null;
  res.redirect('/dashboard/0');
});

const gefApplicationList = async (token, res) => {
  const data = await getApiData(api.getGefApplications(token), res);

  const fullList = data.map(async (application) => {
    const { companyName } = await getApiData(api.getGefExporter(application.exporterId, token), res);
    const { isAutomaticCover } = await getApiData(api.getGefCoverTerms(application.coverTermsId, token), res);

    let coverType;
    if (typeof isAutomaticCover === 'boolean') coverType = isAutomaticCover ? 'Automatic Inclusion Notice' : 'Manual Inclusion Notice';

    return {
      id: application._id,
      exporter: companyName,
      bankRef: application.bankInternalRefName,
      product: 'GEF',
      status: application.status,
      type: coverType,
      lastUpdated: application.updatedAt || application.createdAt,
    };
  });

  return Promise.all(fullList);
};

router.get('/dashboard/:page', async (req, res) => {
  const { userToken } = requestParams(req);

  // when a user with checker role views the dashboard, default to status=readyForApproval
  // when a user with maker AND checker role views the dashboard, do not default to status=readyForApproval
  // const { roles } = req.session.user;

  // const userisMaker = roles.includes('maker');
  // const userisChecker = roles.includes('checker');
  // const userIsMakerAndChecker = (userisMaker && userisChecker);

  // if (!req.session.dashboardFilters) {
  //   // set some default behaviours for the filters...
  //   req.session.dashboardFilters = {};

  //   // default filter settings for a checker
  //   if (userisChecker && !userIsMakerAndChecker) {
  //     req.session.dashboardFilters.filterByStatus = 'readyForApproval';
  //     req.session.dashboardFilters.isUsingAdvancedFilter = true;
  //   }

  //   // default to hiding abandoned deals
  //   req.session.dashboardFilters.filterByShowAbandonedDeals = false;
  // }

  // const { isUsingAdvancedFilter, filters } = buildDashboardFilters(req.session.dashboardFilters, req.session.user);

  // const dealData = await getApiData(
  //   api.contracts(req.params.page * PAGESIZE, PAGESIZE, filters, userToken),
  //   res,
  // );

  // const pages = {
  //   totalPages: Math.ceil(dealData.count / PAGESIZE),
  //   currentPage: parseInt(req.params.page, 10),
  //   totalItems: dealData.count,
  // };

  const bssRawData = await getApiData(
    api.contracts(0, 0, {}, userToken),
    res,
  );

  const bssData = bssRawData.deals.map((deal) => ({
    id: deal.id,
    exporter: deal.details.owningBank.name,
    bankRef: deal.details.bankSupplyContractID,
    product: 'BSS/EWCS',
    status: deal.details.status,
    type: deal.details.submissionType,
    lastUpdated: deal.details.dateOfLastAction,
  }));

  const gefData = await gefApplicationList(userToken, res);

  const applications = [...bssData, ...gefData];

  return res.render('dashboard/deals.njk', {
    applications: orderBy(applications, ['lastUpdated', 'bankRef'], ['desc', 'asc']),
    successMessage: getFlashSuccessMessage(req),
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

export default router;
