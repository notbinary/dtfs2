/*
  "dealIdentifier":                 Deal ACBS ID,
  "facilityIdentifier":             UKEF facilityId,
  "portfolioIdentifier":            Facility portfolio idenfifier. Default to "E1"
  "dealBorrowerIdentifier":         exporter ACBS ID
                                    Look up the Obligors ACBS Customer record
                                    Use Party URN on the Deal = Alternate Customer Id.
                                    Use ACBS Customer Id (J$MRUI)
                                    Note there may be multiple customers in ACBS with the same Party URN.
                                    Use the first record found,
  "maximumLiability":               ukef Exposure
  "productTypeId":                  Facility Type i.e. 250 for BOND ??? What is LOAN and GEF?
  "capitalConversionFactorCode":    This field is required for GEF. Cash facility has 8, Contingent facility has 9.
  "productTypeName":                Facility Type Name/ description i.e. BOND (what is LOAN & GEF)
  "currency":                       Facility currency code
  "guaranteeCommencementDate":      see Deal for how to work it out
  "guaranteeExpiryDate":            Guarantee Commencement Date plus exposure period
  "nextQuarterEndDate":             ???
  "delegationType":                 Derive values A,M or N ????
  "intrestOrFeeRate":               Bank Rate, this can be for Bond facility corresponding fee rate
                                    or for Loan/EWCS interest rate
  "facilityStageCode":              Case Stage this can be 06 Commitment and 07 Issued
  "exposurePeriod":                 Credit Period
  "creditRatingCode":               Credit Review Risk Code
  "guaranteePercentage":            Insured %
  "premiumFrequencyCode":           Pre-Issue Est. Payment Frequency QUARTERLY(2)
  "riskCountryCode":                "GBR",
  "riskStatusCode":                 "03",
  "effectiveDate":                  SEE Deal + deal investor calcuation
  "foreCastPercentage":             Forecast % Derive from FACILITY:Stage, i.e. Commitment or Issued
  "issueDate":                      At Commitment stage its not required ,
                                    Issued when issued it would be Issue Date for Bond OR Disbursement Date for Loan
  "description":                    FacilityType + Workflow Exposure Period i.e. EWCS 15 Months,
  "agentBankIdentifier":            Bank partyUrn??,
  "obligorPartyIdentifier":         Supplier partyUrn,
  "obligorName":                    Supplier name
  "obligorIndustryClassification":  ACBS Supplier industry classification - must be 4 characters e.g. 0104
  */

const helpers = require('./helpers');

const facilityMaster = (deal, facility, acbsData, acbsReference) => {
  const { details, submissionDetails } = deal.dealSnapshot;
  const { facilitySnapshot } = facility;

  const {
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    effectiveDate,
  } = facility.tfm.facilityGuaranteeDates;
  const issueDate = helpers.getIssueDate(facility, details.submissionDate);

  return {
    dealIdentifier: acbsData.deal.dealIdentifier.padStart(10, 0),
    facilityIdentifier: facilitySnapshot.ukefFacilityID.padStart(10, 0),
    portfolioIdentifier: 'E1',
    dealBorrowerIdentifier: acbsData.parties.exporter.partyIdentifier,
    maximumLiability: helpers.getMaximumLiability(facility),
    productTypeId: helpers.getProductTypeId(facilitySnapshot.facilityType),
    capitalConversionFactorCode: helpers.getCapitalConversionFactorCode(facilitySnapshot.facilityType),
    productTypeName: facilitySnapshot.facilityType,
    currency: facilitySnapshot.currency.id,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    nextQuarterEndDate: helpers.getNextQuarterDate(issueDate),
    delegationType: helpers.getDelegationType(details.submissionType),
    intrestOrFeeRate: helpers.getInterestOrFeeRate(facility),
    facilityStageCode: helpers.getFacilityStageCode(facility),
    exposurePeriod: String(helpers.getExposurePeriod(facility)),
    creditRatingCode: '14',
    guaranteePercentage: Number(facilitySnapshot.coveredPercentage),
    premiumFrequencyCode: helpers.getPremiumFrequencyCode(facility),
    riskCountryCode: 'GBR',
    riskStatusCode: '03',
    effectiveDate,
    foreCastPercentage: helpers.getForecastPercentage(facility),
    issueDate,
    description: helpers.getDescription(facility),
    agentBankIdentifier: '00000000',
    obligorPartyIdentifier: acbsData.parties.exporter.partyIdentifier,
    obligorName: submissionDetails['supplier-name'].substring(0, 35),
    obligorIndustryClassification: acbsReference.supplierAcbsIndustryCode,

  };
};

module.exports = facilityMaster;
