import {FlEntity} from '@monorepo/front-core-lib';
import {ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Expose} from 'class-transformer';

/**
 * Base entity for the lab entities
 */
export class LabEntity implements FlEntity {

  id: string;

}

/**
 * Base entity for the lab entities
 */
export class LabBaseEntity extends LabEntity {

  @Expose({name: 'created_at'})
  @ClLuxonDateTimeTransform()
  createdAt: DateTime;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'last_modified_at'})
  @ClLuxonDateTimeTransform()
  lastModifiedAt: DateTime;
}

