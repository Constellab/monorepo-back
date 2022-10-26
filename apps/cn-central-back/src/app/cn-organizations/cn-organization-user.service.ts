import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnOrganizationUser, CnOrganizationUserRole} from './cn-organization-user.entity';
import {EntityManager, Repository} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnOrganization} from './cn-organization.entity';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService} from '@monorepo/back-core-lib';

@Injectable()
export class CnOrganizationUserService extends BlAbstractPaginatedService<CnOrganizationUser> {

  constructor(@InjectRepository(CnOrganizationUser) private repository: Repository<CnOrganizationUser>) {
    super(repository, CnOrganizationUser);
  }

  public async findOneByOrganizationIdAndUserId(organizationId: string, userId: string): Promise<CnOrganizationUser | null> {
    return this.repository.findOne({where: {userId, organizationId}});
  }

  public async findOneByOrganizationIdAndUserEmail(organizationId: string, email: string): Promise<CnOrganizationUser | null> {
    return this.repository.findOne(
      {
        where: {
          organizationId: organizationId,
          user: {email: email}
        },
        relations: {user: true}
      }
    );
  }

  public async userIsOrganizationMember(organizationId: string, userId: string): Promise<boolean> {
    return await this.findOneByOrganizationIdAndUserId(organizationId, userId) != null;
  }


  public async addUserToOrganization(organization: CnOrganization, user: CnUser,
                                     role: CnOrganizationUserRole,
                                     entityManager?: EntityManager): Promise<CnOrganizationUser> {
    if (await this.userIsOrganizationMember(organization.id, user.id)) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_IN_ORGANIZATION);
    }

    const organizationUser = new CnOrganizationUser();
    organizationUser.user = user;
    organizationUser.organization = organization;
    organizationUser.role = role;
    organizationUser.active = true;
    return await this.getEntityManager(entityManager).save(organizationUser);
  }

  public async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    if (!(await this.userIsOrganizationMember(organizationId, userId))) {
      throw new BadRequestException(CnErrorText.USER_NOT_IN_ORGANIZATION);
    }
    await this.repository.delete({userId: userId, organizationId: organizationId});
  }

  public async activateUser(organizationId: string, userId: string): Promise<CnOrganizationUser> {
    const organizationUser = await this.findOneByOrganizationIdAndUserId(organizationId, userId);

    if (organizationUser.active) {
      throw new BadRequestException('The user is already active');
    }
    organizationUser.active = true;
    return this.repository.save(organizationUser);
  }

  public async deactivateUser(organizationId: string, userId: string): Promise<CnOrganizationUser> {
    const organizationUser = await this.findOneByOrganizationIdAndUserId(organizationId, userId);

    if (!organizationUser.active) {
      throw new BadRequestException('The user is already inactive');
    }
    organizationUser.active = false;
    return this.repository.save(organizationUser);
  }

  public async updateUserRole(organizationId: string, userId: string, role: CnOrganizationUserRole): Promise<CnOrganizationUser> {
    const organizationUser = await this.findOneByOrganizationIdAndUserId(organizationId, userId);

    if (organizationUser.role === role) {
      throw new BadRequestException('The user already has the role ' + role);
    }

    organizationUser.role = role;
    return this.repository.save(organizationUser);
  }

  public async getOrganizationAdmins(organizationId: string): Promise<CnOrganizationUser[]> {
    return this.repository.find({where: {organizationId, role: CnOrganizationUserRole.ADMIN}});
  }

  /**
   * Return true if the user is the only admin of the organization
   */
  public async isOnlyAdmin(organizationId: string, userId: string): Promise<boolean> {
    const admins = await this.getOrganizationAdmins(organizationId);
    return admins.length === 1 && admins[0].userId === userId;
  }

  public async getUsersOfOrganization(organizationId: string, page: number, size: number): Promise<ClPage<CnOrganizationUser>> {
    return await this.findPaginated(page, size, {
      where: {organizationId},
      relations: {user: true}
    });
  }

  public async getOrganizationsOfUser(userId: string): Promise<CnOrganization[]> {
    const organizationUsers = await this.repository.find({where: {userId}, relations: {organization: true}});
    return organizationUsers.map((organizationUser) => organizationUser.organization);
  }
}
