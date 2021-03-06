const axios = require('axios');

require('dotenv').config();

const getACBS = async (apiRef) => {
  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${apiRef}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch((err) => ({
    status: err.response.status,
  }));

  return response;
};

const putToACBS = async (apiRef, acbsInput, etag) => {
  const additionalHeader = etag ? {
    'If-Match': etag,
  } : null;

  const response = await axios({
    method: 'put',
    url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${apiRef}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeader,
    },
    data: acbsInput,
  }).catch((err) => ({
    status: err.response.status,
    data: {
      error: err.response.data,
    },
  }));
  return response;
};

const postToACBS = async (apiRef, acbsInput) => {
  const response = await axios({
    method: 'post',
    url: `${process.env.MULESOFT_API_UKEF_TF_EA_URL}/${apiRef}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [acbsInput],
  }).catch((err) => ({
    status: err.response.status,
    data: {
      error: err.response.data,
    },
  }));

  return response;
};

const createParty = (acbsInput) => postToACBS('party', acbsInput);

const createDeal = (acbsInput) => postToACBS('deal', acbsInput);

const createDealInvestor = (acbsInput) => postToACBS('deal/investor', acbsInput);

const createDealGuarantee = (acbsInput) => postToACBS('deal/guarantee', acbsInput);

const createFacility = (acbsInput) => postToACBS('facility', acbsInput);

const createFacilityInvestor = (acbsInput) => postToACBS('facility/investor', acbsInput);

const createFacilityCovenantId = (acbsInput) => postToACBS('numbers', acbsInput);

const createFacilityCovenant = (acbsInput) => postToACBS('facility/covenant', acbsInput);

const createFacilityGuarantee = (acbsInput) => postToACBS('facility/guarantee', acbsInput);

const createCodeValueTransaction = ((acbsInput) => postToACBS('facility/codeValueTransaction', acbsInput));

const updateFacility = (facilityId, updateType, acbsInput, etag) => putToACBS(
  `facility/${facilityId}?op=${updateType}`,
  acbsInput,
  etag,
);

const getFacility = (facilityId) => getACBS(`facility/${facilityId}`);

module.exports = {
  createParty,
  createDeal,
  createDealInvestor,
  createDealGuarantee,
  createFacility,
  createFacilityInvestor,
  createFacilityCovenantId,
  createFacilityCovenant,
  createFacilityGuarantee,
  createCodeValueTransaction,
  updateFacility,
  getFacility,
};
