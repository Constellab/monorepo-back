import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors({
    origin: [/^(.*)/], // use regex instead of simple '*'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    // header If-None-Match useful for Safari with service workers
    allowedHeaders:
      'Origin,X-Requested-With,Content-Type,Accept,Authorization,authorization,X-Forwarded-for,lang,If-None-Match',
  });

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(3001);
}

bootstrap();
