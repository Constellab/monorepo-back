import {ProjectStatus} from './project-status.enum';
import {StatusHistory} from '../core/model/entities/status-history.entity';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {Project} from './project.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';

@Entity()
export class ProjectStatusHistory extends StatusHistory<ProjectStatus> {


  @Column({
    type: 'enum', enum: ProjectStatus, nullable: false,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @Exclude()
  @BlNotUpdatable()
  @Type(() => Project)
  @ManyToOne(() => Project, {nullable: false})
  entity: Project;
}
