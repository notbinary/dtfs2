import validateToken from '../middleware/validate-token';

const getSpy = jest.fn();
const postSpy = jest.fn();
jest.doMock('express', () => ({
  Router() {
    return {
      get: getSpy,
      post: postSpy,
    };
  },
}));

describe('Routes', () => {
  beforeEach(() => {
    // eslint-disable-next-line global-require
    require('../facility-value');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Sets up all routes', () => {
    expect(getSpy).toHaveBeenCalledWith('/application-details/:applicationId/facilities/:facilityId/facility-value', validateToken, expect.any(Function));
    expect(postSpy).toHaveBeenCalledWith('/application-details/:applicationId/facilities/:facilityId/facility-value', validateToken, expect.any(Function));
  });
});
