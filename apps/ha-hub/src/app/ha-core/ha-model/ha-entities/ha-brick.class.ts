import {HaEntity} from './ha-entity.class';
import {CmVersion} from '@monorepo/common-model';
import {HaReferenceDTO, HaRepoType, HaVersionType} from './ha-version.class';

export class HaBrick extends HaEntity {
  name: string;

  description: string;

  isCertified: boolean;

  gitRepo: string;

  pipRepo: string;

  lastVersion: CmVersion;

  imageLink?: string;
}

export class HaBrickCreationDTO{
  name: string;
  description: string;
  repoGit: string;
  repoPip: string;
  version: string;
  repoType: HaRepoType;
  isBeta: boolean = false;
  subPatch?: number;
  technicalInfo?: Record<string, any>;
  references?: HaReferenceDTO[]

  constructor(name: string, version: string, technicalInfo: Record<string, any>, references: HaReferenceDTO[]) {
    this.name = name;
    this.version = version;
    this.technicalInfo = technicalInfo;
    this.references = references;
    this.description = '';
    this.repoType = HaRepoType.PIP;
    this.subPatch = 0;
    this.repoGit = '';
    this.repoPip = '';
  }
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

export class HaEditBrickDTO{
  id: string;
  description: string;
  gitRepo: string;
  pipRepo: string;
}
