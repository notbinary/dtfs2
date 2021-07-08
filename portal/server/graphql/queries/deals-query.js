import gql from 'graphql-tag';

const dealsQuery = gql`
query Deals($start: Int, $pagesize: Int, $filters: [DashboardFilters]){
  deals(start: $start, pagesize: $pagesize, filters: $filters) {
    count
    deals {
      _id
      status
      bankRef
      exporter {
        _id
        name
      }
      product
      type
      lastUpdate
    }
  }
}`;

export default dealsQuery;
