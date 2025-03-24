import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { HnSpaceAggregateService } from './hn-space-aggregate.service';
import { BlPublic } from '@monorepo/back-core-lib';
import { HnSpaceDto } from './space/hn-space.dto';
import { HnLabGuard } from '../core/decorators/hn-lab-auth-guard.decorator';

@Controller('space')
export class HnSpaceController {
  constructor(private readonly spaceAggregateService: HnSpaceAggregateService) {}

  /////////////////////////////////// Space ///////////////////////////////////

  /**
   * Get spaces by user id
   * @return a list of spaces
   */
  @Get('current-user')
  findSpacesOfCurrentUser(): Promise<HnSpaceDto[]> {
    return this.spaceAggregateService.findSpacesOfCurrentUser();
  }

  @HnLabGuard()
  @Get('available/for-lab')
  async getSpacesForLab(): Promise<HnSpaceDto[]> {
    return this.spaceAggregateService.getSpacesForLab();
  }

  @BlPublic()
  @Get('is-gencovery-member')
  async isGencoveryMember(): Promise<boolean> {
    return this.spaceAggregateService.checkCurrentUserIsInGencoverySpace();
  }

  @BlPublic()
  @Get('common-space/:userId')
  async getUserCommonSpace(@Param('userId', new ParseUUIDPipe()) userId: string): Promise<HnSpaceDto[]> {
    return this.spaceAggregateService.getUserCommonSpace(userId);
  }
}
