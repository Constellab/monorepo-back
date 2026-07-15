import { Column, Entity, ManyToOne, Unique } from 'typeorm';

import { CnCloudProvider } from '../../cn-cloud-providers/cn-cloud-provider.entity';
import { CnBaseEntity } from '../../cn-core/model/entities/cn-base.entity';
import { CnServerStandard } from '../server-standard/cn-server-standard.entity';
import { CnDiskType } from './cn-disk-type.enum';

/**
 * Contains the servers available for the cloud providers
 */
@Unique('UQ_NAME', ['technicalName', 'cloudProvider'])
@Entity('server_cloud')
export class CnServerCloud extends CnBaseEntity {
  @ManyToOne(() => CnCloudProvider, { nullable: false, eager: true })
  cloudProvider!: CnCloudProvider;

  @ManyToOne(() => CnServerStandard, { nullable: false, eager: true })
  serverStandard!: CnServerStandard;

  // name of the server in the cloud provider
  @Column({ nullable: false, length: 50 })
  technicalName!: string;

  // the ram of the server in MB
  @Column({ nullable: false, type: 'int' })
  ram!: number;

  // Disk size of the server in GB
  @Column({ nullable: false, type: 'int' })
  diskSpace!: number;

  // type of disk, SSD or HDD
  @Column({ nullable: false, type: 'enum', enum: CnDiskType })
  diskType!: CnDiskType;

  // number of CPU
  @Column({ nullable: false, type: 'int' })
  cpuCount!: number;

  // info about the cpu
  @Column({ nullable: false, length: 30 })
  cpuType!: string;

  // number of GPU
  @Column({ nullable: true, type: 'int' })
  gpuCount!: number | null;

  // info about the GPU
  @Column({ nullable: true, type: 'varchar', length: 30 })
  gpuType!: string | null;
}
