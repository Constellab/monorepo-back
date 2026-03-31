import { Module } from '@nestjs/common';

import { HnSpaceAggregateModule } from '../../space-aggregate/hn-space-aggregate.module';
import { HnCommunitySecurity } from './hn-community-security.service';

@Module({
  imports: [HnSpaceAggregateModule],
  providers: [HnCommunitySecurity],
  exports: [HnCommunitySecurity],
})
export class HnCommunitySecurityModule {}
