const {contract, contractAboutSupplier, contractAboutBuyer} = require('../../../pages');
const maker1 = {username: 'MAKER', password: 'MAKER'};

// test data we want to set up + work with..
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

context('about-supply-contract', () => {
  let deal;

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before( () => {
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, { ...maker1 })
      .then( insertedDeal =>  deal=insertedDeal );
  });

  it('A maker picks up a deal with the supplier details completed, and fills in the about-buyer-contract section, using the companies house search.', () => {
    cy.login({...maker1});

    // navigate to the about-buyer page
    contract.visit(deal);
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();

    // fill in the fields
    contractAboutBuyer.buyerName().type('Huggy Bear');
    contractAboutBuyer.countryOfBuyer().select('USA');
    contractAboutBuyer.destinationOfGoodsAndServices().select('USA');

    // save
    contractAboutBuyer.saveAndGoBack().click();

    // come back to the page
    contractAboutBuyer.visit(deal);

    // confirm the data is still there...
    contractAboutBuyer.buyerName().should('have.value', 'Huggy Bear');
    contractAboutBuyer.countryOfBuyer().should('have.value', 'USA');
    contractAboutBuyer.destinationOfGoodsAndServices().should('have.value', 'USA');

  });

});
