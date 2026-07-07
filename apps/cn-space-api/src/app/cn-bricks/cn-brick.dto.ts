import { CnBrickVisibility } from './cn-brick.entity';
import { CnRepoType, CnVersionState, CnVersionType } from './cn-brick-version.entity';

export interface CnBrickVersionDTO {
  name: string;
  version: string;
}

/**
 * List of basic gws bricks
 */
export enum CnBrickGWS {
  GWS_CORE = 'gws_core',
  GWS_BIOTA = 'gws_biota',
  GWS_UBIOME = 'gws_ubiome',
  GWS_OMIX = 'gws_omix',
  GWS_ACADEMY = 'gws_academy',
}

/**
 * List of known gws_core versions that introduce a breaking change on the
 * space <-> lab contract, used to branch the payload sent to the lab.
 */
export enum CnGwsCoreVersion {
  // from this version, the generate-user-access-token share route expects a
  // { user, open_app_in_new_tab } dict instead of a bare user object
  _0_23_1 = '0.23.1',
}

/**
 * List of knows key for technical info of the brick version
 */
export enum CnBrickVersionTechnicalKey {
  // key for gws_core brick containing the front version
  GWS_CORE_FRONT_VERSION = 'FRONT_VERSION',
  GWS_CORE_GLAB_VERSION = 'GLAB_VERSION',
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
  visibility: CnBrickVisibility;
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
