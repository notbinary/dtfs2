// Premium Schedule API returns the premium schedule for a given facility
//
// the flow is:
// 1) Post parameters to Premium Schedule API, returns  header location to load the segments
// 2) Premium Schedule Segments gets the segments by facilityURN

const axios = require('axios');
// const request = require('request');

const postPremiumSchedule = async (facility) => {
  const data = JSON.stringify([{
    facilityURN: 50000010, productGroup: 'BS', premiumTypeId: 1, premiumFrequencyId: 1, guaranteeCommencementDate: '2021-01-19', guaranteeExpiryDate: '2022-05-17', guaranteePercentage: 1.85, guaranteeFeePercentage: 80, dayBasis: '360', exposurePeriod: 16, cumulativeAmount: null, maximumLiability: 400000,
  }]);

  const config = {
    method: 'post',
    url: 'https://dev-ukef-mdm-ea-v1.uk-e1.cloudhub.io/api/v1/premium/schedule',
    headers: {
      Authorization: 'Basic NjEyYWJkZGM4ZGQ1NDVkZTlhN2RhZGJlNmQ3MGQ1MTQ6YTY5RUMzMDg0YjUyNGI5N0EyMERGMmYyOTg2Qjc0MUM=',
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
  // response.statusCode
  //   .then((response) => statusCode = response.statusCode)
  //   .catch((error) => {
  //     console.error(`axios-error:${error}`);
  //   });
  // if (statusCode > 0) {
  //   return statusCode;
  // }


  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error calling Post Premium schedule. facilityURN:${facility.facilityURN}`);
};

const getScheduleData = async (facility) => {
  const response = await axios({
    method: 'get',
    url: 'https://dev-ukef-mdm-ea-v1.uk-e1.cloudhub.io/api/v1/premium/segments/50000010',
    // url: `${process.env.MULESOFT_API_PREMIUM_SEGMENTS_URL}/${50000010}`,
    auth: {
      username: process.env.MULESOFT_API_PREMIUM_SCHEDULE_KEY,
      password: process.env.MULESOFT_API_PREMIUM_SCHEDULE_SECRET,
    },
  }).catch((catchErr) => catchErr);

  if (response.data) {
    return response.data;
  }

  if (response && response.response && response.response.data) {
    return response.response.data;
  }
  console.log(`schedule response:${response}`);
  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error getting Premium schedule segments. Facility:${facility.facilityURN}`);
};

const getPremiumSchedule = async (facility) => {
  console.log('reference-data-proxy premiumScheduleController getPremiumSchedule - startx');
  const postPremiumScheduleResponse = await postPremiumSchedule(facility);
  console.log(`getPremiumSchedule - postPremiumScheduleResponse:${postPremiumScheduleResponse}`);
  if (postPremiumScheduleResponse === 200 || postPremiumScheduleResponse === 201) {
    console.log('getPremiumSchedule - getPremiumSchedule if block');
    const schedule = await getScheduleData(50000010);
    console.log(`getPremiumSchedule - schedule:${JSON.stringify(schedule)}`);
    return schedule;
  }
  console.error(`Error calling Premium schedule. Facility:${facility.facilityURN}`);
  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error calling Premium schedule. Facility:${facility._id}`);
};
exports.getPremiumSchedule = getPremiumSchedule;
