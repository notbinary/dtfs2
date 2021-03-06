const express = require('express');
const passport = require('passport');

const { validate } = require('../role-validator');

const deals = require('./controllers/deal.controller');
const dealName = require('./controllers/deal-name.controller');
const dealStatus = require('./controllers/deal-status.controller');
const dealSubmissionDetails = require('./controllers/deal-submission-details.controller');
const dealClone = require('./controllers/deal-clone.controller');
const dealEligibilityCriteria = require('./controllers/deal-eligibility-criteria.controller');
const dealEligibilityDocumentation = require('./controllers/deal-eligibility-documentation.controller');
const banks = require('./controllers/banks.controller');
const currencies = require('./controllers/currencies.controller');
const countries = require('./controllers/countries.controller');
const feedback = require('./controllers/feedback.controller');
const industrySectors = require('./controllers/industrySectors.controller');
const mandatoryCriteria = require('./controllers/mandatoryCriteria.controller');
const eligibilityCriteria = require('./controllers/eligibilityCriteria.controller');
const loans = require('./controllers/loans.controller');
const loanIssueFacility = require('./controllers/loan-issue-facility.controller');
const bonds = require('./controllers/bonds.controller');
const facilities = require('./controllers/facilities.controller');
const bondIssueFacility = require('./controllers/bond-issue-facility.controller');
const bondChangeCoverStartDate = require('./controllers/bond-change-cover-start-date.controller');
const loanChangeCoverStartDate = require('./controllers/loan-change-cover-start-date.controller');
const mga = require('./controllers/mga.controller');

const users = require('./users/routes');
const { cleanXss, fileUpload } = require('./middleware');

const gef = require('./gef/routes');

const authRouter = express.Router();
const openRouter = express.Router();
const authRouterAllowXss = express.Router();


authRouterAllowXss.use(
  passport.authenticate('jwt', { session: false }),
);

authRouter.use(
  passport.authenticate('jwt', { session: false }),
  cleanXss,
);

authRouter.use('/gef', gef);

authRouter.route('/deals')
  .post(
    validate({ role: ['maker'] }),
    deals.create,
  );

authRouter.route('/deals/import')
  .post(
    validate({ role: ['data-admin'] }),
    deals.import,
  );

authRouter.route('/deals/:id/status')
  .get(
    validate({ role: ['maker', 'checker'] }),
    dealStatus.findOne,
  )
  .put(
    validate({ role: ['maker', 'checker', 'interface'] }),
    dealStatus.update,
  );

authRouter.route('/deals/:id/submission-details')
  .get(
    validate({ role: ['maker', 'checker'] }),
    dealSubmissionDetails.findOne,
  )
  .put(
    validate({ role: ['maker'] }),
    dealSubmissionDetails.update,
  );

authRouter.route('/deals/:id/bankSupplyContractName')
  .put(
    validate({ role: ['maker'] }),
    dealName.update,
  );

authRouter.route('/deals/:id/loan/create')
  .put(
    validate({ role: ['maker'] }),
    loans.create,
  );

authRouter.route('/deals/:id/loan/:loanId')
  .get(
    validate({ role: ['maker'] }),
    loans.getLoan,
  )
  .put(
    validate({ role: ['maker'] }),
    loans.updateLoan,
  )
  .delete(
    validate({ role: ['maker'] }),
    loans.deleteLoan,
  );

authRouter.route('/deals/:id/loan/:loanId/issue-facility')
  .put(
    validate({ role: ['maker'] }),
    loanIssueFacility.updateLoanIssueFacility,
  );

authRouter.route('/deals/:id/loan/:loanId/change-cover-start-date')
  .put(
    validate({ role: ['maker'] }),
    loanChangeCoverStartDate.updateLoanCoverStartDate,
  );

authRouter.route('/deals/:id/bond/create')
  .put(
    validate({ role: ['maker'] }),
    bonds.create,
  );

authRouter.route('/deals/:id/bond/:bondId')
  .get(
    validate({ role: ['maker'] }),
    bonds.getBond,
  )
  .put(
    validate({ role: ['maker'] }),
    bonds.updateBond,
  )
  .delete(
    validate({ role: ['maker'] }),
    bonds.deleteBond,
  );

authRouter.route('/deals/:id/bond/:bondId/issue-facility')
  .put(
    validate({ role: ['maker'] }),
    bondIssueFacility.updateBondIssueFacility,
  );

authRouter.route('/deals/:id/bond/:bondId/change-cover-start-date')
  .put(
    validate({ role: ['maker'] }),
    bondChangeCoverStartDate.updateBondCoverStartDate,
  );

