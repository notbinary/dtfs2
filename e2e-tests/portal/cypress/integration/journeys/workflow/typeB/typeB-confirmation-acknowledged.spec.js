const { contract, contractConfirmSubmission } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

// test data we want to set up + work with..
const dealReadyToSubmit = require('./test-data/dealReadyToSubmit');


context('A checker confirms a deal; workflow responds with a confirmation_acknowledged status', () => {
  let goodDeal; let
    badDeal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertManyDeals([dealReadyToSubmit()], MAKER_LOGIN)
      .then((insertedDeals) => {
        goodDeal = insertedDeals[0];
      });
  });

  it('Checker submits a deal; workflow responds; UKEF_deal_id is updated within portal.', () => {
    //---------------------------------------------------------------
    // Checker logs in, submits deal to UKEF
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    contract.visit(goodDeal);
    contract.proceedToSubmit().click();

    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    cy.sendTypeB({
      header: {
        portal_deal_id: goodDeal._id,
        bank_deal_id: goodDeal.details.bankSupplyContractID,
        Message_Type: 'B',
        Action_Code: '006',
      },
      deal: {
        UKEF_deal_id: '123456',
        Deal_status: 'confirmation_acknowledged',
        Deal_comments: 'blah blah',
      },
      bonds: [
        {
          BSS_portal_facility_id: goodDeal.bondTransactions.items[0]._id,
          BSS_ukef_facility_id: '54321',
          BSS_status: 'Issued acknowledged',
          BSS_comments: 'blahblah blah blahblah',
        },
      ],
      loans: [
        {
          EWCS_portal_facility_id: goodDeal.loanTransactions.items[0]._id,
          EWCS_ukef_facility_id: '65432',
          EWCS_status: 'Issued acknowledged',
          EWCS_comments: 'blahblah blah blahblah',
        },

      ],
    });

    contract.visit(goodDeal);
    contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Acknowledged by UKEF');
    });
  });
});
