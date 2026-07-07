import { BlAbstractPaginatedService, BlEntityWithId } from '@monorepo/back-core-lib';
import { ClDateHelper, ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnActivity, CnActivityEntityType, CnActivityType } from './cn-activity.entity';

export interface CnActivityCreateDTO {
  entityType: CnActivityEntityType;
  entity: BlEntityWithId;
  entityName: string;
  actionType: CnActivityType;
  title: string;
  user?: CnUser;
  space?: CnSpace;
  parentEntityId?: string;
  additionalData?: any;
}

export const CN_ACTIVITY_EVENT = 'activity';

export interface CnActivityEventDTO<T extends BlEntityWithId = BlEntityWithId> {
  activity: CnActivity;
  entity: T;
  additionalData?: any;
}

@Injectable()
export class CnActivityService extends BlAbstractPaginatedService<CnActivity> {
  constructor(
    @InjectRepository(CnActivity) private repository: Repository<CnActivity>,
    private eventEmitter: EventEmitter2
  ) {
    super(repository, CnActivity);
  }

  async create(activityDTO: CnActivityCreateDTO): Promise<CnActivity> {
    const activity = new CnActivity();
    activity.entityType = activityDTO.entityType;
    activity.entityId = activityDTO.entity.id;
    activity.entityName = activityDTO.entityName;
    activity.actionType = activityDTO.actionType;
    activity.title = activityDTO.title;
    activity.user = activityDTO.user ?? CnCurrentUserHelper.getAndCheckCurrentUser();
    activity.space = activityDTO.space ?? CnCurrentUserHelper.getCurrentSpace();
    activity.parentEntityId = activityDTO.parentEntityId;
    activity.createdAt = ClDateHelper.getDate();

    const dbActivity = await this.repository.save(activity);

    const event: CnActivityEventDTO = {
      activity: dbActivity,
      entity: activityDTO.entity,
      additionalData: activityDTO.additionalData,
    };
    this.eventEmitter.emit(CN_ACTIVITY_EVENT, event);
    return dbActivity;
  }

  public async search(
    findOptions: FindOneOptions<CnActivity>,
    page: number,
    size: number
  ): Promise<ClPage<CnActivity>> {
    findOptions.relations = {
      user: true,
      space: true,
    };
    return this.findPaginated(page, size, findOptions);
  }

  public async deleteBySpaceId(spaceId: string): Promise<void> {
    await this.repository.delete({ space: { id: spaceId } });
  }
}
