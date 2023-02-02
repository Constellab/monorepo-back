import {Column, Entity, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {CnProject} from '../cn-projects/cn-project.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';


@Entity('document')
export class CnDocument extends CnBaseEntity {

  @Column({nullable: false})
  name: string;

  @Column({nullable: false, length: 1024})
  filePath: string;

  @Column({nullable: false})
  size: number;

  @Column({nullable: false})
  mimeType: string;

  @BlNotUpdatable()
  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  project: CnProject;

  @Column()
  projectId: string;
}
