
exports.getPremiumScheduleFacilityMap = (facility, facilityExposurePeriod) => {
  const map = facility;
  let premiumFrequencyId = 0;
  switch (facility.feeFrequency) {
    case 'Monthly':
      premiumFrequencyId = 1;
      break;
    case 'Quarterly':
      premiumFrequencyId = 2;
      break;
    case 'Annually':
      premiumFrequencyId = 4;
      break;
    default:
      throw new Error(`facility.feeFrequency "${facility.feeFrequency}" not valid. `);
  }
  map.facilityURN = facility.ukefFacilityId;
  map.productGroup = facility.facilityType === 'bond' ? 'BS' : 'EW';
  map.premiumTypeId = 1;
  map.premiumFrequencyId = premiumFrequencyId;
  map.guaranteeCommencementDate = '2021-01-19';
  map.guaranteeExpiryDate = '2022-05-17';
  map.guaranteePercentage = facility.riskMarginFee;
  map.guaranteeFeePercentage = facility.coveredPercentage;
  map.dayBasis = facility.dayCountBasis;
  map.exposurePeriod = facilityExposurePeriod;
  map.cumulativeAmount = null;
  map.maximumLiability = facility.ukefExposure;
  return map;
};
