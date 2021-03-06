const page = {
  visit: () => cy.visit('/admin/users/'),
  addUser: () => cy.get('[data-cy="AddUser"]'),
  user: (user) =>  cy.get(`[data-cy="user-${user.username}"]`),
  row: (user) => {
    const row = cy.get(`[data-cy="user-${user.username}"]`);
    return {
      username: () => cy.get(`[data-cy="username-${user.username}"]`),
      lastLogin: () => cy.get(`[data-cy="lastLogin-${user.username}"]`),
      roles: () => cy.get(`[data-cy="roles-${user.username}"]`),
    };
  },

};

module.exports = page;
