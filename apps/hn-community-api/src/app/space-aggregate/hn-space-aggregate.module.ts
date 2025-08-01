import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnUserService } from '../users/hn-user.service';
import { HnSpaceController } from './hn-space.controller';
import { HnSpaceProcessor } from './hn-space.processor';
import { HnSpaceAggregateService } from './hn-space-aggregate.service';
import { HnSpaceModule } from './space/hn-space.module';
import { HnSpaceUserModule } from './space-user/hn-space-user.module';

@Module({
  imports: [HnUserModule, HnCoreModule, HnSpaceModule, HnSpaceUserModule],
  controllers: [HnSpaceController],
  providers: [HnSpaceAggregateService, HnUserService, HnSpaceProcessor],
  exports: [HnSpaceAggregateService],
})
export class HnSpaceAggregateModule {}
