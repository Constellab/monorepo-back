import {HnRepoType, HnVersionType} from '../brick-version/hn-brick-version.entity';
import {HnVersionState} from '../brick-major-version/hn-brick-major-version.entity';
import {CmVersion} from '@monorepo/common-model';

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
  typing_name: string;
  class_name: string;
  human_name: string;
  brick_version: string;
  object_type: string; //TODO: Mettre une enum ?
}

export interface HnImportTechnicalDocDTO{
  json_version: string;
  brick_name: string;
  brick_version: string;
  resources: HnImportResourceDTO[],
  tasks: HnImportTaskDTO[],
  protocols: HnImportProtocolDTO[]
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


export interface HnImportTaskDTO{
  unique_name: string;
  class_name: string;
  parent: HnImportParentDTO;
  human_name: string;
  short_description: string;
  doc: string;
  hide: boolean;
  deprecated_since: string;
  deprecated_message: string;
  input_specs: any;
  output_specs: any;
  config_specs: any;
  additional_info?: any;
}

export interface HnImportProtocolDTO{
  unique_name: string;
  class_name: string;
  parent: HnImportParentDTO;
  human_name: string;
  short_description: string;
  doc: string;
  hide: boolean;
  deprecated_since: string;
  deprecated_message: string;
  input_specs: any;
  output_specs: any;
  config_specs: any;
  additional_info?: any;
  status: string;
}

export class HnBrickListDTO{
  id: string;
  name: string;
  description: string;
  pipRepo: string;
  gitRepo: string;
  lastVersion: CmVersion;
  isCertified?: boolean;
  imageLink?: string;
}

export class HnEditBrickDTO{
  id: string;
  description: string;
  pipRepo: string;
  gitRepo: string;
}
