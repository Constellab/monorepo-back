import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, In, Repository, TreeRepository} from 'typeorm';
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

@Injectable()
export class CnProjectsService extends CnAbstractWithStatusService<CnProject, CnProjectStatus> {

  constructor(@InjectRepository(CnProject) private repository: TreeRepository<CnProject>,
              @InjectRepository(CnProjectStatusHistory) statusHistoRepo: Repository<CnProjectStatusHistory>,
              private groupService: CnGroupsService, private userService: CnUsersService,
              datasource: DataSource) {
    super(repository, CnProject, statusHistoRepo, CnProjectStatusHistory, datasource);
  }

  async create(entity: CnProject): Promise<CnProject> {
    const userGroup = await this.groupService.getCurrentUserSingleGroup();
    entity.sharedGroups = [userGroup];
    return super.createWithStatus(entity, CnProjectStatus.ACTIVE);
  }

  async createProject(project: CnProject): Promise<CnProject> {
    project.parent = null;
    project.level = CnProjectLevel.PROJECT;
    return this.create(project);
  }

  async createWorkPackage(workPackage: CnProject, project: CnProject): Promise<CnProject> {
    workPackage.parent = project;
    workPackage.leafLevel = project.leafLevel;
    workPackage.level = CnProjectLevel.WORK_PACKAGE;
    workPackage.rootParentId = project.id;
    return this.create(workPackage);
  }

  async createTask(task: CnProject, workPackage: CnProject): Promise<CnProject> {
    task.parent = workPackage;
    task.leafLevel = workPackage.leafLevel;
    task.level = CnProjectLevel.TASK;
    task.rootParentId = workPackage.rootParentId;
    return this.create(task);
  }

  public async getProjectTree(project: CnProject): Promise<CnProject> {
    return this.repository.findDescendantsTree(project);
  }

  public async getCurrentProjects(page: number, size: number): Promise<ClPageI<CnProject>> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();

    const safePage: number = this.getSafePage(page);
    const safeSize: number = this.getSafePageSize(size);

    return this.getProjectOfUser(user, safePage, safeSize);
  }

  public async getProjectsOfUserId(userId: string): Promise<CnProject[]> {
    const user = await this.userService.findByIdAndCheck(userId);
    return (await this.getProjectOfUser(user, 0, 1000)).objects;
  }

  /**
   * Get all projects shared with a group paginated
   */
  public async getProjectsOfGroup(groupId: string, page: number, size: number): Promise<ClPageI<CnProject>> {
    return await this.findPaginated(page, size, {
      where: {
        level: CnProjectLevel.PROJECT,
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

  public async getOnGoingProjectsNumber(): Promise<number> {
    const user: CnUser = this.userService.getCurrent();
    const projects: CnProject[] = await this.getProjectsOfUserId(user.id);
    return (projects.filter(project =>
      project.startingDate < DateTime.fromJSDate(new Date()) &&
      project.endingDate > DateTime.fromJSDate(new Date()))).length;
  }

  /**
   * Get project by groups of user
   */
  private async getProjectOfUser(user: CnUser, page: number, size: number): Promise<ClPageI<CnProject>> {
    const groupIds = await this.groupService.getGroupIdsFromUser(user);

    return await this.findPaginated(page, size, {
      where: {
        level: CnProjectLevel.PROJECT,
        sharedGroups: {
          id: In(groupIds)
        }
      },
      order: {lastModifiedAt: 'DESC' as any}
    });
  }

}
