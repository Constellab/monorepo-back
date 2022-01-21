import {NestFactory} from '@nestjs/core';
import {blGetCorsConfig} from '@monorepo/back-core-lib';
import {SnAppModule} from './sn-app.module';
import {SN_ENVIRONMENT_PROFILE_KEY, SN_ENVIRONMENT_PROFILE_PROD_VALUE} from './app/model/sn-config.class';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(SnAppModule);

  // enable cors
  app.enableCors(blGetCorsConfig(
    'gencovery.com',
    process.env[SN_ENVIRONMENT_PROFILE_KEY] !== SN_ENVIRONMENT_PROFILE_PROD_VALUE));

  // enable custom logger using winston
  // app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = 3340;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
