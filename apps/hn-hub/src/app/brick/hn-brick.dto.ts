import {HnRepoType, HnVersionType} from '../brick-version/hn-brick-version.entity';
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
  versionType: HnVersionType;
  subPatch: number;
  versionState: HnVersionState;
  repoType: HnRepoType;
}

export class HnCreateTechnicalDocContent{
  brickName: string;
  importFile: HnImportTechnicalDocDTO;
}

export interface HnImportParentDTO{
  unique_name: string;
  class_name: string;
  object_type: string; //TODO: Mettre une enum ?
}

export interface HnImportTechnicalDocDTO{
  json_version: string;
  brick_name: string;
  brick_version: string;
  resources: HnImportResourceDTO[]
}

export interface HnImportResourceDTO{
  unique_name: string;
  class_name: string;
  parent: HnImportParentDTO;
  human_name: string;
  short_description: string;
  doc: string;
  hide: boolean;
  deprecated_since: string;
  deprecated_message: string;
}
