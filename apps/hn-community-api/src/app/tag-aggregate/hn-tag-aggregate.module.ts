import { Module } from '@nestjs/common';
import { HnTagAggregateService } from './hn-tag-aggregate.service';
import { HnTagAggregateController } from './hn-tag-aggregate.controller';
import { HnTagAggregateLabController } from './hn-tag-aggregate-lab.controller';
import { HnTagKeyModule } from './tag-key/hn-tag-key.module';
import { HnTagValueModule } from './tag-value/hn-tag-value.module';
import { HnCoreModule } from '../core/hn-core.module';
import { HnTagCoAuthorModule } from './tag-co-author/hn-tag-co-author.module';
import { HnSpaceAggregateModule } from '../space-aggregate/hn-space-aggregate.module';
import { HnUserModule } from '../users/hn-user.module';

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
  providers: [HnTagAggregateService],
  exports: [HnTagAggregateService],
})
export class HnTagAggregateModule {}
