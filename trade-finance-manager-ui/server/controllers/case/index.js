import api from '../../api';
import stringHelpers from '../../helpers/string';
import caseHelpers from './helpers';

const { hasValue } = stringHelpers;
const {
  getTask,
  mapAssignToSelectOptions,
} = caseHelpers;


const getCaseDeal = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/deal/deal.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'deal',
    dealId,
    user: req.session.user,
  });
};

const getCaseTasks = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/tasks/tasks.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user: req.session.user,
  });
};

const getCaseTask = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const { taskId } = req.params;
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const { user } = req.session;

  let allTasksWithoutGroups = [];

  deal.tfm.tasks.forEach((group) => {
    const { groupTasks } = group;
    allTasksWithoutGroups = [
      ...allTasksWithoutGroups,
      ...groupTasks,
    ];
  });

  const task = getTask(taskId, allTasksWithoutGroups);

  const allTeamMembers = await api.getTeamMembers(task.team.id);

  return res.render('case/tasks/task.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'tasks',
    dealId,
    user,
    task,
    assignToSelectOptions: mapAssignToSelectOptions(task, user, allTeamMembers),
  });
};

const putCaseTask = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const { taskId } = req.params;

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const {
    assignedTo: assignedToValue, // will be user._id or `Unassigned`
    status,
  } = req.body;

  const update = {
    id: taskId,
    status,
    assignedTo: {
      userId: assignedToValue,
    },
  };

  await api.updateTask(dealId, update);

  return res.redirect(`/case/${dealId}/tasks`);
};

const getCaseFacility = async (req, res) => {
  const { facilityId } = req.params;
  const facility = await api.getFacility(facilityId);

  if (!facility) {
    return res.redirect('/not-found');
  }

  const { associatedDealId } = facility.facilitySnapshot;
  const deal = await api.getDeal(associatedDealId);

  return res.render('case/facility/facility.njk', {
    deal: deal.dealSnapshot,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    facility: facility.facilitySnapshot,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'facility',
    facilityId,
    facilityTfm: facility.tfm,
    user: req.session.user,
  });
};

const getCaseParties = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/parties.njk', {
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    dealId,
    user: req.session.user,
  });
};

const getPartyDetails = (partyType) => (
  async (req, res) => {
    const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
    const deal = await api.getDeal(dealId);

    if (!deal) {
      return res.redirect('/not-found');
    }

    return res.render(`case/parties/edit/${partyType}-edit.njk`, {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'parties',
      deal: deal.dealSnapshot,
      tfm: deal.tfm,
      dealId,
      user: req.session.user,
    });
  }
);

const getExporterPartyDetails = getPartyDetails('exporter');
const getBuyerPartyDetails = getPartyDetails('buyer');
const getAgentPartyDetails = getPartyDetails('agent');
const getIndemnifierPartyDetails = getPartyDetails('indemnifier');

const getBondIssuerPartyDetails = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-issuer-edit.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    user: req.session.user,
  });
};


const getBondBeneficiaryPartyDetails = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/parties/edit/bonds-beneficiary-edit.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'parties',
    deal: deal.dealSnapshot,
    user: req.session.user,
  });
};

const getUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/pricing-and-risk.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user: req.session.user,
  });
};

const getUnderWritingPricingAndRiskEdit = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
    activePrimaryNavigation: 'manage work',
    activeSubNavigation: 'underwriting',
    activeSideNavigation: 'pricing and risk',
    deal: deal.dealSnapshot,
    tfm: deal.tfm,
    dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
    user: req.session.user,
  });
};

const postUnderWritingPricingAndRisk = async (req, res) => {
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle
  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  const existingValue = deal.tfm.exporterCreditRating;
  let submittedValue;

  if (hasValue(req.body.exporterCreditRatingOther)
    && req.body.exporterCreditRatingOther !== existingValue) {
    submittedValue = req.body.exporterCreditRatingOther;
  } else {
    submittedValue = req.body.exporterCreditRating;
  }

  let validationErrors;

  const hasValidationError = ((req.body.exporterCreditRating === 'Other'
    && !req.body.exporterCreditRatingOther)
    || !hasValue(req.body.exporterCreditRating));

  if (hasValidationError) {
    if (!hasValue(req.body.exporterCreditRating)) {
      validationErrors = {
        count: 1,
        errorList: {
          exporterCreditRating: {
            text: 'Enter a credit rating',
            order: '1',
          },
        },
        summary: [{
          text: 'Enter a credit rating',
          href: '#exporterCreditRating',
        }],
      };
    }

    if (req.body.exporterCreditRating === 'Other' && !hasValue(req.body.exporterCreditRatingOther)) {
      validationErrors = {
        count: 1,
        errorList: {
          exporterCreditRatingOther: {
            text: 'Enter a credit rating',
            order: '1',
          },
        },
        summary: [{
          text: 'Enter a credit rating',
          href: '#exporterCreditRatingOther',
        }],
      };
    }

    return res.render('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      activeSideNavigation: 'pricing and risk',
      deal: deal.dealSnapshot,
      tfm: {
        ...deal.tfm,
        exporterCreditRating: submittedValue,
      },
      dealId: deal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
      user: req.session.user,
      validationErrors,
    });
  }

  const update = {
    exporterCreditRating: submittedValue,
  };

  await api.updateCreditRating(dealId, update);

  return res.redirect(`/case/${dealId}/underwriting/pricing-and-risk`);
};

const postPartyDetails = (partyType) => (
  async (req, res) => {
    const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

    const deal = await api.getDeal(dealId);

    if (!deal) {
      return res.redirect('/not-found');
    }

    const update = {
      [partyType]: req.body,
    };

    await api.updateParty(dealId, update);

    return res.redirect(`/case/${dealId}/parties`);
  }
);

const postExporterPartyDetails = postPartyDetails('exporter');
const postBuyerPartyDetails = postPartyDetails('buyer');
const postAgentPartyDetails = postPartyDetails('agent');
const postIndemnifierPartyDetails = postPartyDetails('indemnifier');

const postTfmFacility = async (req, res) => {
  const { facilityId, ...facilityUpdateFields } = req.body;
  const dealId = req.params._id; // eslint-disable-line no-underscore-dangle

  const deal = await api.getDeal(dealId);

  if (!deal) {
    return res.redirect('/not-found');
  }

  await Promise.all(
    facilityId.map((id, index) => {
      const facilityUpdate = {};
      Object.entries(facilityUpdateFields).forEach(([fieldName, values]) => {
        facilityUpdate[fieldName] = values[index];
      });
      return api.updateFacility(id, facilityUpdate);
    }),
  );


  // const { data } = await api.updateParty(dealId, update);

  return res.redirect(`/case/${dealId}/parties`);
};


export default {
  getCaseDeal,
  getCaseTasks,
  getCaseTask,
  putCaseTask,
  getCaseFacility,
  getCaseParties,
  getExporterPartyDetails,
  getBuyerPartyDetails,
  getAgentPartyDetails,
  getIndemnifierPartyDetails,
  getBondIssuerPartyDetails,
  getBondBeneficiaryPartyDetails,
  getUnderWritingPricingAndRisk,
  getUnderWritingPricingAndRiskEdit,
  postUnderWritingPricingAndRisk,
  postExporterPartyDetails,
  postBuyerPartyDetails,
  postAgentPartyDetails,
  postIndemnifierPartyDetails,
  postTfmFacility,
};
