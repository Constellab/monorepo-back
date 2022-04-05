import {HaEntity} from './ha-entity.class';
import {CmVersion} from '@monorepo/common-model';
import {HaRepoType} from './ha-version.class';
import {HaVersionType} from './ha-version.class';

export class HaBrick extends HaEntity {
  name: string;

  description: string;

  isCertified: boolean;

  gitRepo: string;

  pipRepo: string;
}


export class HaBrickDTO {
  id?: string;

  name: string;

  description: string;

  version: string|CmVersion;

  versionType: HaVersionType = HaVersionType.BETA;

  subPatch?: number;
}

export class HaCreateBrickDTO {
  id?: string;
  name: string
  description: string;
  version: string;
  isBeta: boolean = false;
  subPatch?: number;
  repoType: HaRepoType;
}
