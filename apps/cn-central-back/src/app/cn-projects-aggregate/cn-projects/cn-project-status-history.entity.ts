import {CnProjectStatus} from './cn-project-status.enum';
import {CnStatusHistory} from '../../cn-core/model/entities/cn-status-history.entity';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {CnProject} from './cn-project.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity('project_status_history')
export class CnProjectStatusHistory extends CnStatusHistory<CnProjectStatus> {


  @Column({
    type: 'enum', enum: CnProjectStatus, nullable: false,
    default: CnProjectStatus.ACTIVE
  })
  status: CnProjectStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  entity: CnProject;
}
