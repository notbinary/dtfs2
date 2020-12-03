const { ObjectID } = require('mongodb');
const now = require('../../now');
const db = require('../../drivers/db-client');
const sendEmail = require('../email');
const businessRules = require('../../config/businessRules');
const { BLOCKED, ACTIVE } = require('../../constants/user').STATUS;
const { sanitizeUser } = require('./sanitizeUserData');
const utils = require('../../crypto/utils');

const sendBlockedEmail = async (emailAddress) => {
  const EMAIL_TEMPLATE_ID = '82506983-cb85-4f33-b962-922b850be7ac';

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    emailAddress,
    {},
  );
};

const sendUnblockedEmail = async (emailAddress) => {
  const EMAIL_TEMPLATE_ID = '44959d08-6389-4f27-a6be-2faae8bea711';

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    emailAddress,
    {},
  );
};

const sendNewAccountEmail = async (user, password) => {
  const EMAIL_TEMPLATE_ID = '354031c8-8ca5-4ac7-9356-00613faf793c';
  const emailAddress = user.username;

  const variables = {
    username: user.username,
    firstname: user.firstname,
    surname: user.surname,
    bank: (user.bank && user.bank.name) ? user.bank.name : '',
    roles: user.roles.join(','),
    status: user['user-status'],
    password,
  };

  await sendEmail(
    EMAIL_TEMPLATE_ID,
    emailAddress,
    variables,
  );
};


exports.list = async (callback) => {
  const collection = await db.getCollection('users');

  collection.find({}).toArray(callback);
};

exports.findOne = async (_id, callback) => {
  const collection = await db.getCollection('users');

  collection.findOne({ _id: new ObjectID(_id) }, callback);
};

exports.findByUsername = async (username, callback) => {
  const collection = await db.getCollection('users');

  collection.findOne({ username }, callback);
};

exports.create = async (user, callback) => {
  const insert = {
    'user-status': ACTIVE,
    timezone: user.timezone || 'Europe/London',
    ...user,
  };

  const { password } = insert;
  // tidy fields that shouldn't be here. this might not be the best place.
  delete insert.password;
  //---

  const collection = await db.getCollection('users');
  const createUserResult = await collection.insertOne(insert);

  const createdUser = sanitizeUser(createUserResult.ops[0]);

  // nasty hack, but... right now we have a load of test users with
  // non-email-address usernames and no time to fix that neatly.. so..
  if (createdUser.username && createdUser.username.includes('@')) {
    await sendNewAccountEmail(createdUser, password);
  }

  callback(null, createdUser);
};

exports.update = async (_id, update, callback) => {
  const userUpdate = { ...update };
  const collection = await db.getCollection('users');

  collection.findOne({ _id: new ObjectID(_id) }, async (err, existingUser) => {
    // --- this section could (/should?) have been done as a separate endpoints for the actions
    //  of blocking+unblocking.. we've done that elsewhere... but seemed overkill here
    if (existingUser['user-status'] !== BLOCKED && userUpdate['user-status'] === BLOCKED) {
      // the user is being blocked..
      await sendBlockedEmail(existingUser.username);
    }

    if (existingUser['user-status'] === BLOCKED && userUpdate['user-status'] === ACTIVE) {
      // the user is being re-activated..
      await sendUnblockedEmail(existingUser.username);
    }
    //---

    if (userUpdate.password) {
      // we're updating the password, so do the dance...
      const { password: newPassword } = userUpdate;
      const { salt: oldSalt, hash: oldHash, blockedPasswordList: oldBlockedPasswordList } = existingUser;
      // don't save the raw password or password confirmation to mongo...
      delete userUpdate.password;
      delete userUpdate.passwordConfirm;

      // create new salt/hash for the new password
      const { salt, hash } = utils.genPassword(newPassword);
      // queue update of salt+hash, ie store the encrypted password
      userUpdate.salt = salt;
      userUpdate.hash = hash;
      // queue the addition of the old salt/hash to our list of blocked passwords that we re-check
      // in 'passwordsCannotBeReUsed' rule
      userUpdate.blockedPasswordList = oldBlockedPasswordList
        ? oldBlockedPasswordList.concat[{ oldSalt, oldHash }]
        : [{ oldSalt, oldHash }];
    }

    await collection.updateOne({ _id: { $eq: new ObjectID(_id) } }, { $set: userUpdate }, {});

    callback(null, userUpdate);
  });
};

exports.updateLastLogin = async (user, callback) => {
  const collection = await db.getCollection('users');
  const update = {
    lastLogin: now(),
    loginFailureCount: 0,
  };
  await collection.updateOne(
    { _id: { $eq: new ObjectID(user._id) } }, // eslint-disable-line no-underscore-dangle
    { $set: update },
    {},
  );

  callback();
};

exports.incrementFailedLoginCount = async (user) => {
  const failureCount = user.loginFailureCount ? user.loginFailureCount + 1 : 1;
  const thresholdReached = (failureCount >= businessRules.loginFailureCount_Limit);

  const collection = await db.getCollection('users');
  const update = {
    loginFailureCount: failureCount,
    lastLoginFailure: now(),
    'user-status': thresholdReached ? BLOCKED : user['user-status'],
  };

  await collection.updateOne(
    { _id: { $eq: new ObjectID(user._id) } }, // eslint-disable-line no-underscore-dangle
    { $set: update },
    {},
  );

  if (thresholdReached) {
    await sendBlockedEmail(user.username);
  }
};

exports.disable = async (_id, callback) => {
  const collection = await db.getCollection('users');
  // const status = await collection.deleteOne({ _id: new ObjectID(_id) });
  const userUpdate = {
    disabled: true,
  };

  const status = await collection.updateOne({ _id: { $eq: new ObjectID(_id) } }, { $set: userUpdate }, {});

  callback(null, status);
};

exports.remove = async (_id, callback) => {
  const collection = await db.getCollection('users');
  const status = await collection.deleteOne({ _id: new ObjectID(_id) });

  callback(null, status);
};