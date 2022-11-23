import {CaEntity} from './ca-entity.entity';
import {Type} from 'class-transformer';
import {CaCloudProvider} from './ca-cloud-provider.class';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

/**
 * Disk type for the servers
 */
export enum CaDiskType {
  SSD = 'SSD',
  HDD = 'HDD'
}


export class CaServerInfo extends CaEntity {
  @Type(() => CaCloudProvider)
  cloudProvider: CaCloudProvider;

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

export type CaServerInfoDatasource = FlEntityPaginatedDatasource<CaServerInfo>;
