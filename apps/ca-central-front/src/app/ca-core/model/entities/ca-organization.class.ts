import {CaBaseEntity} from './ca-base-entity.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {CaUser} from './ca-user.class';
import {Type} from 'class-transformer';

export class CaOrganization extends CaBaseEntity {

  label: string;

  photo: string;

  domain: string;

  nbLicenses: number;
}

export type CaOrganizationDatasource = FlDatasourcePaginated<CaOrganization>;

export enum CaOrganizationRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class CaOrganizationUser {
  @Type(() => CaUser)
  user: CaUser;

  role: CaOrganizationRole;

  active: boolean;
}

export class CaOrganizationUserDatasource extends FlDatasourcePaginated<CaOrganizationUser> {

  protected equals(a: CaOrganizationUser, b: CaOrganizationUser): boolean {
    return a.user.id === b.user.id;
  }
}


export interface CaSaveOrganizationDTO {
  id: string;
  label: string;
  domain: string;
  nbLicenses: number;
}

export class CaOrganizationInfoDto {
  @Type(() => CaUser)
  user: CaUser;

  @Type(() => CaOrganization)
  organization: CaOrganization;

  roleInOrga: CaOrganizationRole;
}
