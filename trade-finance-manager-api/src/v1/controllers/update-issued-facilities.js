const api = require('../api');
const CONSTANTS = require('../../constants');
const getFacilityExposurePeriod = require('./get-facility-exposure-period');
const getFacilityPremiumSchedule = require('./get-facility-premium-schedule');
const getGuaranteeDates = require('../helpers/get-guarantee-dates');
const { sendIssuedFacilitiesReceivedEmail } = require('./send-issued-facilities-received-email');

const updatedIssuedFacilities = async (deal) => {
  // Create deep clone
  const modifiedDeal = JSON.parse(JSON.stringify(deal));

  const {
    submissionDate: dealSubmissionDate,
  } = deal.dealSnapshot.details;

  const facilities = [
    ...modifiedDeal.dealSnapshot.bondTransactions.items,
    ...modifiedDeal.dealSnapshot.loanTransactions.items,
  ];

  const bonds = [];
  const loans = [];

  const allUpdatedFacilities = [];

  let updatedCount = 0;
  let shouldUpdateCount = 0;

  return new Promise((resolve) => {
    facilities.forEach(async (facility) => {
      const {
        _id: facilityId,
        facilityType,
        facilityStage,
        previousFacilityStage,
      } = facility;

      // bond facility is either Unissued or Issued.
      const bondIsNowIssued = ((previousFacilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED)
        && (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED));

      // loan facility is either Conditional or Unconditional
      const loanIsNowIssued = ((previousFacilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.CONDITIONAL)
        && (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNCONDITIONAL));

      const shouldUpdateFacility = (bondIsNowIssued || loanIsNowIssued);

      if (shouldUpdateFacility) {
        shouldUpdateCount += 1;

        // update portal facility status
        const facilityStatusUpdate = CONSTANTS.FACILITIES.FACILITY_STATUS_PORTAL.ACKNOWLEDGED;
        const updatedFacility = await api.updatePortalFacilityStatus(facilityId, facilityStatusUpdate);


        // update TFM facility exposure period / AKA 'Tenor'
        const facilityExposurePeriod = await getFacilityExposurePeriod(facility);

        const facilityGuaranteeDates = getGuaranteeDates(facility, dealSubmissionDate);

        const facilityPremiumSchedule = await getFacilityPremiumSchedule(
          facility,
          facilityExposurePeriod,
          facilityGuaranteeDates,
        );

        const facilityUpdate = {
          ...facilityExposurePeriod,
          facilityGuaranteeDates,
          premiumSchedule: facilityPremiumSchedule,
        };

        await api.updateFacility(facilityId, facilityUpdate);

        // update object to return in response
        const updatedFacilityResponseObj = {
          ...updatedFacility,
          tfm: {
            ...facilityUpdate,
          },
        };

        if (facilityType === 'bond') {
          bonds.push(updatedFacilityResponseObj);
        } else if (facilityType === 'loan') {
          loans.push(updatedFacilityResponseObj);
        }

        allUpdatedFacilities.push(updatedFacilityResponseObj);
        updatedCount += 1;
      } else if (facilityType === 'bond') {
        // update deal object to return in response
        bonds.push(facility);
      } else if (facilityType === 'loan') {
        loans.push(facility);
      }

      if (shouldUpdateCount === updatedCount) {
        modifiedDeal.dealSnapshot.bondTransactions.items = bonds;
        modifiedDeal.dealSnapshot.loanTransactions.items = loans;

        await sendIssuedFacilitiesReceivedEmail(
          modifiedDeal,
          allUpdatedFacilities,
        );

        return resolve(modifiedDeal);
      }
      return modifiedDeal;
    });
  });
};


exports.updatedIssuedFacilities = updatedIssuedFacilities;
