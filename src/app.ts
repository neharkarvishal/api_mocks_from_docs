import * as path from 'path';
import * as fs from 'fs';

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { globSync } from 'glob';

import * as middlewares from './middlewares';
import helloWorld from './api';

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/', helloWorld);

const routes = globSync('**/*.json', {
  ignore: [
    'package.json',
    'package-lock.json',
    'npm-shrinkwrap.json',
    'tsconfig.json',
    'node_modules/**',
  ],
})
  .map(file => JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')));

for (const route of routes) {
  let method = String(route.method).toLowerCase() as keyof typeof app;

  app[method](
    route.path,
    (req: express.Request, res: express.Response) => {
      const firstResponse = route.responses[0];

      return res.json(firstResponse);
    });
}

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
