import {Controller, Get, Param, Req, Res} from '@nestjs/common';
import {EventPattern} from '@nestjs/microservices';
import {HnSpaceAggregateService} from './hn-space-aggregate.service';
import {HnSpaceUser} from './space-user/hn-space-user.entity';
import {BlPublic, BlResponseHelper} from '@monorepo/back-core-lib';
import {HnSpace} from './space/hn-space.entity';
import {Response} from 'express';

export enum HnSpaceUserAction {
  CREATE = 'createSpaceUser',
  REMOVE = 'removeSpaceUser',
  UPDATE = 'updateSpaceUser'
}

@Controller('space')
export class HnSpaceController {

  constructor(private readonly spaceAggregateService: HnSpaceAggregateService) {
  }

  /////////////////////////////////// Space ///////////////////////////////////

  /**
   * Get all spaces
   * @return a list of spaces
   */
  @Get()
  find(): Promise<HnSpace[]> {
    return this.spaceAggregateService.findSpaces();
  }

  /**
   * Get spaces by user id
   * @return a list of spaces
   */
  @Get('current-user')
  findSpacesOfCurrentUser(): Promise<HnSpace[]> {
    return this.spaceAggregateService.findSpacesOfCurrentUser();
  }

  @BlPublic()
  @Get('available/for-lab')
  async getSpacesForLab(@Req() req: Request): Promise<HnSpace[]> {
    return this.spaceAggregateService.getSpacesForLab(req);
  }

  /////////////////////////////////// Space User Queue ///////////////////////////////////

  /**
   * Handle space user created or updated
   * @param spaceUserDto
   */
  @EventPattern(HnSpaceUserAction.CREATE || HnSpaceUserAction.UPDATE)
  handleSpaceUserCreatedOrUpdated(spaceUserDto: HnSpaceUser): Promise<void> {
    return this.spaceAggregateService.createOrUpdateSpaceUser(spaceUserDto);
  }

  /**
   * Handle space user deleted
   * @param spaceUserDto
   */
  @EventPattern(HnSpaceUserAction.REMOVE)
  handleSpaceUserDeleted(spaceUserDto: HnSpaceUser): Promise<void> {
    return this.spaceAggregateService.deleteSpaceUser(spaceUserDto);
  }
}
