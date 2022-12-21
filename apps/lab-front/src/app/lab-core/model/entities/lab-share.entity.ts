import {Expose, Type} from 'class-transformer';
import {DateTime} from 'luxon';
import {ClDateHelper, ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {LabBaseEntityWithUser, LabUser} from './lab-user.entity';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {LabObjectType} from '../../lab-core-pipe/lab-detail-route/lab-detail-route.pipe';
import {LabBaseEntity} from '../global/lab-entity.entity';

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

  get labObjectType(): LabObjectType {
    return 'resource';
  }
}

export type LabShareLinkDatasource = FlDatasourcePaginated<LabShareLink>;


export class LabSharedEntity extends LabBaseEntity {
  // above to ts
  @Expose({name: 'lab_id'})
  labId: string;

  @Expose({name: 'lab_name'})
  labName: string;

  @Expose({name: 'user_id'})
  userId: string;

  @Expose({name: 'user_firstname'})
  userFirstname: string;

  @Expose({name: 'user_lastname'})
  userLastname: string;

  @Expose({name: 'space_id'})
  spaceId: string;

  @Expose({name: 'space_name'})
  spaceName: string;

  @Expose({name: 'created_by'})
  @Type(() => LabUser)
  createdBy: LabUser

}

export type LabSharedEntityDatasource = FlDatasourcePaginated<LabSharedEntity>;
