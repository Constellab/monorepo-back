import {BaseEntity} from './base-entity.class';
import {Lab} from './lab.class';
import {StatusHistory} from './status-history.class';
import {ServerInfo} from './server-info.class';
import {User} from './user.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';
import {Type} from 'class-transformer';

export enum LabInstanceStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED'
}

export class LabInstanceStatusHistory extends StatusHistory<LabInstanceStatus> {
  getStatusClassColor(mode: 'background' | 'text'): string {
    return getLabInstanceStatusColorClass(this.status, mode);
  }

  getStatusIcon(): string {
    return getLabInstanceStatusIcon(this.status);
  }
}

/**
 * A lab instance is a running lab
 */
export class LabInstance extends BaseEntity {

  @Type(() => Lab)
  lab: Lab = null;

  @Type(() => User)
  owner: User = null;

  @Type(() => LabInstanceStatusHistory)
  currentStatus: LabInstanceStatusHistory = null;

  ip: string;

  // ip v6 of the server
  ipv6: string;

  // ip v6 of the server
  url: string;

  @Type(() => ServerInfo)
  serverInfo: ServerInfo;

  public isRunning(): boolean {
    return this.currentStatus.status === 'RUNNING';
  }
}

export type LabInstanceDatasource = FlEntityPaginatedDatasource<LabInstance>;


export function getLabInstanceStatusColorClass(status: LabInstanceStatus,
                                               mode: 'background' | 'text' = 'background'): string {
  switch (status) {
    case 'RUNNING':
      return mode === 'background' ? 'g-primary-background' : 'g-primary-text';
    case 'STOPPED':
      return mode === 'background' ? 'g-grey-background' : 'g-grey-text';
    default:
      return '';
  }
}

export function getLabInstanceStatusIcon(status: LabInstanceStatus): string {
  switch (status) {
    case 'RUNNING':
      return 'play_arrow';
    case 'STOPPED':
      return 'stop';
    default:
      return '';
  }
}

/**
 * Return by the lab instance login
 * Lab instance object with single use token to logon lab
 */
export class LabInstanceToken {

  @Type(() => LabInstance)
  labInstance: LabInstance;

  token: string = null;
}
