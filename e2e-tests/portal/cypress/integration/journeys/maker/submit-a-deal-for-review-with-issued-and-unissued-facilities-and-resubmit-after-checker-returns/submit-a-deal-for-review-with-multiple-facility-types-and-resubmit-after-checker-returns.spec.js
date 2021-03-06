const pages = require('../../../pages');
const mockUsers = require('../../../../fixtures/mockUsers');
const dealReadyToSubmitToChecker = require('./dealReadyToSubmitToChecker');

const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'Barclays Bank'));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('A maker and checker can submit and re-submit a deal to each other multiple times', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealReadyToSubmitToChecker, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle

        const { mockFacilities } = dealReadyToSubmitToChecker;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN); // eslint-disable-line no-underscore-dangle
    });
  });

  const assertFacilityTableValuesWithDealStatusInDraft = () => {
    dealFacilities.bonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.facilityStage);
      });
      bondRow.deleteLink().should('be.visible');
      bondRow.issueFacilityLink().should('not.be.visible');
    });

    dealFacilities.loans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.deleteLink().should('be.visible');
      loanRow.issueFacilityLink().should('not.be.visible');
    });
  };

  const assertFacilityTableValuesWithDealStatusInFurtherMakerInputRequired = () => {
    const unissuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Unissued');
    const issuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Issued');

    const conditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Conditional');
    const unconditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Unconditional');

    unissuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.facilityStage);
      });

      bondRow.issueFacilityLink().should('not.be.visible');
      bondRow.deleteLink().should('be.visible');
    });

    issuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.facilityStage);
      });

      bondRow.issueFacilityLink().should('not.be.visible');
      bondRow.deleteLink().should('be.visible');
    });

    conditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('not.be.visible');
      loanRow.deleteLink().should('be.visible');
    });

    unconditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('not.be.visible');
      loanRow.deleteLink().should('be.visible');
    });
  };

  const assertFacilityTableValuesWithDealStatusInReadyForChecker = () => {
    const unissuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Unissued');
    const issuedBonds = dealFacilities.bonds.filter((b) => b.facilityStage === 'Issued');

    const conditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Conditional');
    const unconditionalLoans = dealFacilities.loans.filter((l) => l.facilityStage === 'Unconditional');

    unissuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.facilityStage);
      });

      bondRow.issueFacilityLink().should('not.be.visible');
      bondRow.deleteLink().should('not.be.visible');
    });

    issuedBonds.forEach((bond) => {
      const bondId = bond._id; // eslint-disable-line no-underscore-dangle
      const bondRow = pages.contract.bondTransactionsTable.row(bondId);

      bondRow.bondStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      bondRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(bond.facilityStage);
      });

      bondRow.issueFacilityLink().should('not.be.visible');
      bondRow.deleteLink().should('not.be.visible');
    });

    conditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('not.be.visible');
      loanRow.deleteLink().should('not.be.visible');
    });

    unconditionalLoans.forEach((loan) => {
      const loanId = loan._id; // eslint-disable-line no-underscore-dangle
      const loanRow = pages.contract.loansTransactionsTable.row(loanId);

      loanRow.loanStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Completed');
      });

      loanRow.facilityStage().invoke('text').then((text) => {
        expect(text.trim()).to.equal(loan.facilityStage);
      });

      loanRow.issueFacilityLink().should('not.be.visible');
      loanRow.deleteLink().should('not.be.visible');
    });
  };

  it('Unchanged/unissued Facility statuses should be retained as they were in Draft (`Completed`) during all stages of submits/re-submits; `Delete` or `Issue Facility` links should appear for correct facility types.', () => {
    //---------------------------------------------------------------
    // maker submits deal to checker
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInDraft();

    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // checker returns deal to maker
    //---------------------------------------------------------------

    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    pages.contract.returnToMaker().click();
    pages.contractReturnToMaker.comments().type('Nope');
    pages.contractReturnToMaker.returnToMaker().click();

    //---------------------------------------------------------------
    // maker views deal
    //---------------------------------------------------------------

    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInFurtherMakerInputRequired();

    //---------------------------------------------------------------
    // maker re-submits deal with no changes
    //---------------------------------------------------------------
    pages.contract.proceedToReview().should('not.be.disabled');
    pages.contract.proceedToReview().click();
    pages.contractReadyForReview.comments().type('Ready for review');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    pages.contract.visit(deal);

    assertFacilityTableValuesWithDealStatusInReadyForChecker();
  });
});
