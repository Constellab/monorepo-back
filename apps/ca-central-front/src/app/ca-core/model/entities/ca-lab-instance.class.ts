import {CaBaseEntity} from './ca-base-entity.class';
import {CaStatusHistory} from './ca-status-history.class';
import {CaServerInfo} from './ca-server-info.class';
import {CaUser} from './ca-user.class';
import {
  FlEntityPaginatedDatasource,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';
import {CaCity} from './ca-city.entity';
import {CaSpace} from './space/ca-space.class';
import {CaLabInstanceUserRole} from './ca-lab-instance-user.class';

export type CaLabInstanceStatus = 'RUNNING' | 'STOPPED';

export const caLabInstanceStatusDict: FlStatusDict<CaLabInstanceStatus> = {
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  STOPPED: FlStatusHelper.getStoppedStatus('STOPPED')
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

  @Type(() => CaCity)
  city: CaCity;

  @Type(() => CaServerInfo)
  serverInfo: CaServerInfo;


  // only provided when getting lab as admin
  glabApiKey?: string;
  labManagerApiKey?: string;
  codelabToken?: string;


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

  @Type(() => CaCity)
  city: CaCity;

  @Type(() => CaSpace)
  space: CaSpace;
}

export class CaLabInstanceFindOneDto {
  @Type(() => CaLabInstance)
  labInstance: CaLabInstance;

  userRole: CaLabInstanceUserRole;
}

