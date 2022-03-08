import {CnRepoType, CnVersionState} from './cn-brick-version.entity';

export interface CnBrickVersionDTO {
  name: string;
  version: string;
  isHidden: boolean,
}

/**
 * List of basic gws bricks
 */
export enum CnBrickGWS {
  GWS_CORE = 'gws_core'
}


export interface CnBrickSaveDTO {
  id: string;
  name: string;
  pipRepo: string;
  gitRepo: string;
  versions: CnBrickVersionSaveDTO[];
}

export interface CnBrickVersionSaveDTO {
  id: string;
  major: number;
  minor: number;
  patch: number;
  versionState: CnVersionState;
  repoType: CnRepoType;
}
