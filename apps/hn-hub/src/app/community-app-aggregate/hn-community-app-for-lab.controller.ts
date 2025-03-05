import { HnLabAllowWithoutUserAuthentication } from '../core/decorators/hn-lab-auth-guard.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { HnCommunityAppAggregateService } from './hn-community-app-aggregate.service';
import { HnCommunityAppStatLabDto } from './hn-community-app-stat/hn-community-app-stat.dto';
import { BlParsePipe } from '@monorepo/back-core-lib';

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
