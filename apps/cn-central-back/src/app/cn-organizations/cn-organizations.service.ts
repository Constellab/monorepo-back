import {BadRequestException, Injectable} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnGroupOrganization} from '../cn-groups/cn-group.entity';
import {CnGroupType} from '../cn-groups/cn-group-type.enum';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnUsersService} from '../cn-users/cn-users.service';
import {ClPage} from '@monorepo/core-lib';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';

@Injectable()
export class CnOrganizationsService extends BlAbstractService<CnOrganization> {

  constructor(@InjectRepository(CnOrganization) private repository: Repository<CnOrganization>,
              private groupService: CnGroupsService, private userService: CnUsersService) {
    super(repository, CnOrganization);
  }


  async create(entity: CnOrganization, entityManager?: EntityManager): Promise<CnOrganization> {
    entityManager = this.getEntityManager(entityManager);
    const organization = await super.create(entity, entityManager);

    await this.createOrganizationGroup(organization, entityManager);

    return organization;
  }

  private async createOrganizationGroup(organization: CnOrganization, entityManager: EntityManager): Promise<CnGroupOrganization> {
    const group = new CnGroupOrganization();
    group.type = CnGroupType.ORGANIZATION;
    group.organization = organization;
    group.label = organization.label;

    return await this.groupService.create(group, entityManager) as CnGroupOrganization;
  }


  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const users = await this.getUsersOfOrganization(id, 0, 1);

    if (users.totalElements > 0) {
      throw new BadRequestException('Can\'t delete the organization because there are users linked to it');
    }
    return super.deleteById(id, entityManager);
  }

  protected async updateWithCompare(newEntity: CnOrganization, dbEntity: CnOrganization,
                                    entityManager?: EntityManager): Promise<CnOrganization> {
    entityManager = this.getEntityManager(entityManager);

    const orga = super.updateWithCompare(newEntity, dbEntity, entityManager);

    // update the associated group label when label is updated
    if (newEntity.label !== dbEntity.label) {
      const group = dbEntity.group;
      group.label = newEntity.label;
      await this.groupService.update(group, entityManager);
    }

    return orga;
  }

  public async getAll(page: number, size: number): Promise<ClPage<CnOrganization>> {
    return this.findPaginated(page, size, {order: {label: 'ASC'}});
  }

  public async addUserToOrganization(organizationId: string, userId: string): Promise<CnUser> {
    const user = await this.userService.findByIdAndCheck(userId);

    if (user.organizationId === organizationId) {
      throw new BadRequestException(CnErrorText.USER_ALREADY_IN_ORGANIZATION);
    }

    user.organizationId = organizationId;
    return this.userService.update(user);
  }

  public async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    const user = await this.userService.findByIdAndCheck(userId);

    if (user.organizationId !== organizationId) {
      throw new BadRequestException('The user is not the organization');
    }

    user.organizationId = null;
    await this.userService.update(user);
  }

  public async getUsersOfOrganization(organizationId: string, page: number, size: number): Promise<ClPage<CnUser>> {
    return this.userService.getUsersByOrganization(organizationId, page, size);
  }
}
