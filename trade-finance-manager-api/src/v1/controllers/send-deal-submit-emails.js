const moment = require('moment');
const api = require('../api');
const CONSTANTS = require('../../constants');
const formattedTimestamp = require('../formattedTimestamp');
const { getFirstTask } = require('../helpers/tasks');
const { capitalizeFirstLetter } = require('../../utils/string');
const sendTfmEmail = require('./send-tfm-email');

// make sure the first task is `Match or Create Parties`
// if the first task changes in the future, we might not want to send an email.
const shouldSendFirstTaskEmail = (firstTask) =>
  (firstTask.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES);

const generateFacilitiesListString = (facilities) => {
  let result;

  facilities.forEach((facility, index) => {
    const { facilityType, ukefFacilityID, bankReferenceNumber } = facility.facilitySnapshot;

    const fType = capitalizeFirstLetter(facilityType);
    const listItem = `- ${fType} facility with your reference ${bankReferenceNumber} has been given the UKEF reference: ${ukefFacilityID}`;

    if (index === 0) {
      result = listItem;
    } else {
      result += `\n ${listItem}`;
    }
  });

  return result;
};

const sendFirstTaskEmail = async (deal) => {
  const { tfm, dealSnapshot } = deal;
  const { tasks } = tfm;

  const firstTask = getFirstTask(tasks);

  const { team } = firstTask;

  if (shouldSendFirstTaskEmail(firstTask)) {
    const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_SUBMITTED_COMPLETE_TASK_MATCH_OR_CREATE_PARTIES;

    const { email: sendToEmailAddress } = await api.findOneTeam(team.id);

    const {
      submissionType,
      submissionDate,
      owningBank,
    } = dealSnapshot.details;

    const {
      'supplier-name': exporterName,
    } = dealSnapshot.submissionDetails;

    const formattedSubmissionDate = moment(formattedTimestamp(submissionDate)).format('Do MMMM YYYY');

    const emailVariables = {
      exporterName,
      submissionType,
      submissionDate: formattedSubmissionDate,
      bank: owningBank.name,
    };

    const emailResponse = await sendTfmEmail(
      templateId,
      sendToEmailAddress,
      emailVariables,
      deal,
    );
    return emailResponse;
  }

  return null;
};

const sendMiaAcknowledgement = async (deal) => {
  const { dealSnapshot } = deal;

  const {
    bankSupplyContractID: bankReferenceNumber,
    ukefDealId: ukefDealID,
    maker,
    submissionType,
  } = dealSnapshot.details;

  if (submissionType !== CONSTANTS.DEALS.SUBMISSION_TYPE.MIA) {
    return null;
  }

  const {
    'supplier-name': exporterName,
  } = dealSnapshot.submissionDetails;

  const {
    firstname: recipientName,
    email: sendToEmailAddress,
  } = maker;

  const templateId = CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_MIA_RECEIVED;

  const emailVariables = {
    recipientName,
    exporterName,
    bankReferenceNumber,
    ukefDealID,
    bssList: generateFacilitiesListString(dealSnapshot.bondTransactions.items),
    ewcsList: generateFacilitiesListString(dealSnapshot.loanTransactions.items),
  };

  console.log({
    templateId,
    emailVariables,
    deal,
  });
  const emailResponse = await sendTfmEmail(
    templateId,
    'andrew.price@foundry4.com', // sendToEmailAddress,
    emailVariables,
    deal,
  );
  return emailResponse;
};

const sendDealSubmitEmails = async (deal) => {
  if (!deal) {
    return false;
  }

  // send email for the first task
  const firstTaskEmail = await sendFirstTaskEmail(deal);

  // TODO in future ticket DTFS2-3221 - send email for MIA acknowledgment
  const emailAcknowledgementMIA = await sendMiaAcknowledgement(deal);

  return {
    firstTaskEmail,
    emailAcknowledgementMIA,
  };
};

module.exports = {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
};
