import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnSpaceUser, CnSpaceUserRole} from './cn-space-user.entity';
import {EntityManager, Repository} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnSpace} from './cn-space.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService} from '@monorepo/back-core-lib';

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
                              role: CnSpaceUserRole,
                              entityManager?: EntityManager): Promise<CnSpaceUser> {
    if (await this.userIsSpaceMember(space.id, user.id)) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_IN_SPACE);
    }

    const spaceUser = new CnSpaceUser();
    spaceUser.user = user;
    spaceUser.space = space;
    spaceUser.role = role;
    spaceUser.active = true;
    return await this.getEntityManager(entityManager).save(spaceUser);
  }

  public async removeUserFromSpace(spaceId: string, userId: string): Promise<void> {
    if (!(await this.userIsSpaceMember(spaceId, userId))) {
      throw new BadRequestException(CnErrorText.USER_NOT_IN_SPACE);
    }
    await this.repository.delete({userId: userId, spaceId: spaceId});
  }

  public async activateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUSer = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUSer.active) {
      throw new BadRequestException('The user is already active');
    }
    spaceUSer.active = true;
    return this.repository.save(spaceUSer);
  }

  public async deactivateUser(spaceId: string, userId: string): Promise<CnSpaceUser> {
    const spaceUser = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (!spaceUser.active) {
      throw new BadRequestException('The user is already inactive');
    }
    spaceUser.active = false;
    return this.repository.save(spaceUser);
  }

  public async updateUserRole(spaceId: string, userId: string, role: CnSpaceUserRole): Promise<CnSpaceUser> {
    const spaceUSer = await this.findOneBySpaceIdAndUserId(spaceId, userId);

    if (spaceUSer.role === role) {
      throw new BadRequestException('The user already has the role ' + role);
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

  public async getSpaceUsers(spaceId: string, page: number, size: number): Promise<ClPage<CnUser>> {
    return (await this.findBySpace(spaceId, page, size)).map((spaceUser) => spaceUser.user);
  }

  public async getSpacesOfUser(userId: string): Promise<CnSpace[]> {
    const spaceUsers = await this.repository.find({where: {userId}, relations: {space: true}});
    return spaceUsers.map((spaceUser) => spaceUser.space);
  }

  public async getUserDefaultSpace(userId: string): Promise<CnSpace | null> {
    const spaceUser = await this.repository.findOne({where: {userId}, relations: {space: true}});
    if(spaceUser == null) {
      throw new BadRequestException(CnErrorText.USER_WITHOUT_SPACE);
    }

    return spaceUser.space;
  }

  public async findUserBySpaceIdAndId(spaceId: string, userId: string): Promise<CnUser>{
    const spaceUser: CnSpaceUser = await this.repository.findOne({
      where:{
        userId: userId,
        spaceId: spaceId
      },
      relations: {user: true}
    });
    return spaceUser.user;
  }
}
