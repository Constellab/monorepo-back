import {NestFactory} from '@nestjs/core';
import {AppModule} from './hn-app.module';
import {blGetCorsConfig, blGetRabbitMQUrl, blTransportQueueConstellabUser} from '@monorepo/back-core-lib';
import {
  HN_ENVIRONMENT_PROFILE_KEY,
  HN_ENVIRONMENT_PROFILE_PROD_VALUE,
  HN_RABBITMQ_PASSWORD_KEY,
  HN_RABBITMQ_PORT_KEY,
  HN_RABBITMQ_URL_KEY,
  HN_RABBITMQ_USER_KEY
} from './app/core/model/config/hn-config.class';
import * as bodyParser from 'body-parser';
import {Transport} from '@nestjs/microservices';

async function bootstrap(): Promise<void> {

  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors(blGetCorsConfig(
    ['gencovery.com', 'constellab.community'],
    process.env[HN_ENVIRONMENT_PROFILE_KEY] !== HN_ENVIRONMENT_PROFILE_PROD_VALUE)
  );

  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  // activate a micro service to enable transport listening
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      // eslint-disable-next-line max-len
      urls: [blGetRabbitMQUrl(process.env[HN_RABBITMQ_USER_KEY], process.env[HN_RABBITMQ_PASSWORD_KEY], process.env[HN_RABBITMQ_URL_KEY], process.env[HN_RABBITMQ_PORT_KEY])],
      queue: blTransportQueueConstellabUser,
      queueOptions: {
        durable: true,
        deliveryMode: 2 // enable persistent messaging
      },
    },
  });

  // await app.startAllMicroservices();
  app.startAllMicroservices().then(() => console.log('Successfully init microservice'))
    .catch(err => `Error during microservice init. Error : ${err}`);

  const port = process.env.port || 3333;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
