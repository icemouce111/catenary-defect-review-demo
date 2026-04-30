import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Defect: {
        keyFields: ['id'],
      },
    },
  }),
  link: new HttpLink({
    uri: '/graphql',
  }),
});
