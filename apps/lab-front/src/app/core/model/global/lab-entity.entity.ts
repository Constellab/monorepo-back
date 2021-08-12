import {FlEntity} from '@monorepo/front-core-lib';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {Expose} from 'class-transformer';

/**
 * Base entity for the lab entities
 */
export class LabEntity implements FlEntity {

  @Expose({name: 'uri'})
  id: string;

}

/**
 * Base entity for the lab entities
 */
export class LabBaseEntity extends LabEntity {

  @Expose({name: 'creation_datetime'})
  @ClLuxonTransform()
  createdAt: DateTime;

  @Expose({name: 'is_archived'})
  isArchived: boolean;

  @Expose({name: 'save_datetime'})
  @ClLuxonTransform()
  savedAt: DateTime;

}


export interface LabUnconvertedEntity {
  uri: string;
}
