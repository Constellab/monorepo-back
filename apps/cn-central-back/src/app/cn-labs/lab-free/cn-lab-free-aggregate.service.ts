import { Injectable } from '@nestjs/common';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { CnLab } from '../cn-lab.entity';
import { DataSource, EntityManager } from 'typeorm';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLabAggregateService } from '../cn-lab-aggregate.service';
import { CnLabFreeCreateDto, CnLabFreeGetDto, CnLabFreeUpdateDto } from './cn-lab-free.dto';
import { CnLabFreeService } from './cn-lab-free.service';
import { CnLabFree } from './cn-lab-free.entity';
import { CnLabStatus } from '../status/cn-lab-status.enum';
import { CnLabFactoryData, CnLabFactoryService } from '../cn-lab-factory.service';
import { CnSpace } from '../../cn-spaces/cn-space.entity';

/**
 * Service to configure and manage the free lab for users
 */
@Injectable()
export class CnLabFreeAggregateService {


  constructor(private labFreeService: CnLabFreeService,
              private datasource: DataSource,
              private labAggregateService: CnLabAggregateService,
              private labFactoryService: CnLabFactoryService) {
  }

  public async createFreeLabCurrentUser(): Promise<CnLab> {
    return await this.createFreeLabEntity(CnCurrentUserHelper.getAndCheckCurrentUser(),
      CnCurrentUserHelper.getAndCheckCurrentSpace());
  }

  public async createFreeLab(labFreeCreateDto: CnLabFreeCreateDto): Promise<CnLab> {
    if(!CnCurrentUserHelper.isAdmin()){
      throw new BlUnauthorizedException();
    }

    return await this.createFreeLabEntity(labFreeCreateDto.user, labFreeCreateDto.space);
  }

  private async createFreeLabEntity(user: CnUser, space: CnSpace): Promise<CnLab> {
    const labFree = await this.labFreeService.findFreeLabForUser(user.id);
    if (labFree != null) {
      throw new BlBadRequestException(
        'You already have a free lab, you can\'t create another free lab.');
    }

    if (space.isEntrepriseSpace()) {
      throw new BlBadRequestException('You cannot create a free lab in an entreprise space');
    }

    const data: CnLabFactoryData = {
      name: user.firstname + ' lab',
      user: user,
      space: space,
      domain: CnLabFree.DOMAIN,
      volumeSize: CnLabFree.VOLUME_SIZE,
      volumeType: CnLabFree.VOLUME_TYPE,
      billingMode: CnLabFree.BILLING_MODE,
      cloudProvider: {
        name: CnLabFree.CLOUD_PROVIDER,
        region: CnLabFree.CLOUD_PROVIDER_REGION,
        instanceType: CnLabFree.CLOUD_PROVIDER_INSTANCE_TYPE
      },
      bricks: CnLabFree.BRICKS.map(brick => ({ name: brick })),
      isFreeLab: true
    };

    const labDb = await this.datasource.transaction(async (entityManager) => {
      const labDb = await this.labFactoryService.createLab(data, entityManager);

      await this.markFreeLabAsStarted(user, labDb, entityManager);

      return labDb;
    });

    // init the server asynchronously
    await this.labAggregateService.initServer(labDb.id);

    return labDb;
  }

  private async markFreeLabAsStarted(user: CnUser, lab: CnLab, entityManager: EntityManager): Promise<void> {
    await this.labFreeService.createFreeLab(user, lab, CnLabFree.HOUR_LIMIT, entityManager);
  }

  public findFreeLabUsageForCurrentUser(): Promise<CnLabFreeGetDto> {
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    return this.labFreeService.findFreeLabUsageForUser(user.id);
  }

  public findFreeLabUsageForUserAndCheck(userId: string): Promise<CnLabFreeGetDto> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException('You are not allowed to access this resource');
    }
    return this.labFreeService.findFreeLabUsageForUser(userId);
  }

  public async findFreeLabUsageForLabAndCheck(labId: string): Promise<CnLabFreeGetDto> {
    // check that the user can get the lab
    await this.labAggregateService.findByIdAndCheck(labId);

    return this.labFreeService.findFreeLabUsageForLab(labId);
  }

  public updateFreeLab(id: string, updateDTO: CnLabFreeUpdateDto): Promise<CnLabFreeGetDto> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException('You are not allowed to modify this resource');
    }

    return this.labFreeService.updateFreeLab(id, updateDTO);
  }

  public async deleteFreeLab(id: string): Promise<CnLabFreeGetDto> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException('You are not allowed to modify this resource');
    }

    const labFree = await this.labFreeService.findByIdAndCheck(id);

    const user = labFree.user;

    if (labFree.lab && labFree.lab.currentStatus.status !== CnLabStatus.NO_SERVER) {
      throw new BlBadRequestException('The lab must be deleted before deleting the free lab info');
    }

    await this.labFreeService.deleteById(id);

    return this.labFreeService.findFreeLabUsageForUser(user.id);
  }
}
