export interface CnOvhCreateInstanceRequest {
  name: string;
  region: string;
  imageId: string;
  flavorId: string;
  sshKeyId: string;
  monthlyBilling?: boolean;
  autobackup: {
    cron: string;
    rotation: number; // number of backups to keep
  },
}

export type CnOvhInstanceStatus = 'ACTIVE' | 'BUILD' | 'HARD_REBOOT' | 'PASSWORD' | 'REBOOT' |
  'RESCUE' | 'RESIZE' | 'REVERT_RESIZE' | 'SHUTOFF' | 'SUSPENDED' | 'UNKNOWN' | 'VERIFY_RESIZE';

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
  status:CnOvhInstanceStatus;
  created: string;
  region: string;
  flavor: any;
  image: any;
  sshKey: any;

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
  status: 'creating' | 'in-use' | 'available' | 'reserved';
  region: string;
  size: number;
  type: 'classic' | 'high-speed' | 'high-speed-gen2';
  attachedTo: [string];
}

export interface CnOvhAttachVolumeRequest {
  instanceId: string;
}

export type CnDomainFieldType = 'A' | 'AAAA' | 'CAA' | 'CNAME' | 'DKIM' | 'LOC' | 'MX'
  | 'NAPTR' | 'NS' | 'PTR' | 'SPF' | 'SRV' | 'SSHFP' | 'TXT';

export interface CnOvhCreateDomainRecordRequest {
  fieldType: CnDomainFieldType;
  subDomain: string;
  target: string; // ip address if fieldType is A or AAAA
  ttl?: number;
}

export interface CnOvhCreateDomainRecordResponse {
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
