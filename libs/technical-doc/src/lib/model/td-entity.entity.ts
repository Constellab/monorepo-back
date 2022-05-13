import {FlEntity} from '@monorepo/front-core-lib';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Expose} from 'class-transformer';

/**
 * Base entity for the td entities
 */
export class TdEntity implements FlEntity {

  id: string;

}

/**
 * Base entity for the td entities
 */
export class TdBaseEntity extends TdEntity {

  @Expose({name: 'created_at'})
  @ClLuxonTransform()
  createdAt: DateTime;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'last_modified_at'})
  @ClLuxonTransform()
  lastModifiedAt: DateTime;
}
