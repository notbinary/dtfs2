﻿/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 *  * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
const moment = require('moment');
const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');
const { findMissingMandatory } = require('../helpers/mandatoryFields');

const mandatoryFields = [
  'facilityIdentifier',
  'lenderTypeCode',
  'initialBundleStatusCode',
];

const createCodeValueTransaction = async (context) => {
  const { acbsCodeValueTransactionInput } = context.bindingData;

  const missingMandatory = findMissingMandatory(acbsCodeValueTransactionInput, mandatoryFields);

  if (missingMandatory.length) {
    return Promise.resolve({ missingMandatory });
  }

  const submittedToACBS = moment().format();
  const { status, data } = await api.createCodeValueTransaction(acbsCodeValueTransactionInput);

  if (isHttpErrorStatus(status)) {
    throw new Error(JSON.stringify({
      name: 'ACBS Party create error',
      status,
      dealIdentifier: acbsCodeValueTransactionInput.dealIdentifier,
      submittedToACBS,
      receivedFromACBS: moment().format(),
      dataReceived: data,
      dataSent: acbsCodeValueTransactionInput,
    }, null, 4));
  }

  return {
    submittedToACBS,
    receivedFromACBS: moment().format(),
    ...data,
  };
};

module.exports = createCodeValueTransaction;
