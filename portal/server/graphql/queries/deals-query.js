import gql from 'graphql-tag';

const dealsQuery = gql`
query Deals($start: Int, $pagesize: Int, $filters: [DashboardFilters]){
  deals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals {
      _id
      status
      bankRef
      exporter
      product
      type
      lastUpdate
    }
  }
}`;

export default dealsQuery;
