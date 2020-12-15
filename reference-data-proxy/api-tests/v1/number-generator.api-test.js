const axios = require('axios');
const app = require('../../src/createApp');
const { get } = require('../api')(app);

const mockResponse = {
  status: 201,
  data: {
    "mdmNumberExample": {
      "value": {
        "id": 20000001,
        "maskedId": "0020000001",
        "numberTypeId": 1,
        "createdBy": "ECGD\\jsmith",
        "createdDatetime": "2018-06-06T16:45:35.473Z",
        "requestingSystem": "SQL Query"
      }
    }
  }
};

jest.mock('axios', () => jest.fn(() => Promise.resolve(mockResponse)));

describe('/number-generator', () => {
  describe('GET /v1/number-generator/:numberType', () => {
    describe('when an invalid numberType is provided', () => {
      it('should return 400', async () => {
        
        const { status, text } = await get('/number-generator/10');

        expect(status).toEqual(400);
        expect(text).toEqual('Invalid number type.');
      });
    });

    it('should return status with maskedId value', async () => {
      const { status, body } = await get('/number-generator/1');

      expect(status).toEqual(mockResponse.status);
      expect(body).toEqual({
        id: mockResponse.data.mdmNumberExample.value.maskedId
      });
    });
  });
});
