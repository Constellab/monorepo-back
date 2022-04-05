import {HnRepoType} from '../brick-version/hn-brick-version.entity';
import {HnVersionState} from '../brick-major-version/hn-brick-major-version.entity';

export interface HnBrickTransportDto {
  id: string;
  name: string;
  pipRepo: string;
  gitRepo: string;
  versions: HnBrickVersionTransportDto[];
}


export interface HnBrickVersionTransportDto {
  id: string;
  major: number;
  minor: number;
  patch: number;
  versionType: HnRepoType;
  subPatch: number;
  versionState: HnVersionState;
  repoType: HnRepoType;
}
