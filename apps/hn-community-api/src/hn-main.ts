import { blApplySecurityHeaders } from '@monorepo/back-core-lib';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { hnCorsConfig } from './app/core/config/hn-cors.config';
import { hnIsLocalEnvironment } from './app/core/model/config/hn-config.class';
import { HnAppModule } from './hn-app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(HnAppModule);

  // Express 5 defaults the query parser to 'simple' (no nested objects).
  // Restore the v4 'extended' (qs) parser so ?a[b]=c keeps working.
  app.set('query parser', 'extended');

  app.enableCors(hnCorsConfig());

  blApplySecurityHeaders(app, { isLocal: hnIsLocalEnvironment() });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // enable proxy, tell express to trust the first proxy
  // https://docs.nestjs.com/security/rate-limiting#proxies
  app.set('trust proxy', 1);

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = process.env.port || 3333;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap().catch((err) => {
  console.error('Error during bootstraping hn-community-api', err);
  process.exit(1);
});
