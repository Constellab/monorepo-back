import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Project} from './project.entity';
import {User} from '../users/user.entity';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {ProjectStatus} from './project-status.enum';
import {ProjectStatusHistory} from './project-status-history.entity';
import {Page} from '../core/model/config/page.class';

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

  public async getCurrentProjects(page: number, size: number): Promise<Page<Project>> {
    const user: User = RequestContextHelper.getAndCheckCurrentUser();

    return this.findPaginated(page, size, {
      where: {
        createdBy: {id: user.id},
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }
}
