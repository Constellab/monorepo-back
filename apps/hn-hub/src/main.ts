import {NestFactory} from '@nestjs/core';
import {AppModule} from './hn-app.module';
import {blGetCorsConfig} from '@monorepo/back-core-lib';
import {HN_ENVIRONMENT_PROFILE_KEY, HN_ENVIRONMENT_PROFILE_PROD_VALUE} from './app/core/model/config/hn-config.class';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors(blGetCorsConfig(
    'gencovery.com',
    process.env[HN_ENVIRONMENT_PROFILE_KEY] !== HN_ENVIRONMENT_PROFILE_PROD_VALUE)
  );

  const port = process.env.port || 3333;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
