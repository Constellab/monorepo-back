import {CaBaseEntity} from './ca-base-entity.class';
import {DateTime} from 'luxon';
import {ClDateHelper, ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CaSpace, CaSpaceRole} from './ca-space.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export class CaSpaceInvit extends CaBaseEntity {

  userMail: string;

  role: CaSpaceRole;


  @ClLuxonDateTimeTransform()
  validUntil: DateTime;

  isValid(): boolean {
    return this.validUntil > ClDateHelper.getDate();
  }
}

export class CaSpaceInvitFull extends CaSpaceInvit {

  @Type(() => CaSpace)
  space: CaSpace;
}


export type CaSpaceInvitDatasource = FlDatasourcePaginated<CaSpaceInvit>;

export interface CaSpaceInvitDTO {
  userMail: string;
  role: CaSpaceRole;
}
