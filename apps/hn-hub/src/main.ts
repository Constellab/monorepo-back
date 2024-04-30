import {NestFactory} from '@nestjs/core';
import {blGetCorsConfig, blGetRabbitMQUrl, blTransportQueueConstellabUser} from '@monorepo/back-core-lib';
import {
  HN_ENVIRONMENT_PROFILE_KEY,
  HN_RABBITMQ_PASSWORD_KEY,
  HN_RABBITMQ_PORT_KEY,
  HN_RABBITMQ_URL_KEY,
  HN_RABBITMQ_USER_KEY,
  HnEnvironmentProfile
} from './app/core/model/config/hn-config.class';
import {json, urlencoded} from 'body-parser';
import {Transport} from '@nestjs/microservices';
import {NestExpressApplication} from '@nestjs/platform-express';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {HnAppModule} from './hn-app.module';


async function bootstrap(): Promise<void> {

  const app = await NestFactory.create<NestExpressApplication>(HnAppModule);

  // enable cors
  const env: HnEnvironmentProfile = process.env[HN_ENVIRONMENT_PROFILE_KEY] as HnEnvironmentProfile;
  const isLocal = env === 'dev' || env === 'docker' || env === 'test';

  app.enableCors(blGetCorsConfig(['gencovery.com', 'constellab.community', 'gencovery.io', 'constellab.app'], false));

  app.use(json({limit: '50mb'}));
  app.use(urlencoded({limit: '50mb', extended: true}));

  // enable proxy, tell express to trust the first proxy
  // https://docs.nestjs.com/security/rate-limiting#proxies
  app.set('trust proxy', 1);

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // activate a microservice to enable transport listening
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
