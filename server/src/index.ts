import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createResolvers } from './graphql/resolvers.js';
import { typeDefs } from './graphql/typeDefs.js';
import { createFileDefectRepo } from './repo/defectRepo.js';
import { createLLMRouter } from './routes/llmProxy.js';
import { createStreamRouter } from './routes/stream.js';

const port = Number(process.env.PORT ?? 4000);
const app = express();
const repo = createFileDefectRepo();
const apollo = new ApolloServer({
  typeDefs,
  resolvers: createResolvers(repo),
});

await apollo.start();

app.use(cors({ origin: true }));
app.use('/api', createStreamRouter(repo));
app.use('/api', createLLMRouter(repo));
app.use('/graphql', express.json(), expressMiddleware(apollo));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: '4c-console-server' });
});

app.listen(port, () => {
  console.log(`4C-Console server ready at http://localhost:${port}/graphql`);
});
