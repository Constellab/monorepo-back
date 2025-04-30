import { NestFactory } from '@nestjs/core';
import { CnAppModule } from './cn-app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { blGetCorsConfig } from '@monorepo/back-core-lib';
import { CN_ENVIRONMENT_PROFILE_KEY, CnEnvironmentProfile } from './app/cn-core/model/config/cn-config.class';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'body-parser';
import { CN_LOCAL_SPACE_COOKIE } from './app/cn-core/guards/cn-jwt-auth.guard';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(CnAppModule);

  // enable cors
  const env: CnEnvironmentProfile = process.env[CN_ENVIRONMENT_PROFILE_KEY] as CnEnvironmentProfile;
  const isLocal = env === 'dev' || env === 'docker' || env === 'test';
  // allow the local-space header only for local env
  const additionalHeader = isLocal ? [CN_LOCAL_SPACE_COOKIE] : [];
  app.enableCors(blGetCorsConfig(['constellab.space', 'preconstellab.com'], isLocal, additionalHeader));

  // increase body limit to 10mb
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // enable proxy, tell express to trust the first proxy
  // https://docs.nestjs.com/security/rate-limiting#proxies
  app.set('trust proxy', 1);

  // enable custom logger using winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const port = 3001;
  await app.listen(port, () => {
    console.log('Listening at http://localhost:' + port + '/');
  });
}

bootstrap();
