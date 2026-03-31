import { BlBadRequestException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnSettingsService } from '../../cn-settings/cn-settings.service';
import { CnSpace } from '../../cn-spaces/cn-space.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLab } from '../cn-lab.entity';
import { CnLabAggregateService } from '../cn-lab-aggregate.service';
import { CnLabFactoryData, CnLabFactoryService } from '../cn-lab-factory.service';
import { CnLabStatus } from '../status/cn-lab-status.enum';
import { CnLabFreeCreateDto, CnLabFreeGetDto, CnLabFreeUpdateDto } from './cn-lab-free.dto';
import { CnLabFreeService } from './cn-lab-free.service';

/**
 * Service to configure and manage the free lab for users
 */
@Injectable()
export class CnLabFreeAggregateService {
  constructor(
    private labFreeService: CnLabFreeService,
    private datasource: DataSource,
    private labAggregateService: CnLabAggregateService,
    private labFactoryService: CnLabFactoryService,
    private settingsService: CnSettingsService
  ) {}

  public async createFreeLabCurrentUser(): Promise<CnLab> {
    return await this.createFreeLabEntity(
      CnCurrentUserHelper.getAndCheckCurrentUser(),
      CnCurrentUserHelper.getAndCheckCurrentSpace()
    );
  }

  public async createFreeLab(labFreeCreateDto: CnLabFreeCreateDto): Promise<CnLab> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }

    return await this.createFreeLabEntity(labFreeCreateDto.user, labFreeCreateDto.space);
  }

  private async createFreeLabEntity(user: CnUser, space: CnSpace): Promise<CnLab> {
    const labFree = await this.labFreeService.findFreeLabForUser(user.id);
    if (labFree != null) {
      throw new BlBadRequestException("You already have a free lab, you can't create another free lab.");
    }

    if (space.isEntrepriseSpace()) {
      throw new BlBadRequestException('You cannot create a free lab in an entreprise space');
    }

    const config = await this.settingsService.getFreeLabConfig();

    const data: CnLabFactoryData = {
      name: user.firstname + ' lab',
      user: user,
      space: space,
      domain: config.domain,
      volumeSize: config.volumeSize,
      volumeType: config.volumeType,
      billingMode: config.billingMode,
      cloudProvider: {
        name: config.cloudProvider,
        region: config.cloudProviderRegion,
        instanceType: config.cloudProviderInstanceType,
      },
      bricks: config.bricks.map((brick) => ({ name: brick })),
      isFreeLab: true,
      greenOption: {
        type: config.greenOption,
        inactivityDuration: config.greenOptionInactivityDuration,
      },
    };

    const labDb = await this.datasource.transaction(async (entityManager) => {
      const labDb = await this.labFactoryService.createLab(data, entityManager);

      await this.markFreeLabAsStarted(user, labDb, config.hourLimit, entityManager);

      return labDb;
    });

    // init the server asynchronously
    await this.labAggregateService.initServer(labDb.id);

    return labDb;
  }

  private async markFreeLabAsStarted(
    user: CnUser,
    lab: CnLab,
    hourLimit: number,
    entityManager: EntityManager
  ): Promise<void> {
    await this.labFreeService.createFreeLab(user, lab, hourLimit, entityManager);
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
