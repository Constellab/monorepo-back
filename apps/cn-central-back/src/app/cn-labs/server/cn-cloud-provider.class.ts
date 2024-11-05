import { CnOvhDomainRecord } from './ovh/cn-ovh.class';
import { CnLabBillingMode } from '../cn-lab.entity';
import { CnLabVolumeType } from '../volume/cn-lab-volume-entity';

export interface CnCpCreateInstanceRequest {
  name: string;
  region: string;
  serverName: string;
  billing: CnLabBillingMode;
}

export type CnCpInstanceStatus = 'CREATING' | 'RUNNING' | 'RESTARTING' | 'STOPPED' | 'STOPPING' | 'ERROR';

export interface CnCpInstanceStatusObject {
  status: CnCpInstanceStatus;
  message?: string;
}

export interface CnCpInstance {
  id: string;
  status: CnCpInstanceStatusObject;
  // complete object of the cloud provider
  originalObject: any;
  region: string;
  billing: CnLabBillingMode;
}

export type CnCpVolumeStatus = 'CREATING' | 'AVAILABLE' | 'IN_USE' | 'ATTACHING';

export interface CnCpCreateVolumeRequest {
  name: string;
  description?: string;
  region: string;
  size: number; // In GB
  type: CnLabVolumeType;
}

export interface CnCpVolume {
  id: string;
  status: CnCpVolumeStatus;
  region: string;
  size: number; // In GB
  type: CnLabVolumeType;
  // complete object of the cloud provider
  originalObject: any;
}

export interface CnCpCompleteInfo {
  instance: CnCpInstance;
  volume: CnCpVolume;
  domainRecord: CnOvhDomainRecord;
}

export const cnServerUbuntuUser = 'ubuntu';
export const cnServerSshAuthorizedKeyPath = `/home/${cnServerUbuntuUser}/.ssh/authorized_keys`;
