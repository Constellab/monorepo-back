import {CaBaseEntity} from '../ca-base-entity.class';
import {CaStatusHistory} from '../ca-status-history.class';
import {CaServerInfo} from '../ca-server-info.class';
import {CaUser} from '../ca-user.class';
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


  // only provided when getting lab as admin
  glabApiKey?: string;
  labManagerApiKey?: string;
  codelabToken?: string;
  serverInstanceId?: string;
  serverVolumeId?: string;

  public isRunning(): boolean {
    return this.currentStatus.status.value === 'RUNNING';
  }

  get adminerUrl(): string {
    return `https://adminer.${this.virtualHost}`;
  }
}

export class CaLabInstanceWithSpace extends CaLabInstance {
  @Type(() => CaSpace)
  space: CaSpace;
}


export type CaLabInstanceDatasource = FlEntityPaginatedDatasource<CaLabInstance>;
export type CaLabInstanceWithSpaceDatasource = FlEntityPaginatedDatasource<CaLabInstanceWithSpace>;

export class CaLabInstanceForm {
  id: string;
  name: string;
  virtualHost: string;

  @Type(() => CaServerInfo)
  serverInfo: CaServerInfo;

  @Type(() => CaUser)
  owner?: CaUser;

  glabApiKey: string;
  labManagerApiKey: string;
  codelabToken: string;
  serverInstanceId: string;
  serverVolumeId: string;

  @Type(() => CaCloudProviderRegion)
  region: CaCloudProviderRegion;


  @Type(() => CaSpace)
  space: CaSpace;
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
