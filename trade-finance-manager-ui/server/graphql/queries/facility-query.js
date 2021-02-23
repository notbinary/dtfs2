import gql from 'graphql-tag';

// TODO
// this is assuming all facility mappings we have atm
// will all be used in single facility query
// revisit and remove any unused fields, once single facility is built out more.

const facilityQuery = gql`
  query Facility($id: ID!) {
    facility(_id: $id) {
      _id,
      ukefFacilityID,
      facilityProduct {
        name
      },
      facilityType,
      facilityStage,
      facilityValueExportCurrency,
      facilityValue,
      coverEndDate,
      ukefExposure,
      coveredPercentage,
      bankFacilityReference,
      guaranteeFeePayableToUkef,
      bondIssuer,
      bondBeneficiary,
      bankFacilityReference,
      dates {
        inclusionNoticeReceived,
        bankIssueNoticeReceived,
        coverStartDate,
        coverEndDate,
        tenor,
      }
    }
  }
`;

export default facilityQuery;
