import { CnUser } from '../cn-users/cn-user.entity';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnServerCloud } from '../cn-servers-info/server-cloud/cn-server-cloud.entity';
import { BlBaseEntityDto, BlDtoHelper, BlVersion } from '@monorepo/back-core-lib';
import { CnBrickVersionDTO } from '../cn-bricks/cn-brick.dto';
import { CnLabConfigDto } from '../cn-lab-configs/cn-lab-config.dto';
import { CnSpace } from '../cn-spaces/cn-space.entity';
import { Type } from 'class-transformer';
import { CnLabUserRole } from './user/cn-lab-user.entity';
import { CnLab, CnLabBillingMode, CnLabDesktopPlatform, CnLabType } from './cn-lab.entity';
import { CnCloudProviderRegion } from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import { CnLabServerTaskStatus, CnLabStatus } from './status/cn-lab-status.enum';
import { DateTime } from 'luxon';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';
import { CnCloudProvider } from '../cn-cloud-providers/cn-cloud-provider.entity';
import { CnExternalApiInfo } from '../cn-core/model/config/cn-config.class';
import { CnLabVolumeType } from './volume/cn-lab-volume-entity';

/**
 * DTO for the users that have access to a lab
 */
export class CnLabDto extends BlBaseEntityDto {
  name: string = undefined;
  type: CnLabType = undefined;
  lab: CnLabConfig = undefined;
  owner: CnUser = undefined;
  currentStatus: CnLabStatusHistory = undefined;
  virtualHost: string = undefined;
  apiUrl: string = undefined;
  frontUrl: string = undefined;
  region: CnCloudProviderRegion = undefined;
  billingMode: CnLabBillingMode = undefined;
  volumeType: CnLabVolumeType = undefined;
  volumeSize: number = undefined;
  desktopPlatform?: CnLabDesktopPlatform = undefined;
  isFreeLab: boolean = undefined;
}

export class CnLabWithSpaceDto extends CnLabDto {
  space: CnSpace = undefined;
  serverCloud: CnServerCloud = undefined;
}

/**
 * DTO for the lab only for G admin
 */
export class CnLabAdminDto extends CnLabWithSpaceDto {
  cloudName: string = undefined;
  glabApiKey: string = undefined;
  labManagerApiKey: string = undefined;
  serverInstanceId: string = undefined;
  serverVolumeId: string = undefined;
  gwsCoreProdDbPassword: string = undefined;
  gwsCoreDevDbPassword: string = undefined;
  codelabToken: string = undefined;
}

export class CnLabFindOneDto {
  @Type(() => CnLabDto)
  lab: CnLabDto = undefined;

  userRole: CnLabUserRole;

  labManagerIsRunning: boolean;
  labIsRunning: boolean;

  static create(lab: CnLab, userRole: CnLabUserRole): CnLabFindOneDto {
    const dto = new CnLabFindOneDto();
    dto.lab = BlDtoHelper.toDto(CnLabDto, lab);
    dto.userRole = userRole;
    return dto;
  }
}

export class CnLabCodelabDTO {
  username: string;
  token: string;
  url: string;
}

export type CnGlabTag = 'latest' | 'beta' | string;

export interface CnLabConfigDTO {
  brickVersions: CnBrickVersionDTO[];
  glabTag: CnGlabTag | null;
}

export interface CnLabStartDTO {
  lab_config: CnLabConfigDto;
}

export class CnLabUpdateAdminDTO {
  id: string;
  name: string;
  type: CnLabType;
  virtualHost: string;

  @Type(() => CnServerCloud)
  serverCloud: CnServerCloud;

  glabApiKey: string;
  labManagerApiKey: string;
  codelabToken: string;

  @Type(() => CnCloudProviderRegion)
  region: CnCloudProviderRegion;

  @Type(() => CnSpace)
  space: CnSpace;

  volumeSize: number;
  volumeType: CnLabVolumeType;

  serverInstanceId: string;
  serverVolumeId: string;
  desktopPlatform?: CnLabDesktopPlatform;
}

export class CnLabCreateAdminDTO extends CnLabUpdateAdminDTO {
  @Type(() => CnCloudProviderRegion)
  dailyBackupRegion: CnCloudProviderRegion;

  @Type(() => CnCloudProviderRegion)
  weeklyBackupRegion: CnCloudProviderRegion;
}

export class CnLabCloudCreateDTO {
  name: string;

  @Type(() => CnServerCloud)
  serverCloud: CnServerCloud;

  @Type(() => CnCloudProviderRegion)
  region: CnCloudProviderRegion;

  volumeSize: number;

  @Type(() => CnCloudProviderRegion)
  dailyBackupRegion: CnCloudProviderRegion;

  @Type(() => CnCloudProviderRegion)
  weeklyBackupRegion: CnCloudProviderRegion;

  labConfig: CnLabConfigDTO;
}

export class CnLabCreateDesktopDTO {
  id: string;
  name: string;
  desktopPlatform: CnLabDesktopPlatform;
}

export class CnLabDesktopConfig {
  glabTag: CnGlabTag;
}

export class CnLabStatusDTO {
  labStatus: CnLabStatus;
  labManagerIsRunning: boolean;
  labIsRunning: boolean;
  hasServerInstanceId: boolean;
  hasServerVolumeId: boolean;
  dnsConfigured: boolean;
  serverTaskText: string;
  serverTaskStatus: CnLabServerTaskStatus;

  @ClLuxonDateTimeTransform()
  serverTaskDatetime: DateTime;
}

/**
 * Object used when a user wants to create a lab
 * He provides free text
 */
export interface CnRequestLab {
  cloudProvider?: string;
  cpuCount?: string;
  storageSize?: string;
  labNeed?: string;
  additionalInfo?: string;
}

export class CnLabServerInfoDTO {
  name: string;

  @Type(() => CnCloudProvider)
  cloudProvider: CnCloudProvider;

  cpuType: string;
  cpuCount: number;

  ram: number;

  gpuType: string;
  gpuCount: number;

  volumeSize: number;
  volumeType: CnLabVolumeType;
}

export class CnLabGlabApiInfo {
  gwsCoreVersion?: BlVersion;
  apiInfo: CnExternalApiInfo;
}
