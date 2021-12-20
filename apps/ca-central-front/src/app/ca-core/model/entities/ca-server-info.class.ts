import {CaEntity} from './ca-entity.entity';

/**
 * Host for the server like OVH, AWS, GCP...
 */
export enum CaServerHost {
  OVH = 'OVH'
}

/**
 * Disk type for the servers
 */
export enum CaDiskType {
  SSD = 'SSD',
  HDD = 'HDD'
}


export class CaServerInfo extends CaEntity {

  // host like OVH, AWS...
  host: CaServerHost;

  // the ram of the server in MB
  name: string;

  // the ram of the server in MB
  ram: number;

  // Disk size of the server in GB
  diskSpace: number;

  // type of disk, SSD or HDD
  diskType: CaDiskType;

  // number of CPU
  cpuCount: number;

  // info about the cpu
  cpuType: string;

  // number of GPU
  gpuCount: number;

  // info about the GPU
  gpuType: string;

}
