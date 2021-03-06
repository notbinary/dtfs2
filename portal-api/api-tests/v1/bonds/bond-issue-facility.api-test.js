const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../../../src/v1/section-calculations');
const { findOneCurrency } = require('../../../src/v1/controllers/currencies.controller');

describe('/v1/deals/:id/bond/:id/issue-facility', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
      submissionDate: moment().subtract(1, 'day').utc().valueOf(),
      status: 'Ready for Checker\'s approval',
      submissionType: 'Manual Inclusion Notice',
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
    eligibility: {
      criteria: [
        { id: 15, answer: true },
      ],
    },
  });

  const nowDate = moment();
  const createCoverDateFields = (prefix, value) => {

    return {
      [`${prefix}-day`]: moment(value).format('DD'),
      [`${prefix}-month`]: moment(value).format('MM'),
      [`${prefix}-year`]: moment(value).format('YYYY'),
    };
  };

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: 'bond type',
    facilityStage: 'Unissued',
    previousFacilityStage: 'Unissued',
    ukefGuaranteeInMonths: '24',
    bondBeneficiary: 'test',
    facilityValue: '123456.55',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '9.09',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: 'test',
    status: 'Ready for check'
  };

  const issueFacilityBody = {
    ...createCoverDateFields('requestedCoverStartDate', moment().add(1, 'week')),
    ...createCoverDateFields('coverEndDate', moment().add(1, 'month')),
    ...createCoverDateFields('issuedDate', moment()),
    uniqueIdentificationNumber: '1234',
  };

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let anEditor;
  let dealId;
  let bondId;

  const createBond = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    bondId = createBondResponse.body.bondId;

    const { status } = await as(aBarclaysMaker).put(allBondFields).to(`/v1/deals/${dealId}/bond/${bondId}`);
    expect(status).toEqual(200);
  };

  const putIssueFacility = async (dealId, bondId, body) => {
    const response = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}/bond/${bondId}/issue-facility`);
    return response;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await createBond();
  });

  describe('PUT /v1/deals/:id/bond/:id/issue-facility', () => {
    it('should return 401 when user cannot access the deal', async () => {
      const { status } = await as(anHSBCMaker).put({}).to(`/v1/deals/${dealId}/bond/${bondId}/issue-facility`);
      expect(status).toEqual(401);
    });

    it('should return 404 when deal does not exist', async () => {
      const { status } = await putIssueFacility('1234', bondId, {});
      expect(status).toEqual(404);
    });

    it('should return 404 when bond does not exist', async () => {
      const { status } = await putIssueFacility(dealId, '1234', {});
      expect(status).toEqual(404);
    });

    it('should return 403 when bond cannot be issued', async () => {
      // put deal into a state that doesn't allow facility issuance
      await as(aSuperuser).put({
        comments: 'test',
        status: 'Abandoned Deal'
      }).to(`/v1/deals/${dealId}/status`);

      const { status } = await putIssueFacility(dealId, bondId, {});
      expect(status).toEqual(403);
    });

    it('should remove bond status and add issueFacilityDetailsStarted', async () => {
      const { body } = await putIssueFacility(dealId, bondId, issueFacilityBody);

      expect(body.status === allBondFields.status).toEqual(false);
      expect(body.status).toEqual(null);
      expect(body.issueFacilityDetailsStarted).toEqual(true);
    });

    it('should remove bond status when issueFacilityDetailsStarted already exists in the bond', async () => {
      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      bondId = createBondResponse.body.bondId;

      const bondWithIssueFacilityDetailsStarted = {
        ...allBondFields,
        issueFacilityDetailsStarted: true,
        issueFacilityDetailsSubmitted: false,
      };

      const { status } = await as(aBarclaysMaker).put(bondWithIssueFacilityDetailsStarted).to(`/v1/deals/${dealId}/bond/${bondId}`);


      const { body } = await putIssueFacility(dealId, bondId, issueFacilityBody);

      expect(body.status).toEqual(null);
    });

    it('should return 200 with updated bond, add issueFacilityDetailsProvided and generate timestamps', async () => {
      const { status, body } = await putIssueFacility(dealId, bondId, issueFacilityBody);

      expect(status).toEqual(200);
      expect(body.issueFacilityDetailsProvided).toEqual(true);
      expect(typeof body.requestedCoverStartDate === 'string').toEqual(true);
      expect(typeof body.issuedDate === 'string').toEqual(true);
    });

    describe('with validation errors', () => {
      const incompleteIssueFacilityBody = {
        ...createCoverDateFields('requestedCoverStartDate', moment().add(1, 'week')),
      };

      it('should return 400 with validationErrors, the bond,  and add issueFacilityDetailsProvided=false', async () => {
        const { status, body } = await putIssueFacility(dealId, bondId, incompleteIssueFacilityBody);

        expect(status).toEqual(400);
        expect(body.validationErrors).toBeDefined();
        expect(body.bond.issueFacilityDetailsProvided).toEqual(false);
      });

      describe('when there is no bond.uniqueIdentificationNumber', () => {
        it('should return validationErrors, the bond with uniqueIdentificationNumberRequiredForIssuance', async () => {
          const { status, body } = await putIssueFacility(dealId, bondId, incompleteIssueFacilityBody);

          expect(status).toEqual(400);
          expect(body.validationErrors).toBeDefined();
          expect(body.bond.uniqueIdentificationNumberRequiredForIssuance).toEqual(true);
        });
      });

      describe('when requestedCoverStartDate exists and only some values are updated', () => {
        it('should remove requestedCoverStartDate timestamp', async () => {
          await putIssueFacility(dealId, bondId, issueFacilityBody);

          const incompleteDate = {
            'requestedCoverStartDate-day' : moment().format('DD'),
            'requestedCoverStartDate-month': moment().format('MM'),
            'requestedCoverStartDate-year': '',
          };

          const { body } = await putIssueFacility(dealId, bondId, incompleteDate);
          expect(body.bond.requestedCoverStartDate).toEqual(null);
        });
      });

      describe('when issuedDate exists and only some values are updated', () => {
        it('should remove issuedDate timestamp', async () => {
          await putIssueFacility(dealId, bondId, issueFacilityBody);

          const incompleteDate = {
            'issuedDate-day': moment().format('DD'),
            'issuedDate-month': moment().format('MM'),
            'issuedDate-year': '',
          };

          const { body } = await putIssueFacility(dealId, bondId, incompleteDate);
          expect(body.bond.issuedDate).toEqual(null);
        });
      });
    });
  });
});
    
