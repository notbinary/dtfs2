const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const UPDATE_UNDERWRITING_MANAGERS_DECISION = gql`
  mutation UpdateUnderwritingManagersDecision($dealId: ID!, $managersDecisionUpdate: TFMUnderwritingManagersDecisionInput) {
    updateUnderwritingManagersDecision(dealId: $dealId, managersDecisionUpdate: $managersDecisionUpdate) {
      underwritingManagersDecision {
        decision
        comments
      }
    }
  }
`;

describe('graphql mutation - update underwriting managers decision', () => {
  let query;

  beforeAll(() => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const schemaWithMiddleware = applyMiddleware(schema);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      schema: schemaWithMiddleware,
    });

    // use the test server to create a query function
    const { query: doQuery } = createTestClient(server);
    query = doQuery;
  });

  it('should return updated decision', async () => {
    const mutationVars = {
      dealId: MOCK_DEAL._id,
      managersDecisionUpdate: {
        decision: 'Approve without conditions',
        comments: 'Test comment',
      },
    };

    const { data } = await query({
      query: UPDATE_UNDERWRITING_MANAGERS_DECISION,
      variables: mutationVars,
    });

    const expected = {
      underwritingManagersDecision: {
        decision: mutationVars.managersDecisionUpdate.decision,
        comments: mutationVars.managersDecisionUpdate.comments,
      },
    };

    expect(data.updateUnderwritingManagersDecision).toEqual(expected);
  });
});