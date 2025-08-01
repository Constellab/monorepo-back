import { BlParsePipe } from '@monorepo/back-core-lib';
import { Body, Controller, Post } from '@nestjs/common';

import { HnLabAllowWithoutUserAuthentication } from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnCommunityAppStatLabDto } from './community-app-stat/hn-community-app-stat.dto';
import { HnCommunityAppAggregateService } from './hn-community-app-aggregate.service';

@HnLabAllowWithoutUserAuthentication()
@Controller('app/for-lab')
export class HnCommunityAppForLabController {
  constructor(private readonly communityAppAggregateService: HnCommunityAppAggregateService) {}

  @Post('stat')
  async newCommunityAppStat(
    @Body(new BlParsePipe(HnCommunityAppStatLabDto)) statDto: HnCommunityAppStatLabDto
  ): Promise<void> {
    return this.communityAppAggregateService.newCommunityAppStat(statDto);
  }
}
