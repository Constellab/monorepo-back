import {CnUser} from '../cn-users/cn-user.entity';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnServerInfo} from '../cn-servers-info/cn-server-info.entity';
import {BlBaseEntityDto, BlDtoHelper} from '@monorepo/back-core-lib';
import {CnBrickVersionDTO} from '../cn-bricks/cn-brick.dto';
import {CnLabConfigDto} from '../cn-lab-configs/cn-lab-config.dto';
import {CnSpace} from '../cn-spaces/cn-space.entity';
import {Type} from 'class-transformer';
import {CnLabInstanceUserRole} from './user/cn-lab-instance-user.entity';
import {
  CnLabInstance,
  CnLabInstanceBillingMode,
  CnLabInstanceType,
  CnLabInstanceVolumeType,
  CnLabDesktopPlatform
} from './cn-lab-instance.entity';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnLabInstanceServerTaskStatus, CnLabInstanceStatus} from './status/cn-lab-instance-status.enum';
import {DateTime} from 'luxon';
import {ClLuxonDateTimeTransform, ClLuxonDateTransform} from '@monorepo/core-lib';


/**
 * DTO for the users that have access to a lab instance
 */
export class CnLabInstanceDto extends BlBaseEntityDto {
  name: string = undefined;
  type: CnLabInstanceType = undefined;
  lab: CnLabConfig = undefined;
  owner: CnUser = undefined;
  currentStatus: CnLabInstanceStatusHistory = undefined;
  virtualHost: string = undefined;
  apiUrl: string = undefined;
  codelabToken: string = undefined;
  frontUrl: string = undefined;
  serverInfo: CnServerInfo = undefined;
  region: CnCloudProviderRegion = undefined;
  space: CnSpace = undefined;
  billingMode: CnLabInstanceBillingMode = undefined;
  volumeType: CnLabInstanceVolumeType = undefined;
  volumeSize: number = undefined;
  desktopPlatform?: CnLabDesktopPlatform = undefined;
}

/**
 * DTO for the lab instance only for G admin
 */
export class CnLabInstanceAdminDto extends CnLabInstanceDto {
  glabApiKey: string = undefined;
  labManagerApiKey: string = undefined;
  serverInstanceId: string = undefined;
  serverVolumeId: string = undefined;
  gwsCoreProdDbPassword: string = undefined;
  gwsCoreDevDbPassword: string = undefined;
}

export class CnLabFindOneDto {
  @Type(() => CnLabInstanceDto)
  labInstance: CnLabInstanceDto = undefined;

  userRole: CnLabInstanceUserRole;

  labManagerIsRunning: boolean;
  labIsRunning: boolean;

  static create(labInstance: CnLabInstance, userRole: CnLabInstanceUserRole): CnLabFindOneDto {
    const dto = new CnLabFindOneDto();
    dto.labInstance = BlDtoHelper.toDto(CnLabInstanceDto, labInstance);
    dto.userRole = userRole;
    return dto;
  }
}

export type CnGlabTag = 'latest' | 'beta' | string;

export interface CnLabInstanceConfigDTO {
  brickVersions: CnBrickVersionDTO[];
  glabTag: CnGlabTag | null;
}


export interface CnLabInstanceStartDTO {
  lab_config: CnLabConfigDto;
}

export class CnLabInstanceCreateAdminDTO {
  id: string;
  name: string;
  type: CnLabInstanceType;
  virtualHost: string;

  @Type(() => CnServerInfo)
  serverInfo: CnServerInfo;

  glabApiKey: string;
  labManagerApiKey: string;
  codelabToken: string;

  @Type(() => CnCloudProviderRegion)
  region: CnCloudProviderRegion;

  @Type(() => CnSpace)
  space: CnSpace;

  serverInstanceId: string;
  serverVolumeId: string;
  desktopPlatform?: CnLabDesktopPlatform;
}

export class CnLabInstanceCreateDesktopDTO {
  id: string;
  name: string;
  desktopPlatform: CnLabDesktopPlatform;
}

export class CnLabInstanceDesktopConfig {
  glabTag: CnGlabTag;
}

export class CnLabInstanceStatusDTO {
  labStatus: CnLabInstanceStatus;
  labManagerIsRunning: boolean;
  labIsRunning: boolean;
  hasServerInstanceId: boolean;
  hasServerVolumeId: boolean;
  serverTaskText: string;
  serverTaskStatus: CnLabInstanceServerTaskStatus;

  @ClLuxonDateTimeTransform()
  serverTaskDatetime: DateTime;
}

/**
 * Object used when a user wants to create a lab instance
 * He provides free text
 */
export interface CnRequestLabInstance {
  cloudProvider?: string;
  cpuCount?: string;
  storageSize?: string;
  labNeed?: string;
  additionalInfo?: string;
}

