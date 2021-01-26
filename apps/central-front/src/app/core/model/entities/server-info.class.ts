import {Entity} from './entity.entity';

/**
 * Host for the server like OVH, AWS, GCP...
 */
export enum ServerHost {
  OVH = 'OVH'
}

/**
 * Disk type for the servers
 */
export enum DiskType {
  SSD = 'SSD',
  HDD = 'HDD'
}


export class ServerInfo extends Entity {

  // host like OVH, AWS...
  host: ServerHost;

  // the ram of the server in MB
  name: string;

  // the ram of the server in MB
  ram: number;

  // Disk size of the server in GB
  diskSpace: number;

  // type of disk, SSD or HDD
  diskType: DiskType;

  // number of CPU
  cpuCount: number;

  // info about the cpu
  cpuType: string;

  // number of GPU
  gpuCount: number;

  // info about the GPU
  gpuType: string;

}
