const axios = require('axios');

require('dotenv').config();

const centralApiUrl = process.env.DTFS_CENTRAL_API;
const refDataUrl = process.env.REFERENCE_DATA_PROXY_URL;
const azureAcbsFunctionUrl = process.env.AZURE_ACBS_FUNCTION_URL;

const findOnePortalDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.deal;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalDeal = async (dealId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealUpdate: update,
      },
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalDealStatus = async (dealId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}/status`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        status,
      },
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const addPortalDealComment = async (dealId, commentType, comment) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${centralApiUrl}/v1/portal/deals/${dealId}/comment`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealId,
        commentType,
        comment,
      },
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalFacilityStatus = async (facilityId, status) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}/status`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        status,
      },
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const updatePortalFacility = async (facilityId, update) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/portal/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: update,
    });

    return response.data;
  } catch ({ response }) {
    return false;
  }
};


const findOneDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data.deal;
  } catch ({ response }) {
    return false;
  }
};

const updateDeal = async (dealId, dealUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        dealUpdate,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateDealStage = async (dealId, stage) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/stage`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        stage,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateDealSnapshot = async (dealId, snapshotUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/snapshot`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: snapshotUpdate,
    });

    return response.data;
  } catch (err) {
    return err;
  }
};


const submitDeal = async (dealId) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/deals/${dealId}/submit`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {},
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const findOneFacility = async (facilityId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const updateFacility = async (facilityId, facilityUpdate) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/facilities/${facilityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        facilityUpdate,
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const queryDeals = async ({ queryParams, start = 0, pagesize = 0 }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/deals`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        queryParams,
        start,
        pagesize,
      },
    });

    return response.data;
  } catch (err) {
    return err;// do something proper here, but for now just reject failed logins..
  }
};

const getPartyDbInfo = async ({ companyRegNo }) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/party-db/${encodeURIComponent(companyRegNo)}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findUser = async (username) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/${username}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findUserById = async (userId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/id/${userId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const updateUserTasks = async (userId, updatedTasks) => {
  try {
    const response = await axios({
      method: 'put',
      url: `${centralApiUrl}/v1/tfm/users/${userId}/tasks`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        updatedTasks,
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};

const findOneTeam = async (teamId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/teams/${teamId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data.team;
  } catch (err) {
    return err;
  }
};

const findTeamMembers = async (teamId) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${centralApiUrl}/v1/tfm/users/team/${teamId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    return err;
  }
};

const getCurrencyExchangeRate = async (source, target) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/currency-exchange-rate/${source}/${target}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const getFacilityExposurePeriod = async (startDate, endDate, facilityType) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/exposure-period/${startDate}/${endDate}/${facilityType}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const getPremiumSchedule = async (premiumScheduleParameters) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${refDataUrl}/premium-schedule`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: premiumScheduleParameters,
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }
    console.log('No premium schedule returned from reference data api.');
    return null;
  } catch ({ response }) {
    return null;
  }
};

const createACBS = async (deal, bank) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${refDataUrl}/acbs`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        deal,
        bank,
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const updateACBSfacility = async (facility, supplierName) => {
  try {
    const response = await axios({
      method: 'post',
      // eslint-disable-next-line no-underscore-dangle
      url: `${refDataUrl}/acbs/facility/${facility.facilitySnapshot.ukefFacilityID}/issue`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        facility,
        supplierName,
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const getFunctionsAPI = async (url = '') => {
  // Need to refer to docker internal to work on localhost
  const modifiedUrl = url.replace(/http:\/\/localhost:[\d]*/, azureAcbsFunctionUrl);

  try {
    const response = await axios({
      method: 'get',
      url: modifiedUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    return err.response.data;
  }
};

const createEstoreFolders = async (eStoreFolderInfo) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${refDataUrl}/estore`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        eStoreFolderInfo,
      },
    });
    return response.data;
  } catch (err) {
    return err;
  }
};

const sendEmail = async (
  templateId,
  sendToEmailAddress,
  emailVariables,
) => {
  try {
    const response = await axios({
      method: 'post',
      url: `${refDataUrl}/email`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        templateId,
        sendToEmailAddress,
        emailVariables,
      },
    });
    return response.data;
  } catch ({ response }) {
    return false;
  }
};


module.exports = {
  findOneDeal,
  findOnePortalDeal,
  addPortalDealComment,
  updatePortalDeal,
  updatePortalDealStatus,
  updatePortalFacilityStatus,
  updatePortalFacility,
  updateDeal,
  updateDealStage,
  updateDealSnapshot,
  submitDeal,
  findOneFacility,
  updateFacility,
  queryDeals,
  getPartyDbInfo,
  findUser,
  findUserById,
  updateUserTasks,
  findOneTeam,
  findTeamMembers,
  getCurrencyExchangeRate,
  getFacilityExposurePeriod,
  getPremiumSchedule,
  createACBS,
  updateACBSfacility,
  getFunctionsAPI,
  createEstoreFolders,
  sendEmail,
};
