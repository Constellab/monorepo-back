import {Controller, Get} from '@nestjs/common';
import {EventPattern} from '@nestjs/microservices';
import {HnSpaceAggregateService} from './hn-space-aggregate.service';
import {HnSpaceUser} from './space-user/hn-space-user.entity';
import {BlPublic} from '@monorepo/back-core-lib';
import {HnSpace} from './space/hn-space.entity';

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
  @BlPublic()
  @Get()
  find(): Promise<HnSpace[]> {
    return this.spaceAggregateService.findSpaces();
  }


  /////////////////////////////////// Space User Queue ///////////////////////////////////

  @EventPattern(HnSpaceUserAction.CREATE || HnSpaceUserAction.UPDATE)
  handleSpaceUserCreatedOrUpdated(spaceUserDto: HnSpaceUser): Promise<void> {
    return this.spaceAggregateService.createOrUpdateSpaceUser(spaceUserDto);
  }

  @EventPattern(HnSpaceUserAction.REMOVE)
  handleSpaceUserDeleted(spaceUserDto: HnSpaceUser): Promise<void> {
    return this.spaceAggregateService.deleteSpaceUser(spaceUserDto);
  }
}
