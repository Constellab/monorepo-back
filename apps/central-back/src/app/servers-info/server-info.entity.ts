import {Column, Entity, OneToMany, Unique} from 'typeorm';
import {EntityWithId} from '../core/model/entities/entity-with-id.entity';
import {DiskType} from './disk-type.enum';
import {ServerHost} from './server-host.enum';
import {LabInstance} from '../lab-instances/lab-instance.entity';

// unique key on Name/Host
@Unique('UQ_NAME', ['name', 'host'])
@Entity()
export class ServerInfo extends EntityWithId {

  // host like OVH, AWS...
  @Column({nullable: false, type: 'enum', enum: ServerHost})
  host: ServerHost;

  // the ram of the server in MB
  @Column({nullable: false, length: 30})
  name: string;

  // the ram of the server in MB
  @Column({nullable: false, type: 'int'})
  ram: number;

  // Disk size of the server in GB
  @Column({nullable: false, type: 'int'})
  diskSpace: number;

  // type of disk, SSD or HDD
  @Column({nullable: false, type: 'enum', enum: DiskType})
  diskType: DiskType;

  // number of CPU
  @Column({nullable: false, type: 'int'})
  cpuCount: number;

  // info about the cpu
  @Column({nullable: false, length: 30})
  cpuType: string;

  // number of GPU
  @Column({nullable: true, type: 'int'})
  gpuCount: number;

  // info about the GPU
  @Column({nullable: true, length: 30})
  gpuType: string;

  @OneToMany(() => LabInstance,
    (labInstance: LabInstance) => labInstance.serverInfo)
  labInstances: LabInstance[];
}
