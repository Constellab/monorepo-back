export interface CnOvhCreateInstanceRequest {
  name: string;
  region: string;
  imageId: string;
  flavorId: string;
  sshKeyId: string;
  monthlyBilling?: boolean;
  autobackup?: {
    cron: string;
    rotation: number; // number of backups to keep
  };
}

export type CnOvhInstanceStatus =
  | 'ACTIVE'
  | 'BUILD'
  | 'BUILDING'
  | 'DELETED'
  | 'DELETING'
  | 'ERROR'
  | 'HARD_REBOOT'
  | 'MIGRATING'
  | 'PASSWORD'
  | 'PAUSED'
  | 'REBOOT'
  | 'REBUILD'
  | 'RESCUE'
  | 'RESCUED'
  | 'RESCUING'
  | 'RESIZE'
  | 'RESIZED'
  | 'RESUMING'
  | 'REVERT_RESIZE'
  | 'SHELVED'
  | 'SHELVED_OFFLOADED'
  | 'SHELVING'
  | 'SHUTOFF'
  | 'SNAPSHOTTING'
  | 'SOFT_DELETED'
  | 'STOPPED'
  | 'SUSPENDED'
  | 'UNKNOWN'
  | 'UNRESCUING'
  | 'UNSHELVING'
  | 'VERIFY_RESIZE';

export interface CnOvhInstance {
  id: string;
  name: string;
  ipAddresses: {
    ip: string;
    type: 'public' | 'private';
    version: 4 | 6;
    networkId: string;
    gatewayIp: string;
  }[];
  status: CnOvhInstanceStatus;
  created: string;
  region: string;
  flavor: any;
  image: any;
  sshKey: any;
  monthlyBilling?: boolean;
}

export interface CnOvhCreateVolumeRequest {
  region: string;
  size: number; // In GB
  type: 'classic' | 'high-speed' | 'high-speed-gen2';
  name: string;
  description: string;
  // imageId: string;
}

export interface CnOvhVolume {
  id: string;
  name: string;
  status: 'creating' | 'in-use' | 'available' | 'reserved' | 'building';
  region: string;
  size: number;
  type: 'classic' | 'high-speed' | 'high-speed-gen2';
  attachedTo: [string];
}

export interface CnOvhAttachVolumeRequest {
  instanceId: string;
}

export type CnDomainFieldType =
  | 'A'
  | 'AAAA'
  | 'CAA'
  | 'CNAME'
  | 'DKIM'
  | 'LOC'
  | 'MX'
  | 'NAPTR'
  | 'NS'
  | 'PTR'
  | 'SPF'
  | 'SRV'
  | 'SSHFP'
  | 'TXT';

export interface CnOvhCreateDomainRecordRequest {
  fieldType: CnDomainFieldType;
  subDomain: string;
  target: string; // ip address if fieldType is A or AAAA
  ttl?: number;
}

export interface CnOvhDomainRecord {
  id: string;
  zone: string;
  subDomain: string;
  target: string;
  fieldType: CnDomainFieldType;
  ttl: number;
}

export interface CnOvhFlavor {
  id: string;
  name: string;
  vcpus: number;
  ram: number;
  disk: number;
  region: string;
  available: boolean;
  osType: 'linux' | 'windows';
}

export interface CnOvhImage {
  id: string;
  name: string;
  region: string;
  visibility: 'public' | 'private';
  type: 'linux' | 'windows';
  status: 'active' | 'saving' | 'queued' | 'killed';
  user: 'ubuntu';
}
