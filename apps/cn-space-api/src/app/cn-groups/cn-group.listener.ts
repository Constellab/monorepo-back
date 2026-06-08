import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CN_SPACE_EVENT_NAME, CnSpaceEvent } from '../cn-spaces/cn-space.event';
import { CnGroupsAggregateService } from './cn-groups-aggregate.service';

@Injectable()
export class CnGroupListener {
  constructor(private groupAggregateService: CnGroupsAggregateService) {}

  @OnEvent(CN_SPACE_EVENT_NAME)
  async handleSpaceEvent(event: CnSpaceEvent): Promise<Error | null> {
    if (event.type === 'REMOVE_USER_FROM_SPACE') {
      return await this.groupAggregateService
        .removeUserFromAllTeams(event.userId, event.spaceId)
        .catch((err) => err);
    }

    return null;
  }
}
