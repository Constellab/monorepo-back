import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnSpaceUser, CnSpaceUserRole} from './cn-space-user.entity';
import {EntityManager, Like, Repository} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpace, CnSpaceType} from './cn-space.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {ClPage} from '@monorepo/core-lib';
import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlSearchBuilder,
  BlSearchParams
} from '@monorepo/back-core-lib';

@Injectable()
export class CnSpaceUserService extends BlAbstractPaginatedService<CnSpaceUser> {

  constructor(@InjectRepository(CnSpaceUser) private repository: Repository<CnSpaceUser>) {
    super(repository, CnSpaceUser);
  }

  public async findOneBySpaceIdAndUserId(spaceId: string, userId: string): Promise<CnSpaceUser | null> {
    return this.repository.findOne({where: {userId, spaceId: spaceId}});
  }

  public async findOneBySpaceIdAndUserEmail(spaceId: string, email: string): Promise<CnSpaceUser | null> {
    return this.repository.findOne(
      {
        where: {
          spaceId: spaceId,
          user: {email: email}
        },
        relations: {user: true}
      }
    );
  }

  public async userIsSpaceMember(spaceId: string, userId: string): Promise<boolean> {
    return await this.findOneBySpaceIdAndUserId(spaceId, userId) != null;
  }


  public async addUserToSpace(space: CnSpace, user: CnUser,
                              role: CnSpaceUserRole, addedBy: CnUser,
                              entityManager?: EntityManager): Promise<CnSpaceUser> {
    if (await this.userIsSpaceMember(space.id, user.id)) {
      throw new BlBadRequestException(CnErrorText.USER_ALREADY_IN_SPACE);
    }

    const spaceUser = new CnSpaceUser();
    spaceUser.user = user;
    spaceUser.space = space;
    spaceUser.role = role;
    spaceUser.active = true;
    spaceUser.addedBy = addedBy;
    return await this.getEntityManager(entityManager).save(spaceUser);
  }

  public async removeUserFromSpace(spaceId: string, userId: string): Promise<void> {
    if (!(await this.userIsSpaceMember(spaceId, userId))) {
      throw new BlBadRequestException(CnErrorText.USER_NOT_IN_SPACE);
    }
    await this.repository.delete({userId: userId, spaceId: spaceId});
  }

  public async activateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUSer = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUSer.active) {
      throw new BlBadRequestException('The user is already active');
    }
    spaceUSer.active = true;
    return this.repository.save(spaceUSer);
  }

  public async deactivateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (!spaceUser.active) {
      throw new BlBadRequestException('The user is already inactive');
    }
    spaceUser.active = false;
    return this.repository.save(spaceUser);
  }

  public async updateUserRole(spaceId: string, userId: string, role: CnSpaceUserRole): Promise<CnSpaceUser> {
    const spaceUSer = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUSer.role === role) {
      throw new BlBadRequestException('The user already has the role ' + role);
    }

    spaceUSer.role = role;
    return this.repository.save(spaceUSer);
  }

  public async getSpaceAdmins(spaceId: string): Promise<CnSpaceUser[]> {
    return this.repository.find({where: {spaceId: spaceId, role: CnSpaceUserRole.ADMIN}});
  }

  /**
   * Return true if the user is the only admin of the space
   */
  public async isOnlyAdmin(spaceId: string, userId: string): Promise<boolean> {
    const admins = await this.getSpaceAdmins(spaceId);
    return admins.length === 1 && admins[0].userId === userId;
  }

  public async findBySpace(spaceId: string, page: number, size: number): Promise<ClPage<CnSpaceUser>> {
    return await this.findPaginated(page, size, {
      where: {spaceId: spaceId},
      relations: {user: true}
    });
  }

  public async searchUser(spaceId: string, searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<CnSpaceUser>> {
    const searchBuilder = new BlSearchBuilder<CnSpaceUser>();
    searchBuilder.addSearchParams(searchParams);
    searchBuilder.mergeWhereOptions({spaceId: spaceId});
    searchBuilder.setRelations({user: true});

    return await this.findPaginated(page, size, searchBuilder.build());
  }

  public async findAllSpaceUserIds(spaceId: string): Promise<string[]> {
    const spaceUsers = await this.repository.find({
      where: {spaceId: spaceId},
    });
    return spaceUsers.map((spaceUser) => spaceUser.userId);
  }

  public async getSpacesOfUser(userId: string): Promise<CnSpace[]> {
    const spaceUsers = await this.repository.find({where: {userId}, relations: {space: true}});
    return spaceUsers.map((spaceUser) => spaceUser.space);
  }

  public async getUserDefaultSpaceAndCheck(userId: string): Promise<CnSpace> {
    const space = await this.getUserDefaultSpace(userId);
    if (space == null) {
      throw new BlBadRequestException(CnErrorText.USER_WITHOUT_SPACE);
    }

    return space;
  }

  public async getUserDefaultSpace(userId: string): Promise<CnSpace | null> {
    const spaceUser = await this.repository.findOne({
      where: {
        userId: userId,
        space: {type: CnSpaceType.PERSONAL}
      },
      relations: {space: true}
    });

    if (spaceUser == null) return null;
    return spaceUser.space;
  }

  public async checkUsersHaveCommonSpace(userAId: string, userBId: string): Promise<boolean> {
    const userASpaces: CnSpace[] = await this.getSpacesOfUser(userAId);
    const userBSpaces: CnSpace[] = await this.getSpacesOfUser(userBId);

    //Check common space
    if (userASpaces.find((space) => userBSpaces.find((spaceB) => spaceB.id === space.id)) == null) {
      return false;
    }
    return true;
  }


  public async checkIfGetUserIsAllowed(userId: string, currentUserId: string): Promise<boolean> {
    if (await this.checkUsersHaveCommonSpace(userId, currentUserId)) {
      return true;
    } else {
      return false;
    }
  }

  // Search by name
  public async smartSearchByName(spaceId: string, name: string, page: number, size: number): Promise<ClPage<CnSpaceUser>> {

    if (!name.includes(' ')) {
      return this.searchByLastnameOrFirstname(spaceId, name, page, size);
    }

    // if there are 2 words, search by lastname and firstname
    // if nothing is found, search by lastname or firstname
    const names = name.split(' ');
    if (names.length === 2) {
      const result = await this.searchByLastnameAndFirstname(spaceId, names[0], names[1], page, size);

      if (result.totalElements > 0) {
        return result;
      }
    }

    return this.searchByLastnameOrFirstname(spaceId, name, page, size);
  }

  public searchByLastnameOrFirstname(spaceId: string, name: string,
                                     page: number, size: number): Promise<ClPage<CnSpaceUser>> {
    return this.findPaginated(page, size, {
      where: [
        {user: {lastname: Like(`%${name}%`)}, spaceId: spaceId},
        {user: {firstname: Like(`%${name}%`)}, spaceId: spaceId},
      ],
      relations: {user: true},
      order: {user: {firstname: 'ASC', lastname: 'ASC'}}
    });
  }

  public async searchByLastnameAndFirstname(spaceId: string, name1: string, name2: string,
                                            page: number, size: number): Promise<ClPage<CnSpaceUser>> {
    return this.findPaginated(page, size, {
      where: [{
        user: {
          lastname: Like(`%${name1}%`),
          firstname: Like(`%${name2}%`)
        }, spaceId: spaceId
      }, {
        user: {
          lastname: Like(`%${name2}%`),
          firstname: Like(`%${name1}%`)
        }, spaceId: spaceId
      }],
      relations: {user: true},
      order: {user: {firstname: 'ASC', lastname: 'ASC'}}
    });
  }
}
