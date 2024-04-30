import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {HnCoreModule} from '../core/hn-core.module';
import {HnPublicController} from './hn-public.controller';
import {HnIconModule} from '../icon/hn-icon.module';
import * as cors from 'cors';
import {blGetCorsConfig} from '@monorepo/back-core-lib';

@Module({
  imports: [
    HnCoreModule,
    HnIconModule
  ],
  controllers: [HnPublicController],
})
export class HnPublicModule implements NestModule {

  // configure cors in public mode for the controller HnPublicController
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(
      cors(blGetCorsConfig([], true))
    ).forRoutes(HnPublicController);
  }

}