authRouter.route('/deals/:id/multiple-facilities')
  .post(
    validate({ role: ['maker'] }),
    facilities.createMultiple,
  );

authRouter.route('/deals/:id')
  .get(
    validate({ role: ['maker', 'checker'] }),
    deals.findOne,
  )
  .put(
    validate({ role: ['maker'] }),
    deals.update,
  )
  .delete(
    validate({ role: ['maker'] }),
    deals.delete,
  );

authRouter.route('/deals/:id/clone')
  .post(
    validate({ role: ['maker'] }),
    dealClone.clone,
  );

authRouter.route('/deals/:id/eligibility-criteria')
  .put(
    validate({ role: ['maker'] }),
    dealEligibilityCriteria.update,
  );

authRouter.route('/deals/:id/eligibility-documentation')
  .put(
    validate({ role: ['maker'] }),
    fileUpload.any(),
    dealEligibilityDocumentation.update,
  );

authRouter.route('/deals/:id/eligibility-documentation/:fieldname/:filename')
  .get(
    validate({ role: ['maker', 'checker'] }),
    dealEligibilityDocumentation.downloadFile,
  );

authRouter.route('/banks')
  .get(
    banks.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    banks.create,
  );

authRouter.route('/banks/:id')
  .get(
    banks.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    banks.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    banks.delete,
  );

authRouter.route('/currencies')
  .get(
    currencies.findAll,
  );

authRouter.route('/currencies/:id')
  .get(
    currencies.findOne,
  );

authRouter.route('/countries')
  .get(
    countries.findAll,
  );

authRouter.route('/countries/:code')
  .get(
    countries.findOne,
  );


authRouter.route('/feedback')
  .get(
    validate({ role: ['data-admin'] }),
    feedback.findAll,
  )
  .post(
    validate({ role: ['maker', 'checker'] }),
    feedback.create,
  );

authRouter.route('/feedback/:id')
  .get(
    validate({ role: ['data-admin'] }),
    feedback.findOne,
  )
  .delete(
    validate({ role: ['data-admin'] }),
    feedback.delete,
  );

authRouter.route('/industry-sectors')
  .get(
    industrySectors.findAll,
  );


authRouter.route('/industry-sectors/:code')
  .get(
    industrySectors.findOne,
  );

authRouter.route('/eligibility-criteria')
  .get(
    eligibilityCriteria.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    eligibilityCriteria.create,
  );

authRouter.route('/eligibility-criteria/:id')
  .get(
    eligibilityCriteria.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    eligibilityCriteria.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    eligibilityCriteria.delete,
  );

authRouter.route('/mga')
  .get(
    mga.findAllByUserOrganisation,
  );

authRouter.route('/mga/:filename')
  .get(
    mga.downloadMga,
  );

authRouterAllowXss.route('/mandatory-criteria')
  .get(
    mandatoryCriteria.findAll,
  )
  .post(
    validate({ role: ['editor'] }),
    mandatoryCriteria.create,
  );

authRouterAllowXss.route('/mandatory-criteria/:id')
  .get(
    mandatoryCriteria.findOne,
  )
  .put(
    validate({ role: ['editor'] }),
    mandatoryCriteria.update,
  )
  .delete(
    validate({ role: ['editor'] }),
    mandatoryCriteria.delete,
  );

openRouter.route('/users')
  .get(
    users.list,
  )
  .post(
    users.create,
  );

openRouter.route('/users/:_id')
  .get(
    users.findById,
  )
  .put(
    users.updateById,
  ).delete(
    users.remove,
  );

openRouter.route('/users/:_id/disable')
  .delete(
    users.disable,
  );

openRouter.route('/login')
  .post(
    users.login,
  );

openRouter.route('/users/reset-password')
  .post(
    users.resetPassword,
  );

openRouter.route('/users/reset-password/:resetPwdToken')
  .post(
    users.resetPasswordWithToken,
  );

// simplest token-validator
authRouter.get(
  '/validate',
  validate(),
  (req, res) => {
    res.status(200).send();
  },
);

authRouter.get('/test/protected', (req, res) => {
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

authRouter.get('/test/protected/maker', (req, res) => {
  if (!req.user.roles.includes('maker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

authRouter.get('/test/protected/checker', (req, res) => {
  if (!req.user.roles.includes('checker')) {
    res.status(401).json({ succes: false, msg: "you don't have the right role" });
  }
  res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
});

module.exports = { authRouter, openRouter, authRouterAllowXss };
