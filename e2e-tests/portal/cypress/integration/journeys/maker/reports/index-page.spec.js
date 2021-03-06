const { reports, defaults } = require('../../../pages');
const { indexPage } = reports;

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker') && !user.roles.includes('admin')) );
context('Reports index page', () => {

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('shows the right report links for a bank user', () => {
    cy.login(MAKER_LOGIN);
    indexPage.visit();

    indexPage.reports().should( (reports) => {
      expect(reports).to.contain("Audit supply contracts");
      expect(reports).to.contain("Audit transactions");
      expect(reports).to.contain("Countdown indicator");
      expect(reports).not.to.contain("Reconciliation report");
      expect(reports).to.contain("MIA/MIN cover start date change");
    });

    indexPage.subNavigation().should( (reports) => {
      expect(reports).to.contain("Audit supply contracts");
      expect(reports).to.contain("Audit transactions");
      expect(reports).to.contain("Countdown indicator");
      expect(reports).not.to.contain("Reconciliation report");
      expect(reports).to.contain("MIA/MIN cover start date change");
    });

  });
});
