const mapFacility = require('./mapFacility');
const mapFacilityTfm = require('./mapFacilityTfm');

const mapFacilities = (facilities, dealDetails, dealTfm) => {
  const mappedFacilities = [];

  facilities.forEach((f) => {
    mappedFacilities.push({
      _id: f._id, // eslint-disable-line no-underscore-dangle
      facilitySnapshot: mapFacility(f.facilitySnapshot, f.tfm, dealDetails),
      tfm: mapFacilityTfm(f.tfm, dealTfm),
    });
  });

  return mappedFacilities;
};

module.exports = mapFacilities;
