import {CnOvhDomainRecord} from './ovh/cn-ovh.class';
import {CnLabInstanceBillingMode, CnLabInstanceVolumeType} from '../cn-lab-instance.entity';

export type CnCpBackupFrequency = 'DAILY';

export interface CnCpCreateInstanceRequest {
  name: string;
  region: string;
  serverName: string;
  billing: CnLabInstanceBillingMode;
  backupRotation: number;
  backupFrequency: CnCpBackupFrequency;
}

export type CnCpInstanceStatus = 'CREATING' | 'RUNNING' | 'RESTARTING' | 'STOPPED' | 'STOPPING';

export interface CnCpInstance {
  id: string;
  name: string;
  status: CnCpInstanceStatus;
  ipv4?: string;
  // complete object of the cloud provider
  originalObject: any;
  region: string;
  billing: CnLabInstanceBillingMode;
}

export type CnCpVolumeStatus = 'CREATING' | 'AVAILABLE' | 'IN_USE' | 'ATTACHING';

export interface CnCpCreateVolumeRequest {
  name: string;
  description?: string;
  region: string;
  size: number; // In GB
  type: CnLabInstanceVolumeType;
}

export interface CnCpVolume {
  id: string;
  name: string;
  status: CnCpVolumeStatus;
  region: string;
  size: number; // In GB
  type: CnLabInstanceVolumeType;
  attachedTo: string;
  // complete object of the cloud provider
  originalObject: any;
}

export interface CnCpCompleteInfo {
  instance: CnCpInstance;
  volume: CnCpVolume;
  domainRecord: CnOvhDomainRecord;
}
