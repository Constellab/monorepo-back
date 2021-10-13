import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BlUser} from '@monorepo/back-core-lib';

export class BlEntityWithIdDto {
  id: string = undefined;
}

export class BlBaseEntityDto extends BlEntityWithIdDto {
  @ClLuxonDateTimeTransform()
  createdAt: DateTime = undefined;

  createdBy: BlUser = undefined;

  @ClLuxonDateTimeTransform()
  lastModifiedAt: DateTime = undefined;

  lastModifiedBy: BlUser = undefined;
}
