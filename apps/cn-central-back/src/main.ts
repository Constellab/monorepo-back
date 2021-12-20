import {NestFactory} from '@nestjs/core';
import {CnAppModule} from './cn-app.module';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {blGetCorsConfig} from '@monorepo/back-core-lib';
import {
  ENVIRONMENT_PROFILE_KEY,
  ENVIRONMENT_PROFILE_PROD_VALUE
} from './app/cn-core/modules/cn-core-config/cn-core-config.service';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(CnAppModule);

  // enable cors
  app.enableCors(blGetCorsConfig(
    'gencovery.com',
    process.env[ENVIRONMENT_PROFILE_KEY] !== ENVIRONMENT_PROFILE_PROD_VALUE));

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = 3001;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
