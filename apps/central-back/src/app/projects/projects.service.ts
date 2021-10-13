import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Project} from './project.entity';
import {User} from '../users/user.entity';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {ProjectStatus} from './project-status.enum';
import {ProjectStatusHistory} from './project-status-history.entity';
import {ClPageI} from '@monorepo/core-lib';
import {CurrentUserHelper} from '../core/utils/current-user.helper';

@Injectable()
export class ProjectsService extends AbstractWithStatusService<Project, ProjectStatus> {

  constructor(@InjectRepository(Project) private repository: Repository<Project>,
              @InjectRepository(ProjectStatusHistory) statusHistoRepo: Repository<ProjectStatusHistory>,
  ) {
    super(repository, Project, statusHistoRepo, ProjectStatusHistory);
  }


  async create(entity: Project): Promise<Project> {
    return super.createWithStatus(entity, ProjectStatus.ACTIVE);
  }

  public async getCurrentProjects(page: number, size: number): Promise<ClPageI<Project>> {
    const user: User = CurrentUserHelper.getAndCheckCurrentUser();

    return this.findPaginated(page, size, {
      where: {
        createdBy: {id: user.id},
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }
}
