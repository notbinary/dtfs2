/* eslint-disable no-underscore-dangle */
// Premium Schedule API returns the premium schedule for a given facility
//
// the flow is:
// 1) Post parameters to Premium Schedule API, returns  header location to load the segments
// 2) Premium Schedule Segments gets the segments by facilityURN

const axios = require('axios');

const postPremiumSchedule = async (facility, facilityExposurePeriod) => {
  const data = JSON.stringify([{
    facilityURN: 50000010,
    productGroup: 'BS',
    premiumTypeId: 1,
    premiumFrequencyId: 1,
    guaranteeCommencementDate: '2021-01-19',
    guaranteeExpiryDate: '2022-05-17',
    guaranteePercentage: 1.85,
    guaranteeFeePercentage: 80,
    dayBasis: '360',
    exposurePeriod: 16,
    cumulativeAmount: null,
    maximumLiability: 400000,
  }]);
  console.log(`facilityExposurePeriod:${facilityExposurePeriod}`);


  const config = {
    method: 'post',
    url: process.env.MULESOFT_API_PREMIUM_SCHEDULE_URL,
    auth: {
      username: process.env.MULESOFT_API_PREMIUM_SCHEDULE_KEY,
      password: process.env.MULESOFT_API_PREMIUM_SCHEDULE_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  };

  const response = await axios(config);
  if (response.status) {
    return response.status;
  }
  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error calling Post Premium schedule. facilityURN:${facility._id}`);
};

const getScheduleData = async (facilityId) => {
  const response = await axios({
    method: 'get',
    url: 'https://dev-ukef-mdm-ea-v1.uk-e1.cloudhub.io/api/v1/premium/segments/50000010',
    // `${process.env.MULESOFT_API_PREMIUM_SEGMENTS_URL}/${facilityId}`,
    auth: {
      username: process.env.MULESOFT_API_PREMIUM_SCHEDULE_KEY,
      password: process.env.MULESOFT_API_PREMIUM_SCHEDULE_SECRET,
    },
  }).catch((catchErr) => catchErr);
  if (response) {
    return response;
  }

  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error getting Premium schedule segments. Facility:${facilityId}`);
};

const getPremiumSchedule = async (req, res) => {
  const { facility, facilityExposurePeriod } = req.body;
  const postPremiumScheduleResponse = await postPremiumSchedule(facility, facilityExposurePeriod);
  if (postPremiumScheduleResponse === 200 || postPremiumScheduleResponse === 201) {
    // const { status, data } = await getScheduleData(facility.ukefFacilityId);
    const response = await getScheduleData(50000010);
    if (response.status === 200 || response.status === 201) {
      return res.status(response.status).send(response.data);
    }
    console.error(`getPremiumSchedule. Status: ${response.status}. response:${response}`);
  }
  return new Error(`Error calling Premium schedule. Facility:${facility.ukefFacilityId}`);
};
exports.getPremiumSchedule = getPremiumSchedule;
