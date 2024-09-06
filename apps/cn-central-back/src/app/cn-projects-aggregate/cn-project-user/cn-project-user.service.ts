import { Injectable } from '@nestjs/common';
import { BlAbstractPaginatedService, BlBadRequestException } from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { CnProjectUser } from './cn-project-user.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnGroupsService } from '../../cn-groups/cn-groups.service';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { ClHelpService, ClPage } from '@monorepo/core-lib';
import { CnProjectUserSearch } from './cn-project-user-search.class';


@Injectable()
export class CnProjectUserService extends BlAbstractPaginatedService<CnProjectUser> {

  constructor(@InjectRepository(CnProjectUser) private repository: Repository<CnProjectUser>,
              private groupService: CnGroupsService) {
    super(repository, CnProjectUser);
  }

  public async shareRootFolderToGroup(rootFolderId: string, groupId: string): Promise<CnUser[]> {
    const users = await this.groupService.getUsersOfGroups([groupId]);

    for (const user of users) {
      await this.shareRootFolderToUserIfNot(rootFolderId, user.id);
    }

    // return all users of the folder
    return users;
  }

  public async shareRootFolderToUserIfNot(rootFolderId: string, userId: string, entityManager?: EntityManager): Promise<CnProjectUser> {
    const projectUser = await this.findByRootFolderIdAndUserId(rootFolderId, userId);
    if (projectUser) {
      return projectUser;
    }

    const newProjectUser = new CnProjectUser();
    newProjectUser.rootFolderId = rootFolderId;
    newProjectUser.userId = userId;
    return await this.getEntityManager(entityManager).save(newProjectUser);
  }


  public async unshareRootFolderFromUser(rootFolderId: string, userId: string): Promise<DeleteResult> {
    const users = await this.findUsersByRootFolderId(rootFolderId);
    if (users.length === 1) {
      throw new BlBadRequestException(CnErrorText.PROJECT_MUST_HAVE_A_GROUP);
    }

    return this.repository.delete({rootFolderId: rootFolderId, userId: userId});
  }

  public async findUsersByRootFolderId(rootFolderId: string): Promise<CnUser[]> {
    const projectUsers = await this.findByRootFolderId(rootFolderId);
    return projectUsers.map(projectUser => projectUser.user);
  }

  public async findByRootFolderId(rootFolderId: string): Promise<CnProjectUser[]> {
    return await this.repository.find({where: {rootFolderId: rootFolderId}, relations: {user: true}});
  }

  public findByRootFolderIdAndUserId(rootFolderId: string, userId: string): Promise<CnProjectUser> {
    return this.repository.findOne({where: {rootFolderId: rootFolderId, userId: userId}});
  }

  public async userIsInRootFolder(rootFolderId: string, userId: string): Promise<boolean> {
    const projectUser = await this.findByRootFolderIdAndUserId(rootFolderId, userId);
    return projectUser != null;
  }

  public updateProjectUser(projectUser: CnProjectUser): Promise<CnProjectUser> {
    return this.repository.save(projectUser);
  }


  public async smartSearchByName(rootFolderId: string, name: string , page: number, size: number): Promise<ClPage<CnProjectUser>> {
    if(ClHelpService.isNullOrEmpty(name)) {
      return this.findPaginated(page, size, {where: {rootFolderId: rootFolderId}});
    }

    const projectUserSearch = new CnProjectUserSearch(this, rootFolderId);
    return projectUserSearch.smartSearchByName(name, page, size);
  }


}
