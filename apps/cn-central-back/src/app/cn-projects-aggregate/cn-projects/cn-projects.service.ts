import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, In, Repository, TreeRepository} from 'typeorm';
import {CnProject} from './cn-project.entity';
import {CnAbstractWithStatusService} from '../../cn-core/class/cn-abstract-with-status.service';
import {CnProjectStatus} from './cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {ClPageI} from '@monorepo/core-lib';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnGroup} from '../../cn-groups/cn-group.entity';
import {CnUsersService} from '../../cn-users/cn-users.service';
import {DateTime} from 'luxon';
import {CnProjectLevel} from './cn-project-level.enum';
import {CnOrganization} from '../../cn-organizations/cn-organization.entity';

@Injectable()
export class CnProjectsService extends CnAbstractWithStatusService<CnProject, CnProjectStatus> {

  constructor(@InjectRepository(CnProject) private repository: TreeRepository<CnProject>,
              @InjectRepository(CnProjectStatusHistory) statusHistoRepo: Repository<CnProjectStatusHistory>,
              private groupService: CnGroupsService, private userService: CnUsersService,
              datasource: DataSource) {
    super(repository, CnProject, statusHistoRepo, CnProjectStatusHistory, datasource);
  }

  async create(entity: CnProject, entityManager?: EntityManager): Promise<CnProject> {
    entity.organization = CnCurrentUserHelper.getAndCheckCurrentOrganization();

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

  public getChildren(project: CnProject): Promise<CnProject[]> {
    return this.repository.find({where: {parent: {id: project.id}}});
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

  public async getCurrentProjects(page: number, size: number): Promise<ClPageI<CnProject>> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    const organization = CnCurrentUserHelper.getAndCheckCurrentOrganization();


    const safePage: number = this.getSafePage(page);
    const safeSize: number = this.getSafePageSize(size);

    return this.getProjectOfUser(user.id, organization.id, safePage, safeSize);
  }

  public async getProjectsOfUserId(userId: string, organizationId: string): Promise<CnProject[]> {
    const user = await this.userService.findByIdAndCheck(userId);
    return (await this.getProjectOfUser(user.id, organizationId, 0, 1000)).objects;
  }

  /**
   * Get all projects shared with a group paginated
   */
  public async getProjectsOfGroup(groupId: string, page: number, size: number): Promise<ClPageI<CnProject>> {
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

  public async shareProject(project: CnProject, groupId: string): Promise<CnGroup> {
    if (project.isSharedToGroup(groupId)) {
      throw new BadRequestException(CnErrorText.PROJECT_ALREADY_SHARED_WITH_GROUP);
    }

    const group = await this.groupService.findByIdAndCheck(groupId);
    project.sharedGroups.push(group);
    await this.update(project);
    return group;
  }

  public async unshareProject(project: CnProject, groupId: string): Promise<void> {
    if (!project.isSharedToGroup(groupId)) {
      throw new BadRequestException(CnErrorText.PROJECT_NOT_SHARED_WITH_GROUP);
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

  public async getOnGoingProjectsNumber(): Promise<number> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();
    const organization: CnOrganization = CnCurrentUserHelper.getAndCheckCurrentOrganization();
    const projects: CnProject[] = await this.getProjectsOfUserId(user.id, organization.id);
    return (projects.filter(project =>
      project.startingDate < DateTime.fromJSDate(new Date()) &&
      project.endingDate > DateTime.fromJSDate(new Date()))).length;
  }

  /**
   * Get project by groups of user
   */
  private async getProjectOfUser(userId: string, organizationId: string, page: number, size: number): Promise<ClPageI<CnProject>> {
    const groupIds = await this.groupService.getAllGroupIdsOfUser(userId, organizationId);

    return await this.findPaginated(page, size, {
      where: {
        currentLevel: CnProjectLevel.PROJECT,
        organizationId: organizationId,
        sharedGroups: {
          id: In(groupIds)
        }
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

}
