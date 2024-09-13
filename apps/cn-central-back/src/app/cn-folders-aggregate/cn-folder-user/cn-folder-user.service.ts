import { Injectable } from '@nestjs/common';
import { BlAbstractPaginatedService, BlBadRequestException } from '@monorepo/back-core-lib';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { CnFolderUser, CnFolderUserEntity } from './cn-folder-user.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnGroupsService } from '../../cn-groups/cn-groups.service';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { ClHelpService, ClPage } from '@monorepo/core-lib';
import { CnFolderUserSearch } from './cn-folder-user-search.class';


@Injectable()
export class CnFolderUserService extends BlAbstractPaginatedService<CnFolderUserEntity> {

  constructor(@InjectRepository(CnFolderUserEntity) private repository: Repository<CnFolderUserEntity>,
              private groupService: CnGroupsService) {
    super(repository, CnFolderUserEntity);
  }

  public async shareRootFolderToGroup(rootFolderId: string, groupId: string): Promise<CnUser[]> {
    const users = await this.groupService.getUsersOfGroups([groupId]);

    for (const user of users) {
      await this.shareRootFolderToUserIfNot(rootFolderId, user.id);
    }

    // return all users of the folder
    return users;
  }

  public async shareRootFolderToUserIfNot(rootFolderId: string, userId: string, entityManager?: EntityManager): Promise<CnFolderUser> {
    const folderUser = await this.findByRootFolderIdAndUserId(rootFolderId, userId);
    if (folderUser) {
      return folderUser;
    }

    const newFolderUser = new CnFolderUserEntity();
    newFolderUser.rootFolderId = rootFolderId;
    newFolderUser.userId = userId;
    return await this.getEntityManager(entityManager).save(newFolderUser);
  }


  public async unshareRootFolderFromUser(rootFolderId: string, userId: string): Promise<DeleteResult> {
    const users = await this.findUsersByRootFolderId(rootFolderId);
    if (users.length === 1) {
      throw new BlBadRequestException(CnErrorText.FOLDER_MUST_HAVE_A_GROUP);
    }

    return this.repository.delete({rootFolderId: rootFolderId, userId: userId});
  }

  public async findUsersByRootFolderId(rootFolderId: string): Promise<CnUser[]> {
    const folderUsers = await this.findByRootFolderId(rootFolderId);
    return folderUsers.map(folderUser => folderUser.user);
  }

  public async findByRootFolderId(rootFolderId: string): Promise<CnFolderUser[]> {
    return await this.repository.find({where: {rootFolderId: rootFolderId}});
  }

  public findByRootFolderIdAndUserId(rootFolderId: string, userId: string): Promise<CnFolderUser> {
    return this.repository.findOne({where: {rootFolderId: rootFolderId, userId: userId}});
  }

  public async userIsInRootFolder(rootFolderId: string, userId: string): Promise<boolean> {
    const folderUser = await this.findByRootFolderIdAndUserId(rootFolderId, userId);
    return folderUser != null;
  }

  public updateFolderUser(folderUser: CnFolderUser): Promise<CnFolderUser> {
    return this.repository.save(folderUser);
  }


  public async smartSearchByName(rootFolderId: string, name: string , page: number, size: number): Promise<ClPage<CnFolderUser>> {
    if(ClHelpService.isNullOrEmpty(name)) {
      return this.findPaginated(page, size, {where: {rootFolderId: rootFolderId}});
    }

    const folderUserSearch = new CnFolderUserSearch(this, rootFolderId);
    return folderUserSearch.smartSearchByName(name, page, size);
  }


}
