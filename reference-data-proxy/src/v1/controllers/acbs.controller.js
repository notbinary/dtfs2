// ACBS API is used to check that deal/facility ids are not already being used.
//
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.

const axios = require('axios');
const CONSTANTS = require('../../constants');

const acbsFunctionUrl = process.env.AZURE_ACBS_FUNCTION_URL;

const checkDealId = async (dealId) => {
  console.log(`Checking deal id ${dealId} with ACBS`);

  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_ACBS_DEAL_URL}/${dealId}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
  }).catch((catchErr) => catchErr);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (deal)');
};
exports.checkDealId = checkDealId;

const checkFacilityId = async (facilityId) => {
  console.log(`Checking facility id ${facilityId} with ACBS`);

  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_ACBS_FACILITY_URL}/${facilityId}`,
    auth: {
      username: process.env.MULESOFT_API_KEY,
      password: process.env.MULESOFT_API_SECRET,
    },
  }).catch((catchErr) => catchErr);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (facility)');
};
exports.checkFacilityId = checkFacilityId;

exports.findOne = async (req, res) => {
  const { entityType, id } = req.params;

  if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.DEAL) {
    const dealIdStatus = await checkDealId(id);
    console.log(`Checked dealId ${id} with ACBS API: ${dealIdStatus}`);

    return res.status(dealIdStatus).send();
  }

  if (entityType === CONSTANTS.NUMBER_GENERATOR.ENTITY_TYPE.FACILITY) {
    const facilityIdStatus = await checkFacilityId(id);
    console.log(`Checked facilityId ${id} with ACBS API: ${facilityIdStatus}`);

    return res.status(facilityIdStatus).send();
  }

  return res.status(500).send();
};

const issueAcbsFacility = async (id, facility, supplierName) => {
  const response = await axios({
    method: 'post',
    url: `${acbsFunctionUrl}/api/orchestrators/acbs-issue-facility`,
    data: {
      facilityId: id,
      facility,
      supplierName,
    },
  }).catch((err) => err);
  return response;
};

exports.issueAcbsFacilityPOST = async (req, res) => {
  const { id } = req.params;
  const { facility, supplierName } = req.body;

  const { status, data } = await issueAcbsFacility(id, facility, supplierName);

  return res.status(status).send(data);
};

const createAcbsRecord = async (deal, bank) => {
  const response = await axios({
    method: 'post',
    url: `${acbsFunctionUrl}/api/orchestrators/acbs`,
    data: {
      deal,
      bank,
    },
  }).catch((err) => err);
  return response;
};

exports.createAcbsRecordPOST = async (req, res) => {
  const { deal, bank } = req.body;

  const { status, data } = await createAcbsRecord(deal, bank);

  return res.status(status).send(data);
};
