import api from '../../api';

import {
  getApiData,
  requestParams,
  getFlashSuccessMessage,
} from '../../helpers';

const PAGESIZE = 20;
const primaryNav = 'home';

const dealsDashboard = async (req, res) => {
  const { userToken } = requestParams(req);

  // Get filters from post on page. Allows same method for both get and post requests
  const dashboardFilters = req.body || req.sessions.dashboardFilters;
  req.session.dashboardFilters = dashboardFilters;

  // when a user with checker role views the dashboard, default to status=readyForApproval
  // when a user with maker role views the dashboard, do not default to status=readyForApproval
  const { roles } = req.session.user;

  const userIsMaker = roles.includes('maker');
  const userIsChecker = roles.includes('checker');

  // if no dashboard filters set, create defaults
  if (!req.session.dashboardFilters) {
    req.session.dashboardFilters = {};

    if (userIsChecker && !userIsMaker) {
      req.session.dashboardFilters.filterByStatus = 'readyForApproval'; // 'Ready for check'?
      req.session.dashboardFilters.isUsingAdvancedFilter = true;
    }

    // default to hiding abandoned deals
    req.session.dashboardFilters.filterByShowAbandonedDeals = false;
  }

  // TODO: reinstate filters
  // const { isUsingAdvancedFilter, filters } = buildDashboardFilters(req.session.dashboardFilters, req.session.user);

  const { count, deals } = await getApiData(
    api.contracts(req.params.page * PAGESIZE, PAGESIZE, {}, userToken),
    res,
  );

  const pages = {
    totalPages: Math.ceil(count / PAGESIZE),
    currentPage: parseInt(req.params.page, 10),
    totalItems: count,
  };

  return res.render('dashboard/deals.njk', {
    deals,
    pages,
    successMessage: getFlashSuccessMessage(req),
    primaryNav,
    user: req.session.user,
  });
};

export default dealsDashboard;
