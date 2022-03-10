import {Injectable} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnGroupOrganization} from '../cn-groups/cn-group.entity';
import {CnGroupType} from '../cn-groups/cn-group-type.enum';

@Injectable()
export class CnOrganizationsService extends BlAbstractService<CnOrganization> {

  constructor(@InjectRepository(CnOrganization) private repository: Repository<CnOrganization>,
              private groupService: CnGroupsService) {
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
}
