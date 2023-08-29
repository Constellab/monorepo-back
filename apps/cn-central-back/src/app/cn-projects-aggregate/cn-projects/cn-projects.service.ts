import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Repository, TreeRepository} from 'typeorm';
import {CnProject} from './cn-project.entity';
import {CnAbstractWithStatusService} from '../../cn-core/class/cn-abstract-with-status.service';
import {CnProjectStatus} from './cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {ClDateHelper, ClPage} from '@monorepo/core-lib';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnProjectLevel} from './cn-project-level.enum';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {BlSearchParams} from '@monorepo/back-core-lib';
import {CnProjectSearchBuilder} from './cn-project-search.builder';

@Injectable()
export class CnProjectsService extends CnAbstractWithStatusService<CnProject, CnProjectStatus> {


  constructor(@InjectRepository(CnProject) private repository: TreeRepository<CnProject>,
              @InjectRepository(CnProjectStatusHistory) statusHistoRepo: Repository<CnProjectStatusHistory>,
              datasource: DataSource) {
    super(repository, CnProject, statusHistoRepo, CnProjectStatusHistory, datasource);
  }

  async create(entity: CnProject, entityManager?: EntityManager): Promise<CnProject> {
    entity.space = CnCurrentUserHelper.getAndCheckCurrentSpace();

    if (entityManager) {
      return super.createWithStatusTransaction(entity, CnProjectStatus.ACTIVE, entityManager);
    } else {
      return super.createWithStatus(entity, CnProjectStatus.ACTIVE);
    }
  }

  public async getProjectTree(project: CnProject): Promise<CnProject> {
    return this.repository.findDescendantsTree(project);
  }

  public async getProjectTreeAsList(project: CnProject): Promise<CnProject[]> {
    return this.repository.findDescendants(project);
  }

  /**
   * Get list of direct children of this project
   * @param projectId
   */
  public getChildren(projectId: string): Promise<CnProject[]> {
    return this.repository.find({where: {parentId: projectId}});
  }

  /**
   * Return a simplified list from this project to the root project
   */
  public async getAncestors(project: CnProject): Promise<CnProject[]> {
    const parent = await this.repository.findAncestorsTree(project, {
      relations: ['createdBy', 'lastModifiedBy', 'leader'],
    });
    const projects: CnProject[] = [];
    let currentProject = parent;
    while (currentProject != null) {
      projects.push(currentProject);
      currentProject = currentProject.parent;
    }
    return projects;
  }

  public async getCurrentProjects(page: number, size: number): Promise<ClPage<CnProject>> {
    const spaceUser = CnCurrentUserHelper.getAndCheckUserSpaceInfo();

    return this.getProjectOfUser(spaceUser.userId, spaceUser.spaceId, page, size);
  }

  public async getBySpace(spaceId: string, page: number, size: number): Promise<ClPage<CnProject>> {
    return this.findPaginated(page, size, {
      where: {
        spaceId: spaceId,
        currentLevel: CnProjectLevel.PROJECT,
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  public async getProjectsOfUserId(userId: string, spaceId: string): Promise<CnProject[]> {
    return (await this.getProjectOfUser(userId, spaceId, 0, 1000)).objects;
  }

  public async getRootProject(project: CnProject): Promise<CnProject> {
    if (project.currentLevel === CnProjectLevel.PROJECT) {
      return project;
    }
    return this.findByIdAndCheck(project.getRootParentId());
  }

  // TODO to improve
  public async getOnGoingProjectsNumber(): Promise<number> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();
    const space: CnSpace = CnCurrentUserHelper.getAndCheckCurrentSpace();
    const projects: CnProject[] = await this.getProjectsOfUserId(user.id, space.id);

    const currentDate = ClDateHelper.getDate();
    return (projects.filter(project =>
      (project.startingDate == null || project.startingDate < currentDate) &&
      (project.endingDate == null || project.endingDate > currentDate))).length;
  }

  /**
   * Get project by groups of user
   */
  private async getProjectOfUser(userId: string, spaceId: string, page: number, size: number): Promise<ClPage<CnProject>> {
    return await this.findPaginated(page, size, {
      where: {
        users: {userId: userId},
        spaceId: spaceId,
        currentLevel: CnProjectLevel.PROJECT
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }


  public async searchInSpace(spaceId: string, searchParam: BlSearchParams,
                             page: number, size: number): Promise<ClPage<CnProject>> {
    const searchBuilder = new CnProjectSearchBuilder({lastModifiedAt: 'DESC' as any});
    searchBuilder.addSearchParams(searchParam);
    searchBuilder.mergeWhereOptions({spaceId: spaceId});

    return await this.findPaginated(page, size, searchBuilder.build());
  }

}
