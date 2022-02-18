import {CaBaseEntity} from './ca-base-entity.class';
import {CaBrickVersion} from './ca-brick.class';
import {Type} from 'class-transformer';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';


export class CaLabFrontVersion extends CaBaseEntity {

  version: string;

  @Type(() => CaBrickVersion)
  gwsCoreBrickVersion: CaBrickVersion;
}

export type CaLabFrontVersionDatasource = FlEntityPaginatedDatasource<CaLabFrontVersion>;


export interface CaSaveLabFrontVersionDTO {
  id: string;
  version: string;
  gwsCoreBrickVersion: CaBrickVersion;
}

