jest.unmock('@azure/storage-file-share');

const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');
const fileshare = require('../../../src/drivers/fileshare');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put, remove } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

describe('/v1/deals/:id/integration/', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
      status: 'Draft',
      dateOfLastAction: '1985/11/04 21:00:00:000',
    },
    comments: [{
      username: 'bananaman',
      timestamp: '1984/12/25 00:00:00:001',
      text: 'Merry Christmas from the 80s',
    }, {
      username: 'supergran',
      timestamp: '1982/12/25 00:00:00:001',
      text: 'Also Merry Christmas from the 80s',
    }],
  });

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);

    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
  });

  describe('GET /v1/deals/:id/integration/type-a', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012/integration/type-a');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=checker', async () => {
      const { status } = await get('/v1/deals/123456789012/integration/type-a', noRoles.token);

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=checker', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const newId = postResult.body._id;

      const someData = '<xml><Deal/>';

      await fileshare.uploadStream({
        folder: 'ukef',
        subfolder: 'type-a',
        filename: `${newId}.xml`,
        buffer: Buffer.from(someData, 'utf-8'),
      });

      const { status } = await get(`/v1/deals/${newId}/integration/type-a`, aBarclaysChecker.token);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await post(newDeal, anHSBCMaker.token).to('/v1/deals');

      const { status } = await get(`/v1/deals/${body._id}/integration/type-a`, aBarclaysChecker.token);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await get('/v1/deals/123456789012/integration/type-a', aBarclaysChecker.token);

      expect(status).toEqual(404);
    });

    it('returns the requested resource', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const newId = postResult.body._id;

      const someData = '<xml><Deal/>';

      await fileshare.uploadStream({
        folder: 'ukef',
        subfolder: 'type-a',
        filename: `${newId}.xml`,
        buffer: Buffer.from(someData, 'utf-8'),
      });

      const { status, text } = await get(`/v1/deals/${newId}/integration/type-a`, aBarclaysChecker.token);

      expect(status).toEqual(200);
      expect(text).toEqual(someData);
    });
  });
});
