import {HaEntity} from './ha-entity.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export enum HaRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

export class HaVersion extends HaEntity {
  version: string;
}

export class HaNewVersionDTO {
  brickId: string;

  version: string;

  repoType: HaRepoType;
}
