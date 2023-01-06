import {CnOvhDomainRecord} from './ovh/cn-ovh.class';

export type CnCpBillingType = 'HOURLY' | 'MONTHLY';
export type CnCpBackupFrequency = 'DAILY';

export interface CnCpCreateInstanceRequest {
  name: string;
  region: string;
  serverName: string;
  billing: CnCpBillingType;
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
  billing: CnCpBillingType;
}

export type CnCpVolumeStatus = 'CREATING' | 'AVAILABLE' | 'IN_USE' | 'ATTACHING';
export type CnCpVolumeType = 'CLASSIC' | 'HIGH_SPEED';

export interface CnCpCreateVolumeRequest {
  name: string;
  description?: string;
  region: string;
  size: number; // In GB
  type: CnCpVolumeType;
}

export interface CnCpVolume {
  id: string;
  name: string;
  status: CnCpVolumeStatus;
  region: string;
  size: number; // In GB
  type: CnCpVolumeType;
  attachedTo: string;
  // complete object of the cloud provider
  originalObject: any;
}

export interface CnCpCompleteInfo {
  instance: CnCpInstance;
  volume: CnCpVolume;
  domainRecord: CnOvhDomainRecord;
}
