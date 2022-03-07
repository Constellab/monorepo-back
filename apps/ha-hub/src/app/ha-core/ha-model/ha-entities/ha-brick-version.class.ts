import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {HaEntity} from './ha-entity.class';
import {HaRepoType} from './ha-version.class';
import {HaBrickMajorVersion} from './ha-brick-major-version.class';
import {Type} from 'class-transformer';

export class HaBrickVersion extends HaEntity{
  minor: number;
  patch: number;
  @Type(() => HaBrickMajorVersion)
  brickMajorVersion: HaBrickMajorVersion;
  repoType: HaRepoType
}

export type HaBrickVersionDataSource = FlEntityPaginatedDatasource<HaBrickVersion>;
