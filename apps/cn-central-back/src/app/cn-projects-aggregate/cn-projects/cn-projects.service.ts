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

    // get projects by shared groups
    const [result, totalElements] = await this.repository.createQueryBuilder('project')
      // the join is one project_group and group table, should be more optimized to only join on project_group
      .leftJoin('project.sharedGroups', 'group')
      .where('group.id IN(:groupIds)', {groupIds: groupIds})
      .innerJoinAndSelect('project.createdBy', 'created_by')
      .innerJoinAndSelect('project.lastModifiedBy', 'last_modified_by')
      .innerJoinAndSelect('project.currentStatus', 'status')
      .skip(page * size)
      .take(size)
      .getManyAndCount();

    return ClPage.fromPagination(page, size, totalElements, result);
  }

  public async shareProject(project: CnProject, groupId: string): Promise<void> {
    if (project.isSharedToGroup(groupId)) {
      throw new BadRequestException(CnErrorText.PROJECT_ALREADY_SHARED_WITH_GROUP);
    }

    const group = await this.groupService.findByIdAndCheck(groupId);
    project.sharedGroups.push(group);
    await this.update(project);
  }

  public async getProjectWithSharedGroups(projectId: string): Promise<CnProject> {
    return this.findByIdAndCheck(projectId, {relations: ['sharedGroups']});
  }

}
