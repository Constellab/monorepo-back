import {CnRepoType, CnVersionState, CnVersionType} from './cn-brick-version.entity';

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

/**
 * Object received from the queue to sync a brick and its versions
 */
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
  subPatch: number;
  versionType: CnVersionType;
  versionState: CnVersionState;
  repoType: CnRepoType;
}
