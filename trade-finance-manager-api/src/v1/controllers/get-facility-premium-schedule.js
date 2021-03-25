const api = require('../api');

const getFacilityPremiumSchedule = async (facility) => {
  console.log(`getFacilityPremiumSchedule -facility:${facility}`);
  const premiumSchedule = await api.getPremiumSchedule(
    facility,
  );
  console.log(`getFacilityPremiumSchedule -premiumSchedule:${facility}`);
  return premiumSchedule;
};


module.exports = getFacilityPremiumSchedule;
