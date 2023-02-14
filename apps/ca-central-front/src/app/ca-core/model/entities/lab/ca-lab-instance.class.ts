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

export type CaLabInstanceStatus = 'RUNNING' | 'STOPPED' | 'STARTING' | 'STOPPING';
export type CaLabInstanceBillingMode = 'HOURLY' | 'MONTHLY';
export type CaLabInstanceVolumeType = 'CLASSIC' | 'HIGH_SPEED';
export type CaLabInstanceType = 'CLOUD' | 'ON_PREMISE';
export type CaLabOnPromisePlatform = 'WINDOWS' | 'LINUX' | 'MAC';

export const caLabInstanceStatusDict: FlStatusDict<CaLabInstanceStatus> = {
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  STOPPED: FlStatusHelper.getStoppedStatus('STOPPED'),
  STARTING: FlStatusHelper.getWarningStatus('STARTING', 'lab_starting'),
  STOPPING: FlStatusHelper.getWarningStatus('STOPPING', 'lab_stopping'),
};

export class CaLabInstanceStatusHistory extends CaStatusHistory<CaLabInstanceStatus> {

  @FlStatusTransform(caLabInstanceStatusDict)
  status: FlStatus<CaLabInstanceStatus>;
}

/**
 * A lab instance is a running lab
 */
export class CaLabInstance extends CaBaseEntity {

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
    return this.currentStatus.status.value === 'RUNNING';
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

export class CaLabInstanceForm {
  id: string;
  name: string;
  type: CaLabInstanceType;
  virtualHost: string;

  @Type(() => CaServerInfo)
  serverInfo: CaServerInfo;

  billingMode: CaLabInstanceBillingMode;
  volumeSize: number;
  volumeType: CaLabInstanceVolumeType;

  glabApiKey: string;
  labManagerApiKey: string;
  codelabToken: string;
  serverInstanceId: string;
  serverVolumeId: string;
  gwsCoreProdDbPassword: string;
  gwsCoreDevDbPassword: string;

  @Type(() => CaCloudProviderRegion)
  region: CaCloudProviderRegion;


  @Type(() => CaSpace)
  space: CaSpace;
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
