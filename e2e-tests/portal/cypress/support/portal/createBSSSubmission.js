const pages = require('../../integration/pages');

module.exports = (opts) => {
  cy.login(opts);

  pages.dashboard.createNewSubmission().click();

  pages.selectScheme.bss().click();
  pages.selectScheme.continue().click();
};
