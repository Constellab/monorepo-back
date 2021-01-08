import {JsonObject, JsonProperty} from 'json2typescript';
import {FlEntity} from '@monorepo/front-core-lib';

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


@JsonObject('ServerInfo')
export class ServerInfo extends FlEntity {

  // host like OVH, AWS...
  @JsonProperty('host', String)
  host: ServerHost = null;

  // the ram of the server in MB
  @JsonProperty('name', String)
  name: string = null;

  // the ram of the server in MB
  @JsonProperty('ram', Number)
  ram: number = null;

  // Disk size of the server in GB
  @JsonProperty('diskSpace', Number)
  diskSpace: number = null;

  // type of disk, SSD or HDD
  @JsonProperty('diskType', String)
  diskType: DiskType = null;

  // number of CPU
  @JsonProperty('cpuCount', Number)
  cpuCount: number = null;

  // info about the cpu
  @JsonProperty('cpuType', String)
  cpuType: string = null;

  // number of GPU
  @JsonProperty('gpuType', Number, true)
  gpuCount: number = null;

  // info about the GPU
  @JsonProperty('gpuType', String, true)
  gpuType: string = null;

}
