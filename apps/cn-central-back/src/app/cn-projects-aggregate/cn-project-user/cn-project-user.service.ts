import {Injectable} from '@nestjs/common';
import {BlAbstractPaginatedService, BlBadRequestException} from '@monorepo/back-core-lib';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {CnProjectUser} from './cn-project-user.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';


@Injectable()
export class CnProjectUserService extends BlAbstractPaginatedService<CnProjectUser> {

  constructor(@InjectRepository(CnProjectUser) private repository: Repository<CnProjectUser>,
              private groupService: CnGroupsService) {
    super(repository, CnProjectUser);
  }

  public async shareProjectToGroup(projectId: string, groupId: string): Promise<CnUser[]> {
    const users = await this.groupService.getUsersOfGroups([groupId]);

    for (const user of users) {
      await this.shareProjectToUserIfNot(projectId, user.id);
    }

    // return all users of the project
    return users;
  }

  public async shareProjectToUserIfNot(projectId: string, userId: string, entityManager?: EntityManager): Promise<CnProjectUser> {
    const projectUser = await this.findByProjectIdAndUserId(projectId, userId);
    if (projectUser) {
      return projectUser;
    }

    const newProjectUser = new CnProjectUser();
    newProjectUser.projectId = projectId;
    newProjectUser.userId = userId;
    return await this.getEntityManager(entityManager).save(newProjectUser);
  }


  public async unshareProjectFromUser(projectId: string, userId: string): Promise<DeleteResult> {
    const users = await this.findUsersByProjectId(projectId);
    if (users.length === 1) {
      throw new BlBadRequestException(CnErrorText.PROJECT_MUST_HAVE_A_GROUP);
    }

    return this.repository.delete({projectId: projectId, userId: userId});
  }


  public async findUsersByProjectId(projectId: string): Promise<CnUser[]> {
    const projectUsers = await this.findByProjectId(projectId);
    return projectUsers.map(projectUser => projectUser.user);
  }

  public async findByProjectId(projectId: string): Promise<CnProjectUser[]> {
    return await this.repository.find({where: {projectId: projectId}, relations: {user: true}});
  }

  public findByProjectIdAndUserId(projectId: string, userId: string): Promise<CnProjectUser> {
    return this.repository.findOne({where: {projectId: projectId, userId: userId}});
  }

  public async userIsInProject(projectId: string, userId: string): Promise<boolean> {
    const projectUser = await this.findByProjectIdAndUserId(projectId, userId);
    return projectUser != null;
  }

  public updateProjectUser(projectUser: CnProjectUser): Promise<CnProjectUser> {
    return this.repository.save(projectUser);
  }


}
