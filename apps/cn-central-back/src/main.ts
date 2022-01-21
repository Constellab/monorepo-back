import {NestFactory} from '@nestjs/core';
import {CnAppModule} from './cn-app.module';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {blGetCorsConfig} from '@monorepo/back-core-lib';
import {
  CN_ENVIRONMENT_PROFILE_KEY,
  CN_ENVIRONMENT_PROFILE_PROD_VALUE
} from './app/cn-core/model/config/cn-config.class';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(CnAppModule);

  // enable cors
  app.enableCors(blGetCorsConfig(
    'gencovery.com',
    process.env[CN_ENVIRONMENT_PROFILE_KEY] !== CN_ENVIRONMENT_PROFILE_PROD_VALUE));

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = 3001;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
