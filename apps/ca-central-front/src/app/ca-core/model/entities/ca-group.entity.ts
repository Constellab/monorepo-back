import {CaBaseEntity} from './ca-base-entity.class';

export enum CaGroupType{
  SINGLE_USER = 'SINGLE_USER',
  USERS = 'USERS',
  ORGANIZATION = 'ORGANIZATION'
}

export class CaGroup extends CaBaseEntity{
  label: string;

  type: CaGroupType;
}
