import {CaBaseEntity} from './ca-base-entity.class';
import {DateTime} from 'luxon';
import {ClDateHelper, ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CaOrganization, CaOrganizationRole} from './ca-organization.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export class CaOrganizationInvit extends CaBaseEntity {

  userMail: string;

  role: CaOrganizationRole;


  @ClLuxonDateTimeTransform()
  validUntil: DateTime;

  isValid(): boolean {
    return this.validUntil > ClDateHelper.getDate();
  }
}

export class CaOrganizationInvitFull extends CaOrganizationInvit {

  @Type(() => CaOrganization)
  organization: CaOrganization;
}


export type CaOrganizationInvitDatasource = FlDatasourcePaginated<CaOrganizationInvit>;

export interface CaOrganizationInvitDTO {
  userMail: string;
  role: CaOrganizationRole;
}
