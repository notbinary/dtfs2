// Please note: do not include application ID in these mocks as this will processed as a new facility and contain null fields

const FACILITIES = [[],
  [{
    type: 0,
    hasBeenIssued: null,
    name: null,
    startOnDayOfNotice: null,
    coverStartDate: null,
    coverEndDate: null,
    monthsOfCover: null,
    details: null,
    detailsOther: null,
    currency: null,
    value: null,
    coverPercentage: null,
    interestPercentage: null,
    paymentType: null,
  }, {
    type: 0,
    hasBeenIssued: null,
    name: null,
    startOnDayOfNotice: null,
    coverStartDate: null,
    coverEndDate: null,
    monthsOfCover: null,
    details: null,
    detailsOther: null,
    currency: null,
    value: null,
    coverPercentage: null,
    interestPercentage: null,
    paymentType: null,
  }], [{
    type: 0,
    hasBeenIssued: true,
    name: 'This Cash facility 1',
    startOnDayOfNotice: true,
    coverStartDate: '2030-01-01T00:00:00',
    coverEndDate: '2040-01-01T00:00:00',
    monthsOfCover: 18,
    details: ['commited', 'factoring-on-a-with-recourse'],
    detailsOther: null,
    currency: 'GBP',
    value: 1000000,
    coverPercentage: 60,
    interestPercentage: 30,
    paymentType: 0,
  }, {
    type: 0,
    hasBeenIssued: false,
    name: 'That Cash facility 2',
    startOnDayOfNotice: true,
    coverStartDate: '2010-01-01T00:00:00',
    coverEndDate: '2015-01-01T00:00:00',
    monthsOfCover: 6,
    details: ['term', 'revolving-or-renewing', 'commited', 'uncommitted', 'on-demand-or-overdraft', 'factoring-on-a-with-recourse'],
    detailsOther: null,
    currency: 'EUR',
    value: 18000000,
    coverPercentage: 40,
    interestPercentage: 0.1,
    paymentType: 1,
  }, {
    type: 1,
    hasBeenIssued: true,
    name: 'This Contingent facility 1',
    startOnDayOfNotice: false,
    coverStartDate: '2025-01-01T00:00:00',
    coverEndDate: '2030-01-01T00:00:00',
    monthsOfCover: 48,
    details: ['other'],
    detailsOther: 'This is the other description',
    currency: 'YEN',
    value: 30000000,
    coverPercentage: 20,
    interestPercentage: 50.9,
    paymentType: 0,
  }],
];

module.exports = FACILITIES;