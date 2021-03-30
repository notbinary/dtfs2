const api = require('../api');

const getFacilityPremiumSchedule = async (facility, facilityExposurePeriod) => {
  console.log(`getFacilityPremiumSchedule -facility:${JSON.stringify(facility)}`);
  const premiumSchedule = await api.getPremiumSchedule(
    facility,
    facilityExposurePeriod,
  );
  console.log(`getFacilityPremiumSchedule -premiumSchedule:${JSON.stringify(premiumSchedule)}`);
  return premiumSchedule;
};


module.exports = getFacilityPremiumSchedule;
