import { blGetCorsConfig } from '@monorepo/back-core-lib';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cors from 'cors';

import { HnCoreModule } from '../core/hn-core.module';
import { HnIconModule } from '../icon/hn-icon.module';
import { HnPublicController } from './hn-public.controller';

@Module({
  imports: [HnCoreModule, HnIconModule],
  controllers: [HnPublicController],
})
export class HnPublicModule implements NestModule {
  // configure cors in public mode for the controller HnPublicController
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(cors(blGetCorsConfig([], true))).forRoutes(HnPublicController);
  }
}
