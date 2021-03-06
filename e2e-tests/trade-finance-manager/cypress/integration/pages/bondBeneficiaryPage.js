const buyerPartyPage = {
  urnInput: () => cy.get('[data-cy="urn-input"]'),
  heading: () => cy.get('[data-cy="edit-heading"]'),
  saveButton: () => cy.get('[data-cy="save-button"]'),
  closeLink: () => cy.get('[data-cy="close-link"]'),
  uniqueRef: () => cy.get('[data-cy="bond-beneficiary-unique-ref"]'),
};

module.exports = buyerPartyPage;
