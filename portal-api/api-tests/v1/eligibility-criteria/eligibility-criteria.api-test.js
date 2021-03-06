const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');

const allEligibilityCriteria = require('../../fixtures/eligibilityCriteria');
const newEligibilityCriteria = allEligibilityCriteria[0];
const updatedEligibilityCriteria = {
  ...newEligibilityCriteria,
  description: 'Updated eligibility criteria',
}

describe('/v1/eligibility-criteria', () => {
  let noRoles;
  let anEditor;

  beforeAll(async() => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['eligibilityCriteria']);
  });

  describe('GET /v1/eligibility-criteria', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/eligibility-criteria');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/eligibility-criteria');

      expect(status).toEqual(200);
    });

    it('returns a list of eligibility-criteria sorted by id', async () => {
      // randomise the order a bit on the way in...
      await as(anEditor).post(allEligibilityCriteria[0]).to('/v1/eligibility-criteria');
      await as(anEditor).post(allEligibilityCriteria[6]).to('/v1/eligibility-criteria');
      await as(anEditor).post(allEligibilityCriteria[1]).to('/v1/eligibility-criteria');
      await as(anEditor).post(allEligibilityCriteria[4]).to('/v1/eligibility-criteria');
      await as(anEditor).post(allEligibilityCriteria[2]).to('/v1/eligibility-criteria');
      await as(anEditor).post(allEligibilityCriteria[3]).to('/v1/eligibility-criteria');
      await as(anEditor).post(allEligibilityCriteria[5]).to('/v1/eligibility-criteria');
      await as(anEditor).post(allEligibilityCriteria[7]).to('/v1/eligibility-criteria');

      const { body } = await as(noRoles).get(`/v1/eligibility-criteria`);
      expect(body).toEqual({
        count: allEligibilityCriteria.length,
        eligibilityCriteria: expectMongoIds(allEligibilityCriteria),
      });
    });
  });

  describe('GET /v1/eligibility-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/eligibility-criteria/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that do present a valid Authorization token', async () => {
      const { status } = await as(noRoles).get('/v1/eligibility-criteria/1');

      expect(status).toEqual(200);
    });

    it('returns an eligibility-criteria', async () => {
      await as(anEditor).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      const { status, body } = await as(anEditor).get(`/v1/eligibility-criteria/${newEligibilityCriteria.id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectMongoId(newEligibilityCriteria));
    });
  });

  describe('POST /v1/eligibility-criteria', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      const { status } = await as(noRoles).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      const { status } = await as(anEditor).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/eligibility-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedEligibilityCriteria).to('/v1/eligibility-criteria/1');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      const { status } = await as(noRoles).put(updatedEligibilityCriteria).to('/v1/eligibility-criteria/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      const { status } = await as(anEditor).put(updatedEligibilityCriteria).to('/v1/eligibility-criteria/1');

      expect(status).toEqual(200);
    });

    describe('updating the eligibility-criteria', () => {
      it('can update the description', async () => {
        const eligibilityCriteria = allEligibilityCriteria[1];
        const descriptionUpdate = {
          description: 'new description',
        };

        await as(anEditor).post(eligibilityCriteria).to('/v1/eligibility-criteria');
        await as(anEditor).put(descriptionUpdate).to(`/v1/eligibility-criteria/${eligibilityCriteria.id}`);

        const { status, body } = await as(anEditor).get(`/v1/eligibility-criteria/${eligibilityCriteria.id}`);

        expect(status).toEqual(200);
        expect(body).toEqual(expectMongoId({
          ...eligibilityCriteria,
          ...descriptionUpdate,
        }));
      });
    });
  });

  describe('DELETE /v1/eligibility-criteria/:id', () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/eligibility-criteria/1');

      expect(status).toEqual(401);
    });

    it('rejects requests that present a valid Authorization token but do not have "editor" role', async () => {
      await as(anEditor).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      const { status } = await as(noRoles).remove('/v1/eligibility-criteria/1');

      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "editor" role', async () => {
      await as(anEditor).post(newEligibilityCriteria).to('/v1/eligibility-criteria');

      const { status } = await as(anEditor).remove('/v1/eligibility-criteria/1');

      expect(status).toEqual(200);
    });

    it('deletes the eligibility-criteria', async () => {
      await as(anEditor).post(newEligibilityCriteria).to('/v1/eligibility-criteria');
      await as(anEditor).remove('/v1/eligibility-criteria/1');

      const { status, body } = await as(anEditor).get('/v1/eligibility-criteria/1');

      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
