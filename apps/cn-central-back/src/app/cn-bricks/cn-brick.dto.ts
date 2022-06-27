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
  GWS_CORE = 'gws_core',
  GWS_BIOTA = 'gws_biota',
}

/**
 * List of knows key for technical info of the brick version
 */
export enum CnBrickVersionTechnicalKey {
  // key for gws_core brick containing the front version
  GWS_CORE_FRONT_VERSION = 'FRONT_VERSION',
  GWS_BIOTA_MARIA_DB_URL = 'MARIA_DB_URL',
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
  technicalInfo?: Record<string, string>;
}
