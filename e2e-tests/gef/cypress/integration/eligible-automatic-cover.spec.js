/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import eligibleAutomaticCover from './pages/eligible-automatic-cover';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationId;

context('Eligible Automatic Cover Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applicationId = body.items[0]._id;
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationId}/eligible-automatic-cover`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      eligibleAutomaticCover.mainHeading();
      eligibleAutomaticCover.continueButton();
    });
  });

  describe('Clicking on Continue button', () => {
    it('redirects user to Manual Application Page', () => {
      eligibleAutomaticCover.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}`));
    });
  });
});
