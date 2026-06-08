import { BlAbstractPaginatedService, BlBadRequestException } from '@monorepo/back-core-lib';
import { ClDateHelper, ClHelpService, ClPage } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityManager, Repository } from 'typeorm';

import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnGroupsService } from '../../cn-groups/cn-groups.service';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnUsersService } from '../../cn-users/cn-users.service';
import {
  CnFolderUser,
  CnFolderUserEntity,
  CnFolderUserWithSharedBy,
  CnRootFolderUserRole,
} from './cn-folder-user.entity';
import { CnFolderUserSearch } from './cn-folder-user-search.class';

@Injectable()
export class CnFolderUserService extends BlAbstractPaginatedService<CnFolderUserEntity> {
  constructor(
    @InjectRepository(CnFolderUserEntity) private repository: Repository<CnFolderUserEntity>,
    private groupService: CnGroupsService,
    private userService: CnUsersService
  ) {
    super(repository, CnFolderUserEntity);
  }

  public async shareRootFolderToGroupOrUser(
    rootFolderId: string,
    groupOrUserId: string,
    role: CnRootFolderUserRole
  ): Promise<CnUser[]> {
    const users = await this.groupService.getUsersOfGroups([groupOrUserId]);

    if (users.length === 0) {
      const user = await this.userService.findById(groupOrUserId);
      if (user) {
        await this.shareRootFolderToUserIfNot(rootFolderId, user.id, role);
        return [user];
      } else {
        throw new Error('The group or user does not exist');
      }
    }

    for (const user of users) {
      await this.shareRootFolderToUserIfNot(rootFolderId, user.id, role);
    }

    // return all users of the folder
    return users;
  }

  public async shareRootFolderToUserIfNot(
    rootFolderId: string,
    userId: string,
    role: CnRootFolderUserRole,
    entityManager?: EntityManager
  ): Promise<CnFolderUser> {
    const folderUser = await this.findByRootFolderIdAndUserId(rootFolderId, userId);
    if (folderUser) {
      // if the user is already in the folder, but if the role is lower than the new one, update the role
      if (folderUser.roleObj.isLowerThan(role)) {
        folderUser.role = role;
        return await this.updateFolderUser(folderUser);
      }
      return folderUser;
    }

    const newFolderUser = new CnFolderUserEntity();
    newFolderUser.rootFolderId = rootFolderId;
    newFolderUser.userId = userId;
    newFolderUser.role = role;
    newFolderUser.sharedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    newFolderUser.sharedAt = ClDateHelper.getDate();
    return await this.getEntityManager(entityManager).save(newFolderUser);
  }

  public async unshareRootFolderFromUser(
    rootFolderId: string,
    userId: string,
    entityManager?: EntityManager
  ): Promise<DeleteResult> {
    if (await this.userIsLastOwner(rootFolderId, userId)) {
      throw new BlBadRequestException(CnErrorText.CANT_UNSHARE_LAST_FOLDER_OWNER);
    }
    return this.getEntityManager(entityManager).delete(CnFolderUserEntity, {
      rootFolderId: rootFolderId,
      userId: userId,
    });
  }

  public async updateRootFolderUserRole(
    rootFolderId: string,
    userId: string,
    role: CnRootFolderUserRole,
    entityManager?: EntityManager
  ): Promise<CnFolderUser> {
    if (await this.userIsLastOwner(rootFolderId, userId)) {
      throw new BlBadRequestException(CnErrorText.CANT_UPDATE_LAST_OWNER_ROLE);
    }
    const folderUser = await this.findByRootFolderIdAndUserIdAndCheck(rootFolderId, userId);

    folderUser.role = role;
    return await this.updateFolderUser(folderUser, entityManager);
  }

  private async userIsLastOwner(rootFolderId: string, userId: string): Promise<boolean> {
    // check if the user is the last owner of the folder
    const folderOwners = await this.repository.find({
      where: { rootFolderId: rootFolderId, role: CnRootFolderUserRole.OWNER },
    });

    return folderOwners.length === 1 && folderOwners[0].userId === userId;
  }

  public async findUsersByRootFolderId(rootFolderId: string): Promise<CnUser[]> {
    const folderUsers = await this.findByRootFolderId(rootFolderId);
    return folderUsers.map((folderUser) => folderUser.user);
  }

  public async findByRootFolderId(rootFolderId: string): Promise<CnFolderUser[]> {
    return await this.repository.find({ where: { rootFolderId: rootFolderId } });
  }

  public async findByRootFolderIdWithSharedBy(rootFolderId: string): Promise<CnFolderUserWithSharedBy[]> {
    return await this.repository.find({
      where: { rootFolderId: rootFolderId },
      relations: { sharedBy: true },
    });
  }

  public async findByRootFolderIdAndUserIdAndCheckWithSharedBy(
    rootFolderId: string,
    userId: string
  ): Promise<CnFolderUserWithSharedBy> {
    const userFolder = await this.repository.findOne({
      where: { rootFolderId: rootFolderId, userId: userId },
      relations: { sharedBy: true },
    });
    if (!userFolder) {
      throw new BlBadRequestException('The user is not a member of the folder');
    }
    return userFolder;
  }

  public findByRootFolderIdAndUserId(rootFolderId: string, userId: string): Promise<CnFolderUser | null> {
    return this.repository.findOne({ where: { rootFolderId: rootFolderId, userId: userId } });
  }

  public async findByRootFolderIdAndUserIdAndCheck(
    rootFolderId: string,
    userId: string
  ): Promise<CnFolderUser> {
    const userFolder = await this.findByRootFolderIdAndUserId(rootFolderId, userId);
    if (!userFolder) {
      throw new BlBadRequestException('The user is not a member of the folder');
    }
    return userFolder;
  }

  public updateFolderUser(folderUser: CnFolderUser, entityManager?: EntityManager): Promise<CnFolderUser> {
    return this.getEntityManager(entityManager).save(CnFolderUserEntity, folderUser);
  }

  public async smartSearchByName(
    rootFolderId: string,
    name: string,
    page: number,
    size: number
  ): Promise<ClPage<CnFolderUser>> {
    if (ClHelpService.isNullOrEmpty(name)) {
      return this.findPaginated(page, size, { where: { rootFolderId: rootFolderId } });
    }

    const folderUserSearch = new CnFolderUserSearch(this, rootFolderId);
    return folderUserSearch.smartSearchByName(name, page, size);
  }
}
