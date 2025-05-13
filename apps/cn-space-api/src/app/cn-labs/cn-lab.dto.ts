import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnServerCloud } from '../cn-servers-info/server-cloud/cn-server-cloud.entity';
import { BlBaseEntityDto, BlTrim, BlVersion } from '@monorepo/back-core-lib';
import { CnBrickVersionDTO } from '../cn-bricks/cn-brick.dto';
import { CnLabConfigDto } from '../cn-lab-configs/cn-lab-config.dto';
import { CnSpace, CnSpaceEntity } from '../cn-spaces/cn-space.entity';
import { Type } from 'class-transformer';
import { CnLabUserRole } from './user/cn-lab-user.entity';
import { CnLab, CnLabBillingMode, CnLabDesktopPlatform, CnLabFull, CnLabType } from './cn-lab.entity';
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
  name: string;
  type: CnLabType;
  currentStatus: CnLabStatusHistory;
  frontUrl: string;
  virtualHost: string;
  region: CnCloudProviderRegion;
  billingMode: CnLabBillingMode;
  desktopPlatform?: CnLabDesktopPlatform;
  isFreeLab: boolean;

  constructor(entity: CnLab) {
    super(entity);
    this.name = entity.name;
    this.type = entity.type;
    this.currentStatus = entity.currentStatus;
    this.frontUrl = entity.frontUrl;
    this.virtualHost = entity.virtualHost;
    this.region = entity.region;
    this.billingMode = entity.billingMode;
    this.desktopPlatform = entity.desktopPlatform;
    this.isFreeLab = entity.isFreeLab;
  }
}

export class CnLabWithSpaceDto extends CnLabDto {
  space: CnSpace;
  serverCloud: CnServerCloud;

  constructor(entity: CnLabFull) {
    super(entity);
    this.space = entity.space;
    this.serverCloud = entity.serverCloud;
  }
}

/**
 * DTO for the lab only for G admin
 */
export class CnLabAdminDto extends CnLabWithSpaceDto {
  cloudName: string;
  glabProdApiKey: string;
  glabDevApiKey: string;
  labManagerApiKey: string;
  serverInstanceId: string;
  serverVolumeId: string;
  serverIpAddressId: string;
  gwsCoreProdDbPassword: string;
  gwsCoreDevDbPassword: string;
  codelabToken: string;

  constructor(entity: CnLabFull) {
    super(entity);
    this.cloudName = entity.cloudName;
    this.glabProdApiKey = entity.glabProdApiKey;
    this.glabDevApiKey = entity.glabDevApiKey;
    this.labManagerApiKey = entity.labManagerApiKey;
    this.serverInstanceId = entity.serverInstanceId;
    this.serverVolumeId = entity.serverVolumeId;
    this.serverIpAddressId = entity.serverIpAddressId;
    this.gwsCoreProdDbPassword = entity.gwsCoreProdDbPassword;
    this.gwsCoreDevDbPassword = entity.gwsCoreDevDbPassword;
    this.codelabToken = entity.codelabToken;
  }
}

export class CnLabFindOneDto {
  lab: CnLabDto;

  userRole: CnLabUserRole;

  constructor(lab: CnLab, userRole: CnLabUserRole) {
    this.lab = new CnLabDto(lab);
    this.userRole = userRole;
  }
}

export class CnLabCodelabDTO {
  username: string;
  token: string;
  url: string;
}

export interface CnLabConfigDTO {
  brickVersions: CnBrickVersionDTO[];
}

export interface CnLabStartDTO {
  lab_config: CnLabConfigDto;
}

export class CnLabUpdateAdminDTO {
  id: string;
  @BlTrim()
  name: string;
  type: CnLabType;
  @BlTrim()
  virtualHost: string;
  billingMode: CnLabBillingMode;

  @Type(() => CnServerCloud)
  serverCloud: CnServerCloud;

  @BlTrim()
  glabProdApiKey: string;
  @BlTrim()
  glabDevApiKey: string;
  @BlTrim()
  labManagerApiKey: string;
  @BlTrim()
  codelabToken: string;

  @Type(() => CnCloudProviderRegion)
  region: CnCloudProviderRegion;

  @Type(() => CnSpaceEntity)
  space: CnSpace;

  @BlTrim()
  serverInstanceId: string;
  @BlTrim()
  serverVolumeId: string;
  @BlTrim()
  serverIpAddressId: string;
  desktopPlatform?: CnLabDesktopPlatform;
}

export class CnLabCreateAdminDTO extends CnLabUpdateAdminDTO {
  volumeSize: number;
  volumeType: CnLabVolumeType;

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
  type: CnLabType;
  labNeed?: string;
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

export interface CnStopLabRequestDTO {
  backupLabBefore: boolean;
}

export interface CnLabMinimumDTO {
  id: string;
  name: string;
  isFreeLab: boolean;
  type: CnLabType;
}
