const DEFAULTS = require('../defaults');
const db = require('../../drivers/db-client');
const getDealErrors = require('../validation/deal');
const { isSuperUser, userHasAccessTo } = require('../users/checks');
const { generateDealId } = require('../../utils/generate-ids');
const validate = require('../validation/completeDealValidation');
const calculateStatuses = require('../section-status/calculateStatuses');
const calculateDealSummary = require('../deal-summary');
const { findEligibilityCriteria } = require('./eligibilityCriteria.controller');
const api = require('../api');

const dealsFilters = (user, filters = []) => {
  const sanitisedFilters = [...filters];

  // add the bank clause if we're not a superuser
  if (!isSuperUser(user)) {
    sanitisedFilters.push({ 'exporter._id': user.bank.id });
  }

  // TODO: some transformations may be needed for certain filters, such as general keyword filter

  let result = {};
  if (sanitisedFilters.length === 1) {
    [result] = sanitisedFilters;
  } else if (sanitisedFilters.length > 1) {
    result = {
      $and: sanitisedFilters,
    };
  }

  return result;
};

const findDeals = async (requestingUser, filters, sort) => {
  const sanitisedFilters = dealsFilters(requestingUser, filters, sort);
  return api.queryDeals(sanitisedFilters, sort);
};

exports.findDeals = findDeals;

const findPaginatedDeals = async (requestingUser, start = 0, pagesize = 20, filters, sort) => {
  const sanitisedFilters = dealsFilters(requestingUser, filters);
  return api.queryDeals(sanitisedFilters, sort, start, pagesize);
};
exports.findPaginatedDeals = findPaginatedDeals;

const findOneDeal = async (_id, callback) => {
  const deal = await api.findOneDeal(_id);

  if (callback) {
    callback(deal);
  }

  return deal;
};

exports.findOneDeal = findOneDeal;

const fillInEligibilityCriteria = (criterias, answers) => criterias.map((criteria) => {
  const matchingAnswer = answers ? answers.find((answer) => answer.id === criteria.id) : null;
  if (!matchingAnswer) {
    return criteria;
  }
  return {
    ...criteria,
    ...matchingAnswer,
  };
});

const createDealEligibility = async (eligibility) => {
  const beingGivenEligibility = (eligibility && eligibility.criteria);
  const eligibilityCriteria = await findEligibilityCriteria();

  // if we're being asked to create a deal and being given an eligibility block
  // use details out of the eligibility block over the details we get from the API
  const eligibilityCriteriaWithAnswers = beingGivenEligibility
    ? fillInEligibilityCriteria(eligibilityCriteria, eligibility.criteria)
    : eligibilityCriteria;

  const eligibilityStatus = eligibility && eligibility.status
    ? eligibility.status
    : DEFAULTS.DEALS.eligibility.status;

  const eligibilityCriteria11AgentDetails = () => {
    if (beingGivenEligibility) {
      const { criteria, status, ...eligibilityAgentDetails } = eligibility;
      return eligibilityAgentDetails;
    }
    return null;
  };

  return {
    status: eligibilityStatus,
    criteria: eligibilityCriteriaWithAnswers,
    ...eligibilityCriteria11AgentDetails(),
  };
};

const createNewDealData = async (deal, maker) => {
  const newDeal = {
    ...DEFAULTS.DEALS,
    ...deal,
    details: {
      ...DEFAULTS.DEALS.details,
      ...deal.details,
      maker,
      owningBank: maker.bank,
    },
    eligibility: await createDealEligibility(deal.eligibility),
  };

  /*
  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count) {
    return {
      ...newDeal,
      validationErrors,
    };
  }
*/
  return newDeal;
};

const createDeal = async (dealBody, user) => {
  const deal = await createNewDealData(dealBody, user);
  return api.createDeal(deal, user);
};
exports.createDeal = createDeal;

exports.create = async (req, res) => {
  const { status, data } = await createDeal(req.body, req.user);
  return res.status(status).send(data);
};

exports.findOne = (req, res) => {
  findOneDeal(req.params.id, (deal) => {
    if (!deal) {
      res.status(404).send();
    } else if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      // apply realtime validation so we catch any time-dependent fields
      //  that have -become- invalid..
      const validationErrors = validate(deal);
      const dealWithStatuses = calculateStatuses(deal, validationErrors);

      const dealWithSummary = {
        ...dealWithStatuses,
        summary: calculateDealSummary(deal),
      };

      res.status(200).send({
        deal: dealWithSummary,
        validationErrors,
      });
    }
  });
};

const updateDeal = async (dealId, dealUpdate, user) => {
  const updatedDeal = await api.updateDeal(dealId, dealUpdate, user);
  return updatedDeal;
};
exports.updateDeal = updateDeal;

exports.update = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      const updatedDeal = await updateDeal(
        dealId,
        req.body,
        req.user,
        deal,
      );
      res.status(200).json(updatedDeal);
    }
  });
};

exports.delete = async (req, res) => {
  const dealId = req.params.id;

  await findOneDeal(dealId, async (deal) => {
    if (!deal) res.status(404).send();

    if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    } else {
      const response = await api.deleteDeal(dealId);
      res.status(response.status).send(response.body);
    }
  });
};

const importDeal = async (req, res) => {
  if (!isSuperUser(req.user)) {
    res.status(401).send();
  }

  const collection = await db.getCollection('deals');

  const newDeal = {
    ...req.body,
  };

  const validationErrors = getDealErrors(newDeal);

  if (validationErrors.count !== 0) {
    return res.status(400).send({
      ...newDeal,
      validationErrors,
    });
  }

  const response = await collection.insertOne({
    _id: newDeal._id || await generateDealId(), // eslint-disable-line no-underscore-dangle
    ...newDeal,
  }).catch((err) => {
    const status = err.code === 11000 ? 406 : 500;
    return res.status(status).send(err);
  });

  const createdDeal = response.ops && response.ops[0];
  return res.status(200).send(createdDeal);
};

exports.import = async (req, res) => {
  const result = await importDeal(req, res);
  return result;
};
