import { CnLabBillingMode } from '../cn-lab.entity';
import { CnLabVolumeType } from '../volume/cn-lab-volume-entity';
import { CnOvhDomainRecord } from './ovh/cn-ovh.class';

export interface CnCpCreateInstanceRequest {
  name: string;
  region: string;
  serverName: string;
  billing: CnLabBillingMode;
  ipAddress?: CnCpStaticIpAddress;
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

export type CnCpVolumeStatus = 'CREATING' | 'AVAILABLE' | 'IN_USE' | 'ATTACHING' | 'DELETING';

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

export interface CnCpInstanceWithVolume {
  instance: CnCpInstance;
  volume: CnCpVolume;
}

export interface CnCpCompleteInfo {
  instance: CnCpInstance | null;
  volume: CnCpVolume | null;
  ipAddress: CnCpStaticIpAddress | null;
  domainRecord: CnOvhDomainRecord | null;
}

export const CN_SERVER_UBUNTU_USER = 'ubuntu';
export const CN_SERVERS_SSH_AUTHORIZED_KEY_PATH = `/home/${CN_SERVER_UBUNTU_USER}/.ssh/authorized_keys`;

export interface CnCpStaticIpAddress {
  id: string;
  ipAddress: string;
  region: string;
  // complete object of the cloud provider
  originalObject: any;
}
