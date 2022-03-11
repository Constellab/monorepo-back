import {CaBaseEntity} from './ca-base-entity.class';

export enum CaGroupType{
  SINGLE_USER = 'SINGLE_USER',
  USERS = 'USERS',
  ORGANIZATION = 'ORGANIZATION'
}


export const caGroupTypeIcons: {[K in CaGroupType]: string} = {
  [CaGroupType.SINGLE_USER]: 'person',
  [CaGroupType.ORGANIZATION]: 'organization',
  [CaGroupType.USERS]: 'group'
}

export class CaGroup extends CaBaseEntity{
  label: string;

  type: CaGroupType;
}
