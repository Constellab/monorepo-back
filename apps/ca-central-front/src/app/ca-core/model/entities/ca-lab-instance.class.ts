import {CaBaseEntity} from './ca-base-entity.class';
import {CaStatusHistory} from './ca-status-history.class';
import {CaServerInfo} from './ca-server-info.class';
import {CaUser} from './ca-user.class';
import {
  FlEntity,
  FlEntityPaginatedDatasource,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';

export type CaLabInstanceStatus = 'RUNNING' | 'STOPPED';

const caLabInstanceStatusDict: FlStatusDict<CaLabInstanceStatus> = {
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

  @Type(() => CaUser)
  owner: CaUser = null;

  @Type(() => CaLabInstanceStatusHistory)
  currentStatus: CaLabInstanceStatusHistory = null;

  // api url of the lab
  apiUrl: string;

  // front url of the lab
  frontUrl: string;

  virtualHost: string;

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

export type CaLabInstanceDatasource = FlEntityPaginatedDatasource<CaLabInstance>;

/**
 * Return by the lab instance login
 * Lab instance object with single use token to logon lab
 */
export class CaLabInstanceToken {

  @Type(() => CaLabInstance)
  labInstance: CaLabInstance;

  token: string = null;
}

export class CaLabInstanceUser implements FlEntity {
  id: string;

  email: string;
  group: 'ADMIN' | 'USER';

  @Expose({name: 'is_active'})
  isActive: boolean;

  @Expose({name: 'first_name'})
  firstname: string;

  @Expose({name: 'last_name'})
  lastname: string;
}

export class CaLabInstanceUserForm {
  user: CaUser;
  group: 'ADMIN' | 'USER';
}
