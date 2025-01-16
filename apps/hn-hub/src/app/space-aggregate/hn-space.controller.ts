import { Controller, Get, Param, ParseUUIDPipe, Req } from '@nestjs/common';
import { HnSpaceAggregateService } from './hn-space-aggregate.service';
import { BlPublic } from '@monorepo/back-core-lib';
import { HnSpaceDto } from './space/hn-space.dto';
import { Request } from 'express';

@Controller('space')
export class HnSpaceController {
  constructor(private readonly spaceAggregateService: HnSpaceAggregateService) {}

  /////////////////////////////////// Space ///////////////////////////////////

  /**
   * Get all spaces
   * @return a list of spaces
   */
  @Get()
  find(): Promise<HnSpaceDto[]> {
    return this.spaceAggregateService.findSpaces();
  }

  /**
   * Get spaces by user id
   * @return a list of spaces
   */
  @Get('current-user')
  findSpacesOfCurrentUser(): Promise<HnSpaceDto[]> {
    return this.spaceAggregateService.findSpacesOfCurrentUser();
  }

  @BlPublic()
  @Get('available/for-lab')
  async getSpacesForLab(@Req() req: Request): Promise<HnSpaceDto[]> {
    return this.spaceAggregateService.getSpacesForLab(req);
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
