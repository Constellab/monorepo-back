import {CaBaseEntity} from '../ca-base-entity.class';
import {CaStatusHistory} from '../ca-status-history.class';
import {CaServerInfo} from '../ca-server-info.class';
import {
  FlEntityPaginatedDatasource,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaSpace} from '../space/ca-space.class';
import {CaLabInstanceUserRole} from './ca-lab-instance-user.class';
import {CaCloudProviderRegion} from '../ca-cloud-provider.class';

export type CaLabInstanceStatus = 'LAB_RUNNING' | 'SERVER_STOPPED' | 'SERVER_STARTING' | 'SERVER_STOPPING' | 'SERVER_RUNNING';
export type CaLabInstanceBillingMode = 'HOURLY' | 'MONTHLY';
export type CaLabInstanceVolumeType = 'CLASSIC' | 'HIGH_SPEED';
export type CaLabInstanceType = 'CLOUD' | 'ON_PREMISE';
export type CaLabOnPromisePlatform = 'WINDOWS' | 'LINUX' | 'MAC';

export const caLabInstanceStatusDict: FlStatusDict<CaLabInstanceStatus> = {
  LAB_RUNNING: FlStatusHelper.getRunningStatus('LAB_RUNNING'),
  SERVER_STOPPED: FlStatusHelper.getStoppedStatus('SERVER_STOPPED'),
  SERVER_STARTING: FlStatusHelper.getWarningStatus('SERVER_STARTING', 'lab_starting'),
  SERVER_STOPPING: FlStatusHelper.getWarningStatus('SERVER_STOPPING', 'lab_stopping'),
  SERVER_RUNNING: FlStatusHelper.getWarningStatus('SERVER_RUNNING', 'lab_server_running'),
};

export class CaLabInstanceStatusHistory extends CaStatusHistory<CaLabInstanceStatus> {

  @FlStatusTransform(caLabInstanceStatusDict)
  status: FlStatus<CaLabInstanceStatus>;
}

/**
 * A lab instance is a running lab
 */
export class CaLabInstance extends CaBaseEntity {

  static MAX_NAME_LENGTH = 50;

  name: string;

  type: CaLabInstanceType;

  @Type(() => CaLabInstanceStatusHistory)
  currentStatus: CaLabInstanceStatusHistory = null;

  // api url of the lab
  apiUrl: string;

  // front url of the lab
  frontUrl: string;

  virtualHost: string;

  @Type(() => CaCloudProviderRegion)
  region: CaCloudProviderRegion;

  @Type(() => CaServerInfo)
  serverInfo: CaServerInfo;

  billingMode: CaLabInstanceBillingMode;
  volumeSize: number;
  volumeType: CaLabInstanceVolumeType;

  // only provided when getting lab as admin
  glabApiKey?: string;
  labManagerApiKey?: string;
  codelabToken?: string;
  serverInstanceId?: string;
  serverVolumeId?: string;
  gwsCoreProdDbPassword?: string;
  gwsCoreDevDbPassword?: string;
  onPremisePlatform?: CaLabOnPromisePlatform;

  public isRunning(): boolean {
    return this.currentStatus.status.value === 'LAB_RUNNING';
  }

  get adminerUrl(): string {
    return `https://adminer.${this.virtualHost}`;
  }

  get isCloud(): boolean {
    return this.type === 'CLOUD';
  }

  get isOnPremise(): boolean {
    return this.type === 'ON_PREMISE';
  }

  get typeIcon(): string {
    return this.isCloud ? 'cloud' : 'computer';
  }
}

export class CaLabInstanceWithSpace extends CaLabInstance {
  @Type(() => CaSpace)
  space: CaSpace;
}


export type CaLabInstanceDatasource = FlEntityPaginatedDatasource<CaLabInstance>;

export class CaLabInstanceAdminForm {
  id: string;
  name: string;
  type: CaLabInstanceType;
  virtualHost?: string;

  @Type(() => CaServerInfo)
  serverInfo?: CaServerInfo;

  billingMode?: CaLabInstanceBillingMode;
  volumeSize?: number;
  volumeType?: CaLabInstanceVolumeType;

  glabApiKey?: string;
  labManagerApiKey?: string;
  codelabToken?: string;
  serverInstanceId?: string;
  serverVolumeId?: string;
  gwsCoreProdDbPassword?: string;
  gwsCoreDevDbPassword?: string;

  @Type(() => CaCloudProviderRegion)
  region?: CaCloudProviderRegion;


  @Type(() => CaSpace)
  space?: CaSpace;
  onPremisePlatform?: CaLabOnPromisePlatform;
}

export class CaLabInstanceOnPremiseForm {
  id: string;
  name: string;
  onPremisePlatform: CaLabOnPromisePlatform;
}


export class CaLabInstanceFindOneDto {
  @Type(() => CaLabInstance)
  labInstance: CaLabInstance;

  userRole: CaLabInstanceUserRole;
}

export class CaLabInstanceStatusDTO {
  @FlStatusTransform(caLabInstanceStatusDict)
  labStatus: FlStatus<CaLabInstanceStatus>;
  labManagerIsRunning: boolean;

  labIsRunning: boolean;

  hasServerInstanceId: boolean;
  hasServerVolumeId: boolean;
  serverProgressText: string;
}

/**
 * Object used when a user wants to create a lab instance
 * He provides free text
 */
export interface CaRequestLabInstance {
  cloudProvider?: string;
  cpuCount?: string;
  storageSize?: string;
  labNeed?: string;
  additionalInfo?: string;
}

export interface CaLabInstanceOnPremiseConfig {
  glabTag: 'beta' | 'latest' | string;
}
