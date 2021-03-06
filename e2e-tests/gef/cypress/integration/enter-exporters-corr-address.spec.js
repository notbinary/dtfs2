/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import enterExportersCorAddress from './pages/enter-exporters-corr-address';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationIds = [];
let exporterId;
let token;

context('Enter Exporters Correspondence Address Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        body.items.forEach((item) => {
          applicationIds.push({ id: item._id, exporterId: item.exporterId });
        });
        // exporterId = body.items[0].exporterId;
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationIds[0].id}/enter-exporters-correspondence-address`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      enterExportersCorAddress.backLink();
      enterExportersCorAddress.headingCaption();
      enterExportersCorAddress.mainHeading();
      enterExportersCorAddress.form();
      enterExportersCorAddress.addressLine1();
      enterExportersCorAddress.addressLine2();
      enterExportersCorAddress.addressLine3();
      enterExportersCorAddress.locality();
      enterExportersCorAddress.postcode();
      enterExportersCorAddress.continueButton();
      enterExportersCorAddress.saveAndReturnButton();
    });

    it('redirects user to select exporters address page when clicking on `Back` Link', () => {
      enterExportersCorAddress.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0].id}/select-exporters-correspondence-address`));
    });

    it('pre-populates form with address when coming from select exporters correspondence address', () => {
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((tok) => {
          token = tok;
        })
        .then(() => cy.apiFetchAllApplications(token))
        .then(({ body }) => {
          applicationIds = [];
          body.items.forEach((item) => {
            applicationIds.push({ id: item._id, exporterId: item.exporterId });
          });
        })
        .then(() => {
          cy.apiUpdateExporter(applicationIds[1].exporterId, token, {
            addressLine1: 'Line 1',
            addressLine2: 'Line 2',
            addressLine3: 'Line 3',
          });
        });
      cy.login(CREDENTIALS.MAKER);
      cy.on('uncaught:exception', () => false);


      cy.visit(relative(`/gef/application-details/${applicationIds[1].id}/enter-exporters-correspondence-address`));
      enterExportersCorAddress.addressLine1().should('have.value', 'Line 1');
      enterExportersCorAddress.addressLine2().should('have.value', 'Line 2');
      enterExportersCorAddress.addressLine3().should('have.value', 'Line 3');
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows error message if no address has been selected from dropdown', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0].id}/enter-exporters-correspondence-address`));
      enterExportersCorAddress.continueButton().click();
      enterExportersCorAddress.errorSummary();
      enterExportersCorAddress.addressLine1Error();
      enterExportersCorAddress.postcodeError();
    });

    it('takes user to about export page if form has been filled in correctly', () => {
      enterExportersCorAddress.addressLine1().type('Line 1');
      enterExportersCorAddress.addressLine2().type('Line 2');
      enterExportersCorAddress.addressLine3().type('Line 3');
      enterExportersCorAddress.locality().type('Locality');
      enterExportersCorAddress.postcode().type('Postcode');
      enterExportersCorAddress.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0].id}/about-exporter`));
    });
  });

  describe('Clicking on Save and return button', () => {
    it('bypasses validation and takes user back to application details page', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0].id}/enter-exporters-correspondence-address`));
      enterExportersCorAddress.saveAndReturnButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0].id}`));
    });
  });

  describe('Status query is set to `change`', () => {
    it('hides `back button`', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0].id}/enter-exporters-correspondence-address?status=change`));
      enterExportersCorAddress.backLink().should('not.be.visible');
    });

    it('redirects user back to application details page when clicking on `Continue` button', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0].id}/enter-exporters-correspondence-address?status=change`));
      enterExportersCorAddress.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationIds[0].id}`));
    });
  });
});
