import {Expose} from 'class-transformer';
import {DateTime} from 'luxon';
import {ClDateHelper, ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {LabBaseEntityWithUser} from './lab-user.entity';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';

export type LabShareLinkType = 'RESOURCE';

export class LabShareLink extends LabBaseEntityWithUser {

  @Expose({name: 'entity_id'})
  entityId: string;

  @Expose({name: 'entity_type'})
  entityType: LabShareLinkType;

  @Expose({name: 'entity_name'})
  entityName: string;

  @Expose({name: 'valid_until'})
  @ClLuxonDateTimeTransform()
  validUntil: DateTime;

  status: 'SUCCESS' | 'ERROR';

  token: string;

  isValid(): boolean {
    return this.validUntil > ClDateHelper.getDate();
  }
}

export type LabShareLinkDatasource = FlDatasourcePaginated<LabShareLink>;
