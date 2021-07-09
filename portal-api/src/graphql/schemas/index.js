const typeDefs = `

type StatusType {
  code: Int
  msg: String
}

type Currency {
  currencyId: Int!
  text: String
  id: String
}

type OwningBank {
  name: String
}

type Maker {
  username: String
  firstname: String
  surname: String
}

type Checker {
  username: String
  firstname: String
  surname: String
}

type ErrorListItem {
  order: String
  text: String
}

type Deal {
  _id: String!
  status: String
  bankRef: String
  exporter: String
  product: String
  type: String
  lastUpdate: Float
}

type DealsQuery {
  count: Int
  deals: [Deal]
}

input DashboardSort {
  field: String
  order: Int
}

input DashboardFilters {
  field: String
  value: String
  operator: String
}

input DealsInput {
  start: Int
  pagesize: Int
  filters: [DashboardFilters]
  sort: [DashboardSort]
}

type Transaction {
  deal_id: String
  deal_status: String
  deal_supplierName: String
  deal_bankSupplyContractID: String
  deal_ukefDealId: String
  deal_owningBank: String
  deal_created: String
  deal_submissionDate: String
  transaction_id: String
  bankFacilityId: String
  ukefFacilityId: String
  transactionType: String
  facilityValue: String
  transactionStage: String
  createdDate: String
  lastEdited: String
  issuedDate: String
  maker: String
  checker: String
  issueFacilityDetailsSubmitted: String
  currency: Currency
  requestedCoverStartDate: String
  previousCoverStartDate: String
  dateOfCoverChange: String
  issuedFacilitySubmittedToUkefTimestamp: String
  issuedFacilitySubmittedToUkefBy: String
}

type TransactionQuery {
  count: Int
  transactions: [Transaction]
}

input TransactionFilters {
  field: String
  value: String
  operator: String
}

input TransactionInput {
  start: Int
  pagesize: Int
  filters: [TransactionFilters]
}


type Query {
  currencies: [Currency]
  deals(params: DealsInput): DealsQuery
  transactions(params: TransactionInput): TransactionQuery
}

type DealStatusErrorItem {
  comments: ErrorListItem
  confirmSubmit: ErrorListItem
}

type DealStatusUpdateResult {
  statusCode: Int
  status: String
  comments: String
  success: Boolean
  count: Int
  errorList: DealStatusErrorItem
}

type Mutation {
  dealStatusUpdate( dealId: String, status: String, comments: String): DealStatusUpdateResult
}
`;

module.exports = typeDefs;
