import {HnRepoType, HnVersionType} from '../brick-version/hn-brick-version.entity';
import {HnVersionState} from '../brick-major-version/hn-brick-major-version.entity';
import {CmVersion} from '@monorepo/common-model';
import {HnBrickVisibility} from './hn-brick.entity';

export interface HnBrickTransportDto {
  id: string;
  name: string;
  pipRepo: string;
  gitRepo: string;
  visibility: HnBrickVisibility;
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
  technicalInfo: Record<string, any>
}

export class HnCreateTechnicalDocContent{
  brickName: string;
  importFile: HnImportTechnicalDocDTO;
}

export class HnIsActualBrickAndNewVersionDTO{
  brickId: string;
  inputBrickName: string;
  inputBrickVersion: string;
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

export interface HnImportEntity{
  unique_name: string;
  class_name: string;
  typing_name: string;
  parent: HnImportParentDTO;
  human_name: string;
  short_description: string;
  doc: string;
  hide: boolean;
  deprecated_since: string;
  deprecated_message: string;
  object_sub_type: string;
  status: string;
}

export type HnImportResourceDTO = HnImportEntity;


export interface HnImportTaskDTO extends HnImportEntity{
  input_specs: any;
  output_specs: any;
  config_specs: any;
  additional_info?: any;
}

export interface HnImportProtocolDTO extends HnImportEntity{
  input_specs: any;
  output_specs: any;
  config_specs: any;
  additional_info?: any;
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
  visibility: HnBrickVisibility;
}

export class HnTechnicalDocInputDTO{
  brickName: string;
  brickVersion: string;
  techDocType: string;
  techDocUniqueName: string;
}
