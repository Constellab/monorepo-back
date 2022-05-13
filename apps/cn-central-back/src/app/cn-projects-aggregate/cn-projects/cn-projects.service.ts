import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnProject} from './cn-project.entity';
import {CnAbstractWithStatusService} from '../../cn-core/class/cn-abstract-with-status.service';
import {CnProjectStatus} from './cn-project-status.enum';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnGroup} from '../../cn-groups/cn-group.entity';
import {SelectQueryBuilder} from 'typeorm/query-builder/SelectQueryBuilder';
import {CnUsersService} from '../../cn-users/cn-users.service';

@Injectable()
export class CnProjectsService extends CnAbstractWithStatusService<CnProject, CnProjectStatus> {

  constructor(@InjectRepository(CnProject) private repository: Repository<CnProject>,
              @InjectRepository(CnProjectStatusHistory) statusHistoRepo: Repository<CnProjectStatusHistory>,
              private groupService: CnGroupsService, private userService: CnUsersService) {
    super(repository, CnProject, statusHistoRepo, CnProjectStatusHistory);
  }

  async create(entity: CnProject): Promise<CnProject> {
    const userGroup = await this.groupService.getCurrentUserSingleGroup();
    entity.sharedGroups = [userGroup];

    return super.createWithStatus(entity, CnProjectStatus.ACTIVE);
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
   * Get project by groups of user
   */
  private async getProjectOfUser(user: CnUser, page: number, size: number): Promise<ClPageI<CnProject>> {
    const groupIds = await this.groupService.getGroupIdsFromUser(user);

    const queryBuilder: SelectQueryBuilder<CnProject> = this.repository.createQueryBuilder('project')
      // the join is one project_group and group table, should be more optimized to only join on project_group
      .leftJoin('project.sharedGroups', 'group')
      .where('group.id IN(:groupIds)', {groupIds: groupIds});

    return this.getProjectFromBuilder(queryBuilder, page, size);
  }

  /**
   * Get all projects shared with a group paginated
   */
  public async getProjectsOfGroup(groupId: string, page: number, size: number): Promise<ClPageI<CnProject>> {
    const queryBuilder: SelectQueryBuilder<CnProject> = this.repository.createQueryBuilder('project')
      // the join is one project_group and group table, should be more optimized to only join on project_group
      .leftJoin('project.sharedGroups', 'group')
      .where('group.id = :groupId', {groupId: groupId});
    return this.getProjectFromBuilder(queryBuilder, page, size);
  }

  private async getProjectFromBuilder(builder: SelectQueryBuilder<CnProject>,
                                      page: number, size: number): Promise<ClPageI<CnProject>> {
    const safePage: number = this.getSafePage(page);
    const safeSize: number = this.getSafePageSize(size);

    const [result, totalElements] = await builder
      .leftJoinAndSelect('project.createdBy', 'created_by')
      .leftJoinAndSelect('project.lastModifiedBy', 'last_modified_by')
      .innerJoinAndSelect('project.currentStatus', 'status')
      .skip(page * size)
      .take(size)
      .getManyAndCount();

    return ClPage.fromPagination(safePage, safeSize, totalElements, result);
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

  public async getProjectWithSharedGroups(projectId: string): Promise<CnProject> {
    return this.findByIdAndCheck(projectId, {relations: ['sharedGroups']});
  }

}
