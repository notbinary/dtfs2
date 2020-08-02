const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { updateBondInDeal } = require('./bonds.controller');
const { hasAllIssuedDateValues } = require('../facility-dates/issued-date');
const {
  hasAllRequestedCoverStartDateValues,
  updateRequestedCoverStartDate,
} = require('../facility-dates/requested-cover-start-date');
const { createTimestampFromSubmittedValues } = require('../facility-dates/timestamp');
const bondIssueFacilityValidationErrors = require('../validation/bond-issue-facility');

exports.updateBondIssueFacility = async (req, res) => {
  const {
    bondId,
  } = req.params;

  await findOneDeal(req.params.id, async (deal) => {
    if (deal) {
      if (!userHasAccessTo(req.user, deal)) {
        res.status(401).send();
      }

      const bond = deal.bondTransactions.items.find((b) =>
        String(b._id) === bondId); // eslint-disable-line no-underscore-dangle

      if (!bond) {
        return res.status(404).send();
      }

      let modifiedBond = {
        _id: bondId,
        ...bond,
        ...req.body,
      };

      if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
        modifiedBond = updateRequestedCoverStartDate(modifiedBond);
      } else {
        delete modifiedBond.requestedCoverStartDate;
      }

      if (hasAllIssuedDateValues(modifiedBond)) {
        modifiedBond.issuedDate = createTimestampFromSubmittedValues(req.body, 'issuedDate');
      } else {
        delete modifiedBond.issuedDate;
      }

      const validationErrors = bondIssueFacilityValidationErrors(
        modifiedBond,
        deal.details.submissionDate,
      );

      if (validationErrors.count === 0) {
        modifiedBond.issueFacilityDetailsProvided = true;
      }

      const updatedBond = await updateBondInDeal(req.params, req.user, deal, modifiedBond);

      if (validationErrors.count !== 0) {
        return res.status(400).send({
          validationErrors,
          bond: updatedBond,
        });
      }

      return res.status(200).send(updatedBond);
    }
    return res.status(404).send();
  });
};
