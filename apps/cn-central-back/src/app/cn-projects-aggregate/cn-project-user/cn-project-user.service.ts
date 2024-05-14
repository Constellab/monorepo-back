import {Injectable} from '@nestjs/common';
import {BlAbstractPaginatedService, BlBadRequestException} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {CnProjectUser} from './cn-project-user.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {ClHelpService, ClPage} from '@monorepo/core-lib';
import {CnProjectUserSearch} from './cn-project-user-search.class';


@Injectable()
export class CnProjectUserService extends BlAbstractPaginatedService<CnProjectUser> {

  constructor(@InjectRepository(CnProjectUser) private repository: Repository<CnProjectUser>,
              private groupService: CnGroupsService) {
    super(repository, CnProjectUser);
  }

  public async shareProjectToGroup(rootProjectId: string, groupId: string): Promise<CnUser[]> {
    const users = await this.groupService.getUsersOfGroups([groupId]);

    for (const user of users) {
      await this.shareProjectToUserIfNot(rootProjectId, user.id);
    }

    // return all users of the project
    return users;
  }

  public async shareProjectToUserIfNot(rootProjectId: string, userId: string, entityManager?: EntityManager): Promise<CnProjectUser> {
    const projectUser = await this.findByProjectIdAndUserId(rootProjectId, userId);
    if (projectUser) {
      return projectUser;
    }

    const newProjectUser = new CnProjectUser();
    newProjectUser.projectId = rootProjectId;
    newProjectUser.userId = userId;
    return await this.getEntityManager(entityManager).save(newProjectUser);
  }


  public async unshareProjectFromUser(rootProjectId: string, userId: string): Promise<DeleteResult> {
    const users = await this.findUsersByProjectId(rootProjectId);
    if (users.length === 1) {
      throw new BlBadRequestException(CnErrorText.PROJECT_MUST_HAVE_A_GROUP);
    }

    return this.repository.delete({projectId: rootProjectId, userId: userId});
  }

  public async findUsersByProjectId(rootProjectId: string): Promise<CnUser[]> {
    const projectUsers = await this.findByProjectId(rootProjectId);
    return projectUsers.map(projectUser => projectUser.user);
  }

  public async findByProjectId(rootProjectId: string): Promise<CnProjectUser[]> {
    return await this.repository.find({where: {projectId: rootProjectId}, relations: {user: true}});
  }

  public findByProjectIdAndUserId(rootProjectId: string, userId: string): Promise<CnProjectUser> {
    return this.repository.findOne({where: {projectId: rootProjectId, userId: userId}});
  }

  public async userIsInProject(rootProjectId: string, userId: string): Promise<boolean> {
    const projectUser = await this.findByProjectIdAndUserId(rootProjectId, userId);
    return projectUser != null;
  }

  public updateProjectUser(projectUser: CnProjectUser): Promise<CnProjectUser> {
    return this.repository.save(projectUser);
  }


  public async smartSearchByName(rootProjectId: string, name: string , page: number, size: number): Promise<ClPage<CnProjectUser>> {
    if(ClHelpService.isNullOrEmpty(name)) {
      return this.findPaginated(page, size, {where: {projectId: rootProjectId}});
    }

    const projectUserSearch = new CnProjectUserSearch(this, rootProjectId);
    return projectUserSearch.smartSearchByName(name, page, size);
  }


}
