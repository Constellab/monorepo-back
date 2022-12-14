import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, In, Repository, TreeRepository} from 'typeorm';
import {CnProject} from './cn-project.entity';
import {CnAbstractWithStatusService} from '../../cn-core/class/cn-abstract-with-status.service';
import {CnProjectStatus} from './cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {ClDateHelper, ClPage} from '@monorepo/core-lib';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnGroup} from '../../cn-groups/cn-group.entity';
import {CnProjectLevel} from './cn-project-level.enum';
import {CnSpace} from '../../cn-spaces/cn-space.entity';
import {BlBadRequestException, BlSearchParams} from '@monorepo/back-core-lib';
import {CnProjectSearchBuilder} from './cn-project-search.builder';

@Injectable()
export class CnProjectsService extends CnAbstractWithStatusService<CnProject, CnProjectStatus> {

  constructor(@InjectRepository(CnProject) private repository: TreeRepository<CnProject>,
              @InjectRepository(CnProjectStatusHistory) statusHistoRepo: Repository<CnProjectStatusHistory>,
              private groupService: CnGroupsService,
              datasource: DataSource) {
    super(repository, CnProject, statusHistoRepo, CnProjectStatusHistory, datasource);
  }

  async create(entity: CnProject, entityManager?: EntityManager): Promise<CnProject> {
    entity.space = CnCurrentUserHelper.getAndCheckCurrentSpace();

    // init the shared group for PROJECT
    if (entity.currentLevel === CnProjectLevel.PROJECT) {
      const userGroup = await this.groupService.getCurrentUserSingleGroup();
      entity.sharedGroups = [userGroup];
    } else {
      // clear shared groups for children project
      entity.sharedGroups = null;
    }
    if (entityManager) {
      return super.createWithStatusTransaction(entity, CnProjectStatus.ACTIVE, entityManager);
    } else {
      return super.createWithStatus(entity, CnProjectStatus.ACTIVE);
    }
  }

  public async getProjectTree(project: CnProject): Promise<CnProject> {
    return this.repository.findDescendantsTree(project);
  }

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

  /**
   * Get all projects shared with a group paginated
   */
  public async getProjectsOfGroup(groupId: string, page: number, size: number): Promise<ClPage<CnProject>> {
    return await this.findPaginated(page, size, {
      where: {
        currentLevel: CnProjectLevel.PROJECT,
        sharedGroups: {
          id: groupId
        }
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

  public async shareProject(project: CnProject, groupId: string, entityManager?: EntityManager): Promise<CnGroup> {
    if (project.isSharedToGroup(groupId)) {
      throw new BlBadRequestException(CnErrorText.PROJECT_ALREADY_SHARED_WITH_GROUP);
    }

    const group = await this.groupService.findByIdAndCheck(groupId);
    project.sharedGroups.push(group);
    await this.update(project, entityManager);
    return group;
  }

  public async unshareProject(project: CnProject, groupId: string): Promise<void> {
    if (!project.isSharedToGroup(groupId)) {
      throw new BlBadRequestException(CnErrorText.PROJECT_NOT_SHARED_WITH_GROUP);
    }

    project.removeSharedGroup(groupId);
    await this.update(project);
  }

  public async findWithSharedGroups(projectId: string): Promise<CnProject> {
    return this.findByIdAndCheck(projectId, {sharedGroups: true});
  }

  public async getRootProjectWithSharedGroup(project: CnProject): Promise<CnProject> {
    if (project.currentLevel === CnProjectLevel.PROJECT) {
      return project;
    }
    return this.findWithSharedGroups(project.rootParentId);
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
    const groupIds = await this.groupService.getAllGroupIdsOfUser(userId, spaceId);

    return await this.findPaginated(page, size, {
      where: {
        currentLevel: CnProjectLevel.PROJECT,
        spaceId: spaceId,
        sharedGroups: {
          id: In(groupIds)
        }
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
