const CONSTANTS = require('../../../../constants');

const monthString = (period) => {
  if (Number(period) === 1) {
    return 'month';
  }

  return 'months';
};

const mapTenorDate = (facility, facilityTfm) => {
  const { facilityStage } = facility;

  let period;

  if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT) {
    period = facility.ukefGuaranteeInMonths;
  } else if (facilityTfm.exposurePeriodInMonths) {
    period = facilityTfm.exposurePeriodInMonths;
  }

  return `${period} ${monthString(period)}`;
};

module.exports = mapTenorDate;