const pageRenderer = require('../../../component-tests/pageRenderer');

const page = '../templates/case/documents/documents.njk';

const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    dealId: '100200',
    deal: {
      details: {
        ukefDealId: '1234',
        submissionType: 'Automatic Inclusion Notice',
      },
      submissionDetails: {
        supplierName: 'Supplier name',
        buyerName: 'Buyer name',
      },
    },
    tfm: {
      estore: {
        siteName: 'mockSiteName',
        buyerName: 'mockBuyerName',
        folderName: 'mockFolderName',
      },
    },
    eStoreUrl: 'http://mock.estore.url',
    user: {
      timezone: 'Europe/London',
      firstName: 'Joe',
      lastName: 'Bloggs',
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render documents heading', () => {
    wrapper.expectText('[data-cy="documents-heading"]').toRead('Documents');
  });

  it('should render the eStore links', () => {
    const { tfm, eStoreUrl } = params;
    const eStoreLink = `${eStoreUrl}/${tfm.estore.siteName}/CaseLibrary/${tfm.estore.buyerName}/${tfm.estore.folderName}`;

    wrapper.expectLink('[data-cy="estore-link"]').toLinkTo(eStoreLink, 'View in eStore');
  });
});
