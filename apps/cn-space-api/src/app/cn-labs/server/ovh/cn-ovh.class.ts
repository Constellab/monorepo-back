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

/**
 * The OVH zone holding the records of a domain, and where that domain sits in it.
 * For the domain 'lab.constellab.acme.com' in the zone 'acme.com', the record '*.abc'
 * is written as '*.abc.lab.constellab'.
 */
export class CnOvhDomainZone {
  constructor(
    readonly zone: string,
    // part of the domain under the zone, '' when the domain is the zone itself
    readonly domainPrefix: string
  ) {}

  getRecordName(name: string): string {
    return this.domainPrefix ? `${name}.${this.domainPrefix}` : name;
  }

  /** The most specific zone the domain belongs to, null if none */
  static find(zones: string[], domain: string): CnOvhDomainZone | null {
    const normalizedDomain = domain.toLowerCase().replace(/\.$/, '');

    let best: string | null = null;
    for (const zone of zones) {
      const normalizedZone = zone.toLowerCase();
      const matches = normalizedDomain === normalizedZone || normalizedDomain.endsWith(`.${normalizedZone}`);
      if (matches && (best == null || normalizedZone.length > best.length)) {
        best = normalizedZone;
      }
    }

    if (best == null) {
      return null;
    }

    const prefix = normalizedDomain.slice(0, normalizedDomain.length - best.length).replace(/\.$/, '');
    return new CnOvhDomainZone(best, prefix);
  }
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
