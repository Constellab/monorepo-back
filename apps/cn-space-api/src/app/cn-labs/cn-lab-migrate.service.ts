import { BlVersion } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';

import { CnBrickGWS, CnBrickVersionDTO } from '../cn-bricks/cn-brick.dto';
import { CnLabManagerStatus } from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabStatusDTO } from './cn-lab.dto';
import { CnLab } from './cn-lab.entity';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnLabConfigurerService } from './server/cn-lab-configurer.service';

@Injectable()
export class CnLabMigrateService {
  private static readonly LAB_MANAGER_MAIN_COMPOSE_BRICK_NAME = 'gws_core';
  private static readonly LAB_MANAGER_MAIN_COMPOSE_UNIQUE_NAME = 'main';
  private static readonly LAB_MANAGER_MIGRATION_VERSION = '2.0.0';

  constructor(
    private labManagerService: CnLabManagerService,
    private labConfigurerService: CnLabConfigurerService,
    private labAggregateService: CnLabAggregateService
  ) {}

  public async updateLabManager(labId: string, version: string): Promise<CnLabStatusDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);

    let labManagerStatus: CnLabManagerStatus;
    try {
      labManagerStatus = await this.labManagerService.getLabStatus(lab);
    } catch {
      return this.labAggregateService.updateLabManager(labId, version);
    }

    const currentVersion = BlVersion.fromString(labManagerStatus.version);
    const newVersion = BlVersion.fromString(version);
    const migrationVersionObject = BlVersion.fromString(CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION);

    // if the lab manager version is lower than the migration version
    // and the desired version is at least the migration version
    if (
      currentVersion.isLowerThan(migrationVersionObject) &&
      newVersion.isGreaterThanOrEqualTo(migrationVersionObject)
    ) {
      return this.migrateToLabManagerV2(labId, version);
    } else {
      return this.labAggregateService.updateLabManager(labId, version);
    }
  }

  public async migrateToGithub(labId: string): Promise<CnLabStatusDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    await this.labConfigurerService.migrateToGithub(lab);
    return this.getStatus(lab);
  }

  public async migrateToDnsChallenge(labId: string): Promise<CnLabStatusDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    await this.labConfigurerService.migrateToDnsChallenge(lab);
    return this.getStatus(lab);
  }

  public async migrateToLabManagerV2(labId: string, version?: string): Promise<CnLabStatusDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    // Delete main services
    await this.labManagerService.deleteServices(
      lab,
      CnLabMigrateService.LAB_MANAGER_MAIN_COMPOSE_BRICK_NAME,
      CnLabMigrateService.LAB_MANAGER_MAIN_COMPOSE_UNIQUE_NAME
    );

    // Update the brick version
    const brickVersions: CnBrickVersionDTO[] = [
      { name: CnBrickGWS.GWS_CORE, version: '0.17.0' },
      { name: CnBrickGWS.GWS_BIOTA, version: '0.9.0' },
      { name: CnBrickGWS.GWS_UBIOME, version: '0.13.0' },
      { name: CnBrickGWS.GWS_OMIX, version: '0.12.0' },
    ];
    await this.labAggregateService.updateBricksToMinimumVersion(labId, {
      brickVersions,
    });

    // Stop the lab
    await this.labConfigurerService.composeDown(lab);

    // Run migration
    await this.labConfigurerService.migrateAccessRight(lab);

    // Start the lab
    await this.labConfigurerService.composeUp(lab);

    // Update lab manager to latest version
    await this.labAggregateService.updateLabManager(
      labId,
      version ?? CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION
    );

    return this.getStatus(lab);
  }

  private async getStatus(lab: CnLab): Promise<CnLabStatusDTO> {
    return this.labAggregateService.getLabStatus(lab.id);
  }

  private checkServerIsRunning(lab: CnLab): void {
    if (lab.serverIsStopped()) {
      throw new Error('Server is stopped, please start the server first');
    }
  }
}
