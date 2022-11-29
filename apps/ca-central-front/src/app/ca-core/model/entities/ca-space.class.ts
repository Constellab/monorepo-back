import {CaBaseEntity} from './ca-base-entity.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {CaUser} from './ca-user.class';
import {Type} from 'class-transformer';

export class CaSpace extends CaBaseEntity {

  name: string;

  photo: string;

  domain: string;

  nbLicenses: number;
}

export type CaSpaceDatasource = FlDatasourcePaginated<CaSpace>;

export enum CaSpaceRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export class CaSpaceUser {
  @Type(() => CaUser)
  user: CaUser;

  role: CaSpaceRole;

  active: boolean;
}

export class CaSpaceUserDatasource extends FlDatasourcePaginated<CaSpaceUser> {

  protected equals(a: CaSpaceUser, b: CaSpaceUser): boolean {
    return a.user.id === b.user.id;
  }
}


export interface CaSaveSpaceDTO {
  id: string;
  name: string;
  nbLicenses: number;
}

export class CaSpaceInfoDto {
  @Type(() => CaUser)
  user: CaUser;

  @Type(() => CaSpace)
  space: CaSpace;

  roleInSpace: CaSpaceRole;
}
