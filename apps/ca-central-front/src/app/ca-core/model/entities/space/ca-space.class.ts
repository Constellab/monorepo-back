import {CaBaseEntity} from '../ca-base-entity.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';
import {CaUser} from '../ca-user.class';
import {Type} from 'class-transformer';
import {CaSpaceRole} from './ca-space-user.class';

export type CaSpaceType = 'BASIC' | 'PERSONAL';

export class CaSpace extends CaBaseEntity {

  name: string;

  photo: string;

  domain: string;

  nbLicenses: number;

  type: CaSpaceType;
}

export type CaSpaceDatasource = FlDatasourcePaginated<CaSpace>;

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
