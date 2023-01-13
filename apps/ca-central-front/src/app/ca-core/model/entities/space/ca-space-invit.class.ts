import {CaBaseEntity} from '../ca-base-entity.class';
import {DateTime} from 'luxon';
import {ClDateHelper, ClLuxonDateTimeTransform} from '@monorepo/core-lib';
import {CaSpace} from './ca-space.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaSpaceRole} from './ca-space-user.class';
import {CaUser} from '../ca-user.class';

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

export interface CaSpaceInvitCreateDTO {
  userMail: string;
  role: CaSpaceRole;
}

export class CaSpaceInvitReadDTO {
  @Type(() => CaSpaceInvitFull)
  invitation: CaSpaceInvitFull;

  // provided if the email in the invitation corresponds to an existing user
  existingUser?: CaUser;
}
