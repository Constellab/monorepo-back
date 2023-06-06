import {NestFactory} from '@nestjs/core';
import {CnAppModule} from './cn-app.module';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {blGetCorsConfig, blGetRabbitMQUrl, blTransportQueueHub} from '@monorepo/back-core-lib';
import {
  CN_ENVIRONMENT_PROFILE_KEY,
  CN_RABBITMQ_PASSWORD_KEY,
  CN_RABBITMQ_PORT_KEY,
  CN_RABBITMQ_URL_KEY,
  CN_RABBITMQ_USER_KEY,
  CnEnvironmentProfile
} from './app/cn-core/model/config/cn-config.class';
import {Transport} from '@nestjs/microservices';
import {CN_LOCAL_SPACE_COOKIE} from './app/cn-core/middleware/cn-space-middleware.service';
import {NestExpressApplication} from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create<NestExpressApplication>(CnAppModule);

  // enable cors
  const env: CnEnvironmentProfile = process.env[CN_ENVIRONMENT_PROFILE_KEY] as any;
  const isLocal = env === 'dev' || env === 'docker' || env === 'test';
  // allow the local-space header only for local env
  const additionalHeader = isLocal ? [CN_LOCAL_SPACE_COOKIE] : [];
  app.enableCors(blGetCorsConfig(['constellab.space', 'preconstellab.com'], isLocal, additionalHeader));

  // enable proxy, tell express to trust the first proxy
  // https://docs.nestjs.com/security/rate-limiting#proxies
  app.set('trust proxy', 1);

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // activate a micro-service to enable transport listening
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      // eslint-disable-next-line max-len
      urls: [blGetRabbitMQUrl(process.env[CN_RABBITMQ_USER_KEY], process.env[CN_RABBITMQ_PASSWORD_KEY], process.env[CN_RABBITMQ_URL_KEY], process.env[CN_RABBITMQ_PORT_KEY])],
      queue: blTransportQueueHub,
      queueOptions: {
        durable: true,
        deliveryMode: 2 // enable persistent messaging
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
