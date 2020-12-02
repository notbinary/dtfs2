// commands used to interact directly with TFM UI
Cypress.Commands.add('login', require('./ui/logIn'));


// commands used to interact directly with Portal API
// NOTE: this will eventually become TFM API, that calls Deal API.
// right now we only have TFM API that can find a deal, Portal API does the rest.
Cypress.Commands.add('insertOneDeal', require('./portal-api/insertOneDeal'));
Cypress.Commands.add('insertManyDeals', require('./portal-api/insertManyDeals'));
Cypress.Commands.add('deleteDeals', require('./portal-api/deleteDeals'));
