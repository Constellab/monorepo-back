import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnProject} from './cn-project.entity';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnAbstractWithStatusService} from '../cn-core/class/cn-abstract-with-status.service';
import {CnProjectStatus} from './cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnProjectsService extends CnAbstractWithStatusService<CnProject, CnProjectStatus> {

  constructor(@InjectRepository(CnProject) private repository: Repository<CnProject>,
              @InjectRepository(CnProjectStatusHistory) statusHistoRepo: Repository<CnProjectStatusHistory>,
  ) {
    super(repository, CnProject, statusHistoRepo, CnProjectStatusHistory);
  }


  async create(entity: CnProject): Promise<CnProject> {
    return super.createWithStatus(entity, CnProjectStatus.ACTIVE);
  }

  public async getCurrentProjects(page: number, size: number): Promise<ClPageI<CnProject>> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    return this.findPaginated(page, size, {
      where: {
        createdBy: {id: user.id},
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public async getProjectsOfUser(userId: string): Promise<CnProject[]> {
    return this.repository.find({
      where: {
        createdBy: {id: userId},
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }
}
