import {NestFactory} from '@nestjs/core';
import {AppModule} from './dn-app.module';
import {blGetCorsConfig} from '@monorepo/back-core-lib';
import {ENVIRONMENT_PROFILE_KEY, ENVIRONMENT_PROFILE_PROD_VALUE} from './app/core/modules/core-config/dn-core-config.service';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors(blGetCorsConfig(
    'gencovery.com',
    process.env[ENVIRONMENT_PROFILE_KEY] !== ENVIRONMENT_PROFILE_PROD_VALUE)
  );

  const port = process.env.port || 3333;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
