import {CaBaseEntity} from './ca-base-entity.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export enum CaGroupType {
  SINGLE_USER = 'SINGLE_USER',
  TEAM = 'TEAM',
}


export const caGroupTypeIcons: { [K in CaGroupType]: string } = {
  [CaGroupType.SINGLE_USER]: 'person',
  [CaGroupType.TEAM]: 'group'
};

export class CaGroup extends CaBaseEntity {
  label: string;

  type: CaGroupType;

  organizationId: string;
}

export type CaGroupDatasourcePaginated = FlEntityPaginatedDatasource<CaGroup>;

export interface CaSaveTeamDTO {
  id: string;
  label: string;
}
