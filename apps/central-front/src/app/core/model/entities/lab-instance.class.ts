import {BaseEntity} from './base-entity.class';
import {Lab} from './lab.class';
import {StatusHistory} from './status-history.class';
import {ServerInfo} from './server-info.class';
import {User} from './user.class';
import {
  FlEntity,
  FlEntityPaginatedDatasource,
  FlStatus,
  FlStatusDict,
  FlStatusHelper,
  FlStatusTransform
} from '@monorepo/front-core-lib';
import {Expose, Type} from 'class-transformer';

export type LabInstanceStatus = 'RUNNING' | 'STOPPED';

const labInstanceStatusDict: FlStatusDict<LabInstanceStatus> = {
  RUNNING: FlStatusHelper.getRunningStatus('RUNNING'),
  STOPPED: FlStatusHelper.getStoppedStatus('STOPPED')
};

export class LabInstanceStatusHistory extends StatusHistory<LabInstanceStatus> {

  @FlStatusTransform(labInstanceStatusDict)
  status: FlStatus<LabInstanceStatus>;
}

/**
 * A lab instance is a running lab
 */
export class LabInstance extends BaseEntity {

  name: string;

  @Type(() => Lab)
  lab: Lab = null;

  @Type(() => User)
  owner: User = null;

  @Type(() => LabInstanceStatusHistory)
  currentStatus: LabInstanceStatusHistory = null;

  // api url of the lab
  apiUrl: string;

  // front url of the lab
  frontUrl: string;

  @Type(() => ServerInfo)
  serverInfo: ServerInfo;

  apiKey?: string; // only provided when getting lab as admin

  public isRunning(): boolean {
    return this.currentStatus.status.value === 'RUNNING';
  }
}

export type LabInstanceDatasource = FlEntityPaginatedDatasource<LabInstance>;

/**
 * Return by the lab instance login
 * Lab instance object with single use token to logon lab
 */
export class LabInstanceToken {

  @Type(() => LabInstance)
  labInstance: LabInstance;

  token: string = null;
}

export class LabInstanceUser implements FlEntity {
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

export class LabInstanceUserForm {
  user: User;
  group: 'ADMIN' | 'USER';
}
