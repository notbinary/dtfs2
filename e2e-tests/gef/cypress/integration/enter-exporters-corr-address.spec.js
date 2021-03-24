/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import enterExportersCorAddress from './pages/enter-exporters-corr-address';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationId;
let exporterId;
let token;

context('Select Exporters Correspondence Address Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((tok) => {
        token = tok;
      })
      .then(() => cy.apiFetchAllApplications(token))
      .then(({ body }) => {
        applicationId = body.items[0]._id;
        exporterId = body.items[0].exporterId;
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationId}/enter-exporters-correspondence-address`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      enterExportersCorAddress.backButton();
      enterExportersCorAddress.headingCaption();
      enterExportersCorAddress.mainHeading();
      enterExportersCorAddress.form();
      enterExportersCorAddress.addressLine1();
      enterExportersCorAddress.addressLine2();
      enterExportersCorAddress.addressLine3();
      enterExportersCorAddress.locality();
      enterExportersCorAddress.postcode();
      enterExportersCorAddress.continueButton();
      enterExportersCorAddress.cancelButton();
    });

    it('redirects user to select exporters address page when clicking on `Back` Link', () => {
      enterExportersCorAddress.backButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/select-exporters-correspondence-address`));
    });

    it('pre-populates form with address when coming from select exporters correspondence address', () => {
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((tok) => {
          token = tok;
        })
        .then(() => cy.apiFetchAllApplications(token))
        .then(({ body }) => {
          applicationId = body.items[0]._id;
          exporterId = body.items[0].exporterId;
        })
        .then(() => {
          cy.apiUpdateExporter(exporterId, token, {
            addressLine1: 'Line 1',
            addressLine2: 'Line 2',
            addressLine3: 'Line 3',
          });
        });
      cy.login(CREDENTIALS.MAKER);
      cy.on('uncaught:exception', () => false);


      cy.visit(relative(`/gef/application-details/${applicationId}/enter-exporters-correspondence-address`));
      enterExportersCorAddress.addressLine1().should('have.value', 'Line 1');
      enterExportersCorAddress.addressLine2().should('have.value', 'Line 2');
      enterExportersCorAddress.addressLine3().should('have.value', 'Line 3');
    });
  });

  describe('Clicking on Continue button', () => {
    it('shows error message if no address has been selected from dropdown', () => {
      cy.apiLogin(CREDENTIALS.MAKER)
        .then((tok) => {
          token = tok;
        })
        .then(() => cy.apiFetchAllApplications(token))
        .then(({ body }) => {
          applicationId = body.items[1]._id;
          exporterId = body.items[0].exporterId;
        })
        .then(() => {
          cy.apiUpdateExporter(exporterId, token, {
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
          });
        });
      cy.login(CREDENTIALS.MAKER);
      cy.on('uncaught:exception', () => false);
      cy.visit(relative(`/gef/application-details/${applicationId}/enter-exporters-correspondence-address`));
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
      cy.url().should('eq', relative(`/gef/application-details/${applicationId}/about-exporter`));
    });
  });
});
