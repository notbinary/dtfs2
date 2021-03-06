const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const aDeal = require('../deal-builder');

const mockUser = {
  _id: '123456789',
  username: 'temp',
  roles: [],
  bank: {
    id: '956',
    name: 'Barclays Bank',
  },
};

const newFacility = {
  facilityType: 'bond',
  associatedDealId: '123123456',
};

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
  },
  editedBy: [],
  eligibility: {
    status: 'Not started',
    criteria: [{}],
  },
});

const createDeal = async () => {
  const { body, status } = await api.post({ deal: newDeal, user: mockUser }).to('/v1/portal/deals');
  return body;
};

describe('/v1/portal/facilities', () => {
  let dealId;

  beforeAll(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  beforeEach(async () => {
    const deal = await createDeal();

    dealId = deal._id;
    newFacility.associatedDealId = dealId;
  });

  describe('PUT /v1/portal/facilities/:id', () => {
    it('404s requests for unknown ids', async () => {
      const { status } = await api.put({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities/123456789012');
      expect(status).toEqual(404);
    });

    it('returns 404 when adding facility to non-existant deal', async () => {
      await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const { status } = await api.put({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities/111111}');

      expect(status).toEqual(404);
    });

    it('returns the updated facility', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        facilityValue: 123456,
        user: mockUser,
      };

      const { body, status } = await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      expect(status).toEqual(200);
      expect(typeof body.lastEdited).toEqual('string');
      expect(body.facilityValue).toEqual(updatedFacility.facilityValue);
    });

    it('updates the facility', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        facilityValue: 123456,
        user: mockUser,
      };

      await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(typeof body.lastEdited).toEqual('string');
      expect(body.facilityValue).toEqual(updatedFacility.facilityValue);
    });

    it('updates `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      const getDealResponse = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      const updatedFacility = {
        ...createdFacilityResponse.body,
        facilityValue: 123456,
        user: mockUser,
      };

      await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacilityResponse.body._id}`);

      const { body, status } = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(body.deal.editedBy[1].userId).toEqual(updatedFacility.user._id);
      expect(body.deal.editedBy[1].bank).toEqual(updatedFacility.user.bank);
      expect(body.deal.editedBy[1].roles).toEqual(updatedFacility.user.roles);
      expect(body.deal.editedBy[1].username).toEqual(updatedFacility.user.username);
      expect(typeof body.deal.editedBy[1].date).toEqual('string');
    });

    it('updates the facility when no req.body.user is provided', async () => {
      const postResult = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');
      const createdFacility = postResult.body;

      const updatedFacility = {
        ...createdFacility,
        facilityValue: 123456,
      };

      await api.put(updatedFacility).to(`/v1/portal/facilities/${createdFacility._id}`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacility._id}`);

      expect(body.facilityValue).toEqual(updatedFacility.facilityValue);
    });
  });

  describe('PUT /v1/tfm/facilities/:id', () => {
    it('does NOT update `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      await api.put({}).to(`/v1/tfm/deals/${newFacility.associatedDealId}/submit`);

      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/tfm/facilities');

      const getDealResponse = await api.get(`/v1/tfm/deals/${newFacility.associatedDealId}`);
      expect(getDealResponse.body.deal.dealSnapshot.editedBy.length).toEqual(0);

      const updatedFacility = {
        ...createdFacilityResponse.body,
        facilityValue: 123456,
        user: mockUser,
      };

      await api.put(updatedFacility).to(`/v1/tfm/facilities/${createdFacilityResponse.body._id}`);

      const { body } = await api.get(`/v1/tfm/deals/${newFacility.associatedDealId}`);

      expect(body.deal.dealSnapshot.editedBy.length).toEqual(0);
    });

    it('returns 404 when facility does not exist', async() => {
      const { status } = await api.put({}).to('/v1/tfm/facilities/1234');

      expect(status).toEqual(404);
    });
  });

  describe('PUT /v1/portal/facilities/:id/status', () => {
    const updateFacilityStatusBody = {
      status: 'Test new status',
    };

    it('changes facility status', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);
      
      const mockSubmittedFacility = {
        ...newFacility,
        status: 'Submitted',
      };

      const createdFacilityResponse = await api.post({ facility: mockSubmittedFacility, user: mockUser }).to('/v1/portal/facilities');

      expect(createdFacilityResponse.body.status).toEqual(mockSubmittedFacility.status);

      await api.put(updateFacilityStatusBody).to(`/v1/portal/facilities/${createdFacilityResponse.body._id}/status`);

      const { body } = await api.get(`/v1/portal/facilities/${createdFacilityResponse.body._id}`);

      expect(body.status).toEqual(updateFacilityStatusBody.status);
    });

    it('does NOT update `editedBy` in the associated deal', async () => {
      const originalDeal = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(originalDeal.body.deal.editedBy).toEqual([]);

      await api.put({}).to(`/v1/portal/deals/${newFacility.associatedDealId}/submit`);

      const createdFacilityResponse = await api.post({ facility: newFacility, user: mockUser }).to('/v1/portal/facilities');

      const getDealResponse = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      // editedBy is updated once when `create facility` is called
      expect(getDealResponse.body.deal.editedBy.length).toEqual(1);

      await api.put(updateFacilityStatusBody).to(`/v1/tfm/facilities/${createdFacilityResponse.body._id}/status`);

      const { body } = await api.get(`/v1/portal/deals/${newFacility.associatedDealId}`);

      expect(body.deal.editedBy.length).toEqual(1);
    });

    it('returns 404 when facility does not exist', async() => {
      const { status } = await api.put(updateFacilityStatusBody).to('/v1/portal/facilities/1234/status');

      expect(status).toEqual(404);
    });
  });
});
