const moment = require('moment');
const $ = require('mongo-dot-notation');
const api = require('../api');
const db = require('../../drivers/db-client');
const { findOneBank } = require('./banks.controller');
const tfmController = require('./tfm.controller');
const isIssued = require('../helpers/is-issued');

const addToACBSLog = async ({
  deal = {}, facility = {}, bank = {}, acbsTaskLinks,
}) => {
  const collection = await db.getCollection('acbs-log');

  const acbsLog = await collection.insertOne({
    // eslint-disable-next-line no-underscore-dangle
    dealId: deal._id,
    deal,
    facility,
    bank,
    status: 'Running',
    instanceId: acbsTaskLinks.id,
    acbsTaskLinks,
    submittedDate: moment().format(),
  });

  return acbsLog;
};

const createACBS = async (deal) => {
  // Add bank's full details so we can reference partyUrn in function
  const bankId = deal.dealSnapshot.details.owningBank.id;
  const bank = await findOneBank(bankId);

  if (!bank) {
    return;
  }

  const { id, name, partyUrn } = bank;

  const acbsTaskLinks = await api.createACBS(deal, { id, name, partyUrn });
  await addToACBSLog({ deal, bank, acbsTaskLinks });
};


const checkAzureAcbsFunction = async () => {
  // Fetch outstanding functions

  const collection = await db.getCollection('acbs-log');
  const runningTasks = await collection.find({ status: 'Running' }).toArray();

  const tasks = runningTasks.map(({ acbsTaskLinks = {} }) => api.getFunctionsAPI(acbsTaskLinks.statusQueryGetUri));

  const taskList = await Promise.all(tasks);

  taskList.forEach(async (task) => {
    // eslint-disable-next-line no-underscore-dangle
    // Update
    if (task.runtimeStatus !== 'Running') {
      await collection.findOneAndUpdate(
        { instanceId: task.instanceId },
        $.flatten({
          status: task.runtimeStatus,
          acbsTaskResult: task,
        }),
      );
    }

    if (task.runtimeStatus === 'Completed') {
      const { facilities, ...dealAcbs } = task.output;

      await tfmController.updateAcbs(task.output.portalDealId, dealAcbs);
      const facilitiesUpdates = facilities.map((facility) => {
        const { facilityId, ...acbsFacility } = facility;
        return tfmController.updateFacilityAcbs(facilityId, acbsFacility);
      });
      await Promise.all(facilitiesUpdates);
    }
  });
};

const issueAcbsFacilities = async (deal) => {
  if (!deal.tfm.acbs) {
    // Hasn't been submitted to acbs yet so no need to do anything
    console.log('DEAL NOT YET SUBMITTED TO ACBS');
    return;
  }
  const tfmFacilities = await Promise.all(
    // eslint-disable-next-line no-underscore-dangle
    deal.dealSnapshot.facilities.map((facility) => api.findOneFacility(facility._id)),
  );

  console.log({ tfmFacilities: JSON.stringify(tfmFacilities, null, 4) });

  const acbsIssuedFacilities = await Promise.all(
    tfmFacilities.filter((facility) => {
      // Only concerned with issued facilities on Portal that aren't issued on ACBS
      const facilityStageInAcbs = facility.tfm.acbs && facility.tfm.acbs.facilityStage;
      return !isIssued({ facilityStage: facilityStageInAcbs }) && isIssued(facility);
    }).map((facility) => api.updateACBSfacility(facility, deal.dealSnapshot.submissionDetails['supplier-name'])),
  );

  await Promise.all(
    acbsIssuedFacilities.map((acbsTaskLinks) => {
      console.log({ acbsTaskLinks });
      return true;
    }),
  );
};

module.exports = {
  createACBS,
  checkAzureAcbsFunction,
  issueAcbsFacilities,
};
