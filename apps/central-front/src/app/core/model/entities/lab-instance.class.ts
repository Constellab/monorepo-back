import {JsonObject, JsonProperty} from 'json2typescript';
import {BaseEntity} from './base-entity.class';
import {Lab} from './lab.class';
import {StatusHistory} from './status-history.class';
import {ServerInfo} from './server-info.class';
import {User} from './user.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

export enum LabInstanceStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED'
}

@JsonObject('LabInstanceStatusHistory')
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
@JsonObject('LabInstance')
export class LabInstance extends BaseEntity {

  @JsonProperty('lab', Lab)
  lab: Lab = null;

  @JsonProperty('owner', User, true)
  owner: User = null;

  @JsonProperty('currentStatus', LabInstanceStatusHistory)
  currentStatus: LabInstanceStatusHistory = null;

  @JsonProperty('ip', String)
  ip: string = null;

  // ip v6 of the server
  @JsonProperty('ipv6', String, true)
  ipv6: string = null;

  // ip v6 of the server
  @JsonProperty('url', String)
  url: string = null;

  @JsonProperty('serverInfo', ServerInfo)
  serverInfo: ServerInfo = null;

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
@JsonObject('LabInstanceToken')
export class LabInstanceToken {

  @JsonProperty('labInstance', LabInstance)
  labInstance: LabInstance = null;

  @JsonProperty('token', String)
  token: string = null;
}
