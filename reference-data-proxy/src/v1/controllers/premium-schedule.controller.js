/* eslint-disable no-underscore-dangle */
// Premium Schedule API returns the premium schedule for a given facility
//
// the flow is:
// 1) Post parameters to Premium Schedule API, returns  header location to load the segments
// 2) Premium Schedule Segments gets the segments by facilityURN
const axios = require('axios');
const { objectIsEmpty } = require('../../utils/object');

const postPremiumSchedule = async (premiumScheduleParameters) => {
  if (objectIsEmpty(premiumScheduleParameters)) {
    console.log('Facility data not valid for premium schedule');
    return null;
  }

  const config = {
    method: 'post',
    url: `${process.env.MULESOFT_API_UKEF_MDM_EA_URL}/premium/schedule`,
    auth: {
      username: process.env.MULESOFT_API_UKEF_MDM_EA_KEY,
      password: process.env.MULESOFT_API_UKEF_MDM_EA_SECRET,
    },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [premiumScheduleParameters],
  };

  return axios(config)
    .catch((catchErr) => {
      console.log(`Error calling Post Premium schedule with facilityURN: ${premiumScheduleParameters.facilityURN} \n`, catchErr.response);
    }).then((response) => {
      if (response && response.status) {
        return response.status;
      }
      return response;
    });
};

const getScheduleData = async (facilityURN) => {
  const url = `${process.env.MULESOFT_API_UKEF_MDM_EA_URL}/premium/segments/${facilityURN}`;
  const response = await axios({
    method: 'get',
    url,
    auth: {
      username: process.env.MULESOFT_API_UKEF_MDM_EA_KEY,
      password: process.env.MULESOFT_API_UKEF_MDM_EA_SECRET,
    },
  }).catch((catchErr) => catchErr);
  if (response) {
    return response;
  }

  // eslint-disable-next-line no-underscore-dangle
  return new Error(`Error getting Premium schedule segments. Facility:${facilityURN}`);
};

const getPremiumSchedule = async (req, res) => {
  const premiumScheduleParameters = req.body;

  const postPremiumScheduleResponse = await postPremiumSchedule(
    premiumScheduleParameters,
  );

  if (!postPremiumScheduleResponse) {
    console.log('Error calling Premium schedule API');
    return res.status(400).send();
  }

  if (postPremiumScheduleResponse === 200 || postPremiumScheduleResponse === 201) {
    const response = await getScheduleData(Number(premiumScheduleParameters.facilityURN));

    if (response.status === 200 || response.status === 201) {
      return res.status(response.status).send(response.data);
    }
  }

  return new Error(`Error calling Premium schedule. Facility:${premiumScheduleParameters.facilityURN}`);
};
exports.getPremiumSchedule = getPremiumSchedule;
