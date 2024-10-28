import {HnReferenceDTO, HnRepoType, HnVersionType} from '../brick-version/hn-brick-version.entity';
import {HnVersionState} from '../brick-major-version/hn-brick-major-version.entity';
import {HnBrick, HnBrickVisibility} from './hn-brick.entity';
import {BlEntityWithIdDTO, BlVersion} from '@monorepo/back-core-lib';
import {HnSpace} from '../../space-aggregate/space/hn-space.entity';
import {HnBrickUserDto} from '../brick-user/hn-brick-user.dto';
import {HnUserDto} from '../../users/hn-user.dto';
import {HnSpaceDto} from '../../space-aggregate/space/hn-space.dto';

export class HnBrickDto extends BlEntityWithIdDTO {
  name: string;
  description: string;
  isCertified: boolean;
  visibility: HnBrickVisibility;
  pipRepo?: string;
  gitRepo?: string;
  imageLink?: string;
  credentialUsername?: string;
  credentialPassword?: string;
  brickUsers: HnBrickUserDto[];
  createdAt: string;
  createdBy: HnUserDto;
  lastModifiedAt: string;
  lastModifiedBy: HnUserDto;
  space?: HnSpaceDto;
  likes: number;
  comments: number;

  constructor(brick: HnBrick) {
    super();
    if (!brick) {
      return;
    }
    this.id = brick.id;
    this.name = brick.name;
    this.description = brick.description;
    this.isCertified = brick.isCertified;
    this.visibility = brick.visibility;
    this.pipRepo = brick.pipRepo;
    this.gitRepo = brick.gitRepo;
    this.imageLink = brick.imageLink;
    this.credentialUsername = brick.credentialUsername;
    this.credentialPassword = brick.credentialPassword;
    this.brickUsers = brick.brickUsers?.map(brickUser => new HnBrickUserDto(brickUser));
    this.createdAt = brick.createdAt.toISO();
    this.createdBy = new HnUserDto(brick.createdBy);
    this.lastModifiedAt = brick.lastModifiedAt.toISO();
    this.lastModifiedBy = new HnUserDto(brick.lastModifiedBy);
    this.space = brick.space ? new HnSpaceDto(brick.space) : null;
    this.likes = brick.likes;
    this.comments = brick.comments;
  }
}

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
  technicalInfo: Record<string, any>;
}

export class HnCreateTechnicalDocContent {
  brickName: string;
  importFile: HnImportTechnicalDocDTO;
}

export class HnIsActualBrickAndNewVersionDTO {
  brickId: string;
  inputBrickName: string;
  inputBrickVersion: string;
}

export interface HnImportParentDTO {
  typing_name: string;
  class_name: string;
  human_name: string;
  brick_version: string;
  object_type: string; //TODO: Mettre une enum ?
}

export interface HnImportTechnicalDocDTO {
  json_version: string;
  brick_name: string;
  brick_version: string;
  resources: HnImportResourceDTO[];
  tasks: HnImportTaskDTO[];
  protocols: HnImportProtocolDTO[];
  other_classes: HnImportTechDocOtherClassesDTO[];
}

export interface HnImportEntity {
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
  style: HnTypingStyle;
}

export interface HnTypingStyle {
  icon_technical_name: string;
  icon_type: string;
  background_color: string;
  icon_color: string;
}

export interface HnImportResourceDTO extends HnImportEntity{
  methods: HnResourceMethodList;
  variables?: Record<string, any>;
}

export interface HnImportTaskDTO extends HnImportEntity {
  input_specs: any;
  output_specs: any;
  config_specs: any;
  additional_info?: any;
}

export interface HnImportProtocolDTO extends HnImportEntity {
  input_specs: any;
  output_specs: any;
  config_specs: any;
  additional_info?: any;
}

export class HnEditBrickDTO {
  id: string;
  description: string;
  pipRepo: string;
  gitRepo: string;
  visibility: HnBrickVisibility;
  credentialUsername?: string;
  credentialPassword?: string;
  space?: HnSpace;
}

export class HnTechnicalDocInputDTO {
  brickName: string;
  brickVersion: string;
  techDocType: string;
  techDocUniqueName: string;
}

/**
 * DTO containing minimum information to download a brick version
 */
export class HnBrickVersionDownloadDTO {
  brickName: string;
  brickVersion: string;
  repoType: HnRepoType;
  repositoryUrl: string;
  repositoryAccessUrl: string;
}

export class HnCreateBrickDTO {
  name: string;
  description: string;
  repoType: HnRepoType;
  repoGit: string;
  repoPip: string;
  isBeta?: boolean;
  subPatch?: number;
  version: BlVersion;
  references?: HnReferenceDTO[];
  technicalInfo?: Record<string, any>;
  visibility: HnBrickVisibility;
  credentialUsername?: string;
  credentialPassword?: string;
  space?: HnSpace;
}

// Resource Methods
export interface HnResourceMethodList {
  funcs: HnTechDocFunction[];
  views: HnResourceView[];
}

export interface HnTechDocFunction {
  name: string;
  doc?: string;
  args: HnTechDocFunctionArg[];
  return_type?: string;
  method_type?: HnTechDocFunctionType;
}

export enum HnTechDocFunctionType {
  CLASSMETHOD = 'classmethod',
  STATICMETHOD = 'staticmethod'
}

export interface HnTechDocFunctionArg {
  arg_name: string;
  arg_type: string;
  arg_default_value?: string;
}

export interface HnResourceView{
  method_name: string;
  view_type: string;
  human_name: string;
  short_description: string;
  default_view: boolean;
  has_config_specs: boolean;
  config_specs: Record<string, any>;
}

export interface HnImportTechDocOtherClassesDTO{
  name: string;
  doc?: string;
  methods: HnTechDocFunction[];
  variables: Record<string, any>;
}
