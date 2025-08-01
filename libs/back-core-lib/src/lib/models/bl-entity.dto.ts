import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { DateTime } from 'luxon';

import { BlEntityWithId } from './bl-entity-with-id.entity';
import { BlUser } from './bl-user/bl-user.class';

export class BlEntityWithIdDto {
  id: string;

  constructor(entity: BlEntityWithId) {
    this.id = entity.id;
  }
}

export class BlBaseEntityDto extends BlEntityWithIdDto {
  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  createdBy: BlUser;

  @ClLuxonDateTimeTransform()
  lastModifiedAt: DateTime;

  lastModifiedBy: BlUser;

  constructor(entity: any) {
    super(entity);
    this.createdAt = entity.createdAt;
    this.createdBy = entity.createdBy;
    this.lastModifiedAt = entity.lastModifiedAt;
    this.lastModifiedBy = entity.lastModifiedBy;
  }
}
