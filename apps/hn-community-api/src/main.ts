import { blGetCorsConfig } from '@monorepo/back-core-lib';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { HN_ENVIRONMENT_PROFILE_KEY, HnEnvironmentProfile } from './app/core/model/config/hn-config.class';
import { HnAppModule } from './hn-app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(HnAppModule);

  // enable cors
  const env: HnEnvironmentProfile = process.env[HN_ENVIRONMENT_PROFILE_KEY] as HnEnvironmentProfile;
  const isLocal = env === 'dev' || env === 'docker' || env === 'test';

  app.enableCors(
    blGetCorsConfig(
      [
        'constellab.community',
        'constellab.space',
        'preconstellab.com',
        'gencovery.com',
        'gencovery.io',
        'constellab.app',
      ],
      isLocal
    )
  );

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

bootstrap();
