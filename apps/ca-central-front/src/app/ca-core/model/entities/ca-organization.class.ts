import {CaBaseEntity} from './ca-base-entity.class';
import {FlDatasourcePaginated} from '@monorepo/front-core-lib';

export class CaOrganization extends CaBaseEntity {

  label: string;

  photo: string;
}

export type CaOrganizationDatasourcePaginated = FlDatasourcePaginated<CaOrganization>;

export interface CaSaveOrganizationDTO {
  id: string;
  label: string;
}
