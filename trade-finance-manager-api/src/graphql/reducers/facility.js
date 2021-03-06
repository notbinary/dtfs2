const mapFacility = require('./mappings/facilities/mapFacility');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');

const facilityReducer = (facility, dealDetails, dealTfm) => {
  const result = {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    facilitySnapshot: mapFacility(
      facility.facilitySnapshot,
      facility.tfm,
      dealDetails,
    ),
    tfm: mapFacilityTfm(facility.tfm, dealTfm),
  };

  return result;
};

module.exports = facilityReducer;
