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
import {CaCity} from './ca-city.entity';
import {CaOrganization} from './ca-organization.class';
import {CaLabInstanceGroupRole} from './ca-lab-instance-group.class';

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

export class CaLabInstanceWithOrga extends CaLabInstance {
  @Type(() => CaOrganization)
  organization: CaOrganization;
}


export type CaLabInstanceDatasource = FlEntityPaginatedDatasource<CaLabInstance>;

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

  @Type(() => CaOrganization)
  organization: CaOrganization;
}

export class CaLabInstanceFindOneDto {
  @Type(() => CaLabInstance)
  labInstance: CaLabInstance;

  userRole: CaLabInstanceGroupRole;
}

/**
 * Object representing a user in the lab
 */
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

export interface CaLabInstanceUserForm {
  user: CaUser;
  group: 'ADMIN' | 'USER';
}
