import { Module } from '@nestjs/common';

import { HnCoreModule } from '../core/hn-core.module';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnUserModule } from '../users/hn-user.module';
import { HnTagListener } from './hn-tag.listener';
import { HnTagAggregateController } from './hn-tag-aggregate.controller';
import { HnTagAggregateService } from './hn-tag-aggregate.service';
import { HnTagAggregateLabController } from './hn-tag-aggregate-lab.controller';
import { HnTagCoAuthorModule } from './tag-co-author/hn-tag-co-author.module';
import { HnTagKeyModule } from './tag-key/hn-tag-key.module';
import { HnTagValueModule } from './tag-value/hn-tag-value.module';

@Module({
  imports: [
    HnCoreModule,
    HnSpaceAggregateModule,
    HnTagValueModule,
    HnTagKeyModule,
    HnTagCoAuthorModule,
    HnUserModule,
  ],
  controllers: [HnTagAggregateController, HnTagAggregateLabController],
  providers: [HnTagAggregateService, HnTagListener],
  exports: [HnTagAggregateService],
})
export class HnTagAggregateModule {}
