/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 *
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *    function app in Kudu
 */

const df = require('durable-functions');

const mappings = require('../mappings');

module.exports = df.orchestrator(function* updateACBSfacility(context) {
  const firstRetryIntervalInMilliseconds = 5000;
  const maxNumberOfAttempts = 3;

  const retryOptions = new df.RetryOptions(firstRetryIntervalInMilliseconds, maxNumberOfAttempts);

  const {
    facilityId, facility, supplierName,
  } = context.df.getInput();

  // Facility Master
  const acbsFacility = yield context.df.callActivity(
    'activity-get-facility-master',
    { facilityId },
    retryOptions,
  );
  context.log({ acbsFacility });

  const acbsFacilityMasterInput = mappings.facility.facilityUpdate(facility, acbsFacility, supplierName);

  context.log({ acbsFacilityMasterInput });
  const updatedFacilityMaster = yield context.df.callActivity(
    'activity-update-facility-master',
    { facilityId, acbsFacilityMasterInput, updateType: 'issue' },
    retryOptions,
  );
  context.log({ updatedFacilityMaster });
  return {
    // eslint-disable-next-line no-underscore-dangle
    facilityId,
    updatedFacilityMaster,
  };
});
