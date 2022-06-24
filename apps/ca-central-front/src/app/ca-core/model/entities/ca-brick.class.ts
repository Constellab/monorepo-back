import {CaEntity} from './ca-entity.entity';
import {CmVersion} from '@monorepo/common-model';

/**
 * List of basic gws bricks
 */
export enum CaBrickGWS {
  GWS_CORE = 'gws_core'
}

export enum CaRepoType {
  PIP = 'PIP',
  GIT = 'GIT'
}

/**
 * A brick is a functionality to configure a Lab
 * A lab is configured with multiple bricks
 */
export class CaBrick extends CaEntity {

  name: string;

  pipRepo: string;

  gitRepo: string;
}

export enum CaVersionState {
  STABLE = 'STABLE',
  LATEST = 'LATEST',
  NEXT = 'NEXT'
}

export enum CaVersionType {
  NORMAL = 'NORMAL',
  BETA = 'BETA'
}

export class CaBrickVersion extends CaEntity {

  version: string;

  versionState: CaVersionState;

  versionType: CaVersionType;

  repoType: CaRepoType;

  technicalInfo: Record<string, string>;

  isEqualOrHigher(version: CmVersion): boolean {
    const currentVersion = CmVersion.fromString(this.version);
    return currentVersion.isEqualOrHigher(version);
  }
}

