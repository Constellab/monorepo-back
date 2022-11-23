import {Column, Entity, ManyToOne, OneToMany, Unique} from 'typeorm';
import {CnDiskType} from './cn-disk-type.enum';
import {CnLabInstance} from '../cn-lab-instances/cn-lab-instance.entity';
import {BlEntityWithId} from '@monorepo/back-core-lib';
import {CnCloudProvider} from '../cn-cloud-providers/cn-cloud-provider.entity';

// unique key on Name/Host
@Unique('UQ_NAME', ['name', 'cloudProvider'])
@Entity('server_info')
export class CnServerInfo extends BlEntityWithId {

  @ManyToOne(() => CnCloudProvider, {nullable: false, eager: true})
  cloudProvider: CnCloudProvider;

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
  @Column({nullable: false, type: 'enum', enum: CnDiskType})
  diskType: CnDiskType;

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

  @OneToMany(() => CnLabInstance,
    (labInstance: CnLabInstance) => labInstance.serverInfo)
  labInstances: CnLabInstance[];
}
