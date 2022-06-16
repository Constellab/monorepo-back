import {HaEntity} from './ha-entity.class';

export enum HaRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

export enum HaVersionType {
  NORMAL = 'NORMAL',
  BETA = 'BETA'
}

export class HaVersion extends HaEntity {
  version: string;
}

export class HaNewVersionDTO {
  brickId: string;

  version: string;

  repoType: HaRepoType;

  isBeta: boolean = false;

  subPatch?: number;

  references?: HaReferenceDTO[]
}


export class HaAddVersionInput{
  isNew: boolean;
  name: string;
  version: string;
  brickVersionReferences: HaReferenceDTO[];

  constructor(isNew: boolean, name: string, version: string, environment: HaEnvironmentDTO) {
    this.isNew = isNew;
    this.name = name;
    this.version = version;
    this.brickVersionReferences = [];
    for(const d of environment.pip){
      for(const p of d.packages){
        if(p.is_brick){
          this.brickVersionReferences.push({name: p.name, version: p.version});
        }
      }
    }
    for(const d of environment.git){
      for(const p of d.packages){
        if(p.is_brick){
          this.brickVersionReferences.push({name: p.name, version: p.version});
        }
      }
    }
  }
}

export interface HaReferenceDTO{
  name: string;
  version: string;
  referenceState?: HaBrickVersionReferenceState;
}

export enum HaBrickVersionReferenceState{
  DIRECT = 'DIRECT',
  INDIRECT = 'INDIRECT'
}

export interface HaImportReferenceDTO{
  name: string;
  version: string;
  is_brick: boolean;
}

export interface HaEnvironmentDTO{
  pip: HaRepoTypeNewVersionDTO[];
  git: HaRepoTypeNewVersionDTO[];
}

export interface HaRepoTypeNewVersionDTO{
  source: string;
  packages: HaImportReferenceDTO[];
}
