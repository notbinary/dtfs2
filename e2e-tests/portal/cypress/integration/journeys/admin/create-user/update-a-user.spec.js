const { header, users, createUser, editUser} = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );

context('Admin user updates an existing user', () => {
  const userToUpdate = {
    username: 'another.address@some.com',
    password: 'Aleg1tP@ssword',
    firstname: 'bobert',
    surname: 'the builder',
    bank: 'Barclays Bank',
    roles: ['maker'],
  }

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.removeUserIfPresent(userToUpdate, ADMIN_LOGIN);
  });

  it('Create a user, then edit the user and change their role(s)', () => {
    // login and go to dashboard
    cy.login(ADMIN_LOGIN);
    header.users().click();

    // add user
    users.addUser().click();
    for (const role of userToUpdate.roles) {
      createUser.role(role).click();
    }
    createUser.username().type(userToUpdate.username);
    createUser.manualPassword().click();
    createUser.password().type(userToUpdate.password);
    createUser.confirmPassword().type(userToUpdate.password);
    createUser.firstname().type(userToUpdate.firstname);
    createUser.surname().type(userToUpdate.surname);
    createUser.bank().select(userToUpdate.bank);
    createUser.createUser().click();

    users.row(userToUpdate).username().click();

    // switch off everything we selected before
    for (const role of userToUpdate.roles) {
      editUser.role(role).click();
    }

    editUser.role('checker').click();
    editUser.firstname().type("{selectAll}{backspace}Homer");
    editUser.surname().type("{selectAll}{backspace}Simpson");

    editUser.save().click();


    users.row(userToUpdate).roles().invoke('text').then((text) => {
      expect(text.trim()).to.equal('checker');
    });

  });
});
