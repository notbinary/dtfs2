const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const UPDATE_TASK = gql`
  mutation UpdateTask($dealId: ID!, $taskUpdate: TFMTaskInput) {
    updateTask(dealId: $dealId, taskUpdate: $taskUpdate) {
      id,
      assignedTo,
      status
    }
  }
`;

describe('graphql mutation - update task', () => {
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

  it('should return updated task', async () => {
    const taskUpdate = {
      id: '1',
      userId: '100200',
      status: 'In progress',
      assignedTo: '1234',
    };

    const { data } = await query({
      query: UPDATE_TASK,
      variables: {
        dealId: MOCK_DEAL._id,
        taskUpdate,
      },
    });

    const expected = {
      id: taskUpdate.id,
      status: taskUpdate.status,
      assignedTo: taskUpdate.assignedTo,
    };

    expect(data.updateTask).toEqual(expected);
  });
});
