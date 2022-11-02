import {NestFactory} from '@nestjs/core';
import {CnAppModule} from './cn-app.module';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {blGetCorsConfig, blGetRabbitMQUrl, blTransportQueueHub} from '@monorepo/back-core-lib';
import {
  CN_ENVIRONMENT_PROFILE_KEY,
  CN_ENVIRONMENT_PROFILE_PROD_VALUE,
  CN_RABBITMQ_PASSWORD_KEY,
  CN_RABBITMQ_PORT_KEY,
  CN_RABBITMQ_URL_KEY,
  CN_RABBITMQ_USER_KEY
} from './app/cn-core/model/config/cn-config.class';
import {Transport} from '@nestjs/microservices';
import {CN_LOCAL_ORGANIZATION_COOKIE} from './app/cn-core/middleware/cn-organization-middleware.service';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(CnAppModule);

  // enable cors
  const isLocal = process.env[CN_ENVIRONMENT_PROFILE_KEY] !== CN_ENVIRONMENT_PROFILE_PROD_VALUE;
  // allow the local-organization header only for local env
  const additionalHeader = isLocal ? [CN_LOCAL_ORGANIZATION_COOKIE] : [];
  app.enableCors(blGetCorsConfig(['gencovery.com', 'preconstellab.com'], isLocal, additionalHeader));

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // activate a micro service to enable transport listening
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      // eslint-disable-next-line max-len
      urls: [blGetRabbitMQUrl(process.env[CN_RABBITMQ_USER_KEY], process.env[CN_RABBITMQ_PASSWORD_KEY], process.env[CN_RABBITMQ_URL_KEY], process.env[CN_RABBITMQ_PORT_KEY])],
      queue: blTransportQueueHub,
      queueOptions: {
        durable: false
      },
    },
  });

  // await app.startAllMicroservices();
  app.startAllMicroservices().then(() => console.log('Successfully init microservice'))
    .catch(err => `Error during microservice init. Error : ${err}`);
  const port = 3001;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
