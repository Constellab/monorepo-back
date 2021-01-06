import {ProjectStatus} from './project-status.enum';
import {StatusHistory} from '../core/model/entities/status-history.entity';
import {Column, Entity, ManyToOne} from 'typeorm';
import {Exclude, Type} from 'class-transformer';
import {NotUpdatable} from '../core/decorators/not-updatable.decorator';
import {Project} from './project.entity';

@Entity()
export class ProjectStatusHistory extends StatusHistory<ProjectStatus> {


  @Column({
    type: 'enum', enum: ProjectStatus, nullable: false,
    default: ProjectStatus.ACTIVE
  })
  status: ProjectStatus;

  @Exclude()
  @NotUpdatable()
  @Type(() => Project)
  @ManyToOne(() => Project, {nullable: false})
  entity: Project;
}
