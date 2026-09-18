import { blApplySecurityHeaders, blGetCorsAllowedDomains, blGetCorsConfig } from '@monorepo/back-core-lib';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import {
  CN_ENVIRONMENT_PROFILE_KEY,
  CN_HIERARCHY_OBJECT_TOKEN_HEADER,
  CN_LOCAL_SPACE_COOKIE,
  CnEnvironmentProfile,
} from './app/cn-core/model/config/cn-config.class';
import { CnAppModule } from './cn-app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(CnAppModule);

  // Express 5 defaults the query parser to 'simple' (no nested objects).
  // Restore the v4 'extended' (qs) parser so ?a[b]=c keeps working.
  app.set('query parser', 'extended');

  // enable cors
  const env: CnEnvironmentProfile = process.env[CN_ENVIRONMENT_PROFILE_KEY] as CnEnvironmentProfile;
  console.log('CORS config - environment : ', env);
  const isLocal = env === 'dev' || env === 'docker' || env === 'test';

  // allow the local-space header only for local env
  const additionalHeader = [CN_HIERARCHY_OBJECT_TOKEN_HEADER];
  if (isLocal) {
    additionalHeader.push(CN_LOCAL_SPACE_COOKIE);
  }

  // the domains allowed to call this API come from the environment (CORS_ALLOWED_DOMAINS):
  // each instance is served from its own domain, which nothing in the code could know
  app.enableCors(blGetCorsConfig(blGetCorsAllowedDomains(isLocal), isLocal, additionalHeader));

  blApplySecurityHeaders(app, { isLocal });

  // increase body limit to 10mb
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // enable proxy, tell express to trust the first proxy
  // https://docs.nestjs.com/security/rate-limiting#proxies
  app.set('trust proxy', 1);

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = 3001;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap().catch((err) => {
  console.error('Error during app bootstrap:', err);
  process.exit(1);
});
