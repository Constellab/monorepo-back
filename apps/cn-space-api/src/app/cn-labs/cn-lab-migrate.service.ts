import { BlVersion } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnBrickGWS, CnBrickVersionDTO } from '../cn-bricks/cn-brick.dto';
import { CnLabManagerStatus } from '../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabStatusDTO } from './cn-lab.dto';
import { CnLab } from './cn-lab.entity';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnLabsService } from './cn-labs.service';
import { CnLabConfigurerService } from './server/cn-lab-configurer.service';
import { CnLabServerTaskStatus } from './status/cn-lab-status.enum';

@Injectable()
export class CnLabMigrateService {
  private static readonly LAB_MANAGER_MIGRATION_VERSION = '2.0.0';

  private readonly logger = new Logger(CnLabMigrateService.name);

  constructor(
    private labManagerService: CnLabManagerService,
    private labConfigurerService: CnLabConfigurerService,
    private labAggregateService: CnLabAggregateService,
    private labService: CnLabsService
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
      return this.migrateToLabManagerV2Async(labId, version);
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

  public async migrateToLabManagerV2Async(labId: string, version?: string): Promise<CnLabStatusDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    await this.labService.updateServerTask(
      lab.id,
      `Migrating to Lab Manager v2`,
      CnLabServerTaskStatus.RUNNING
    );

    this.migrateToLabManagerV2(lab, version)
      .then(() =>
        this.labService.updateServerTask(
          lab.id,
          `Migration to lab manager v2 successfull`,
          CnLabServerTaskStatus.SUCCESS
        )
      )
      .catch(
        // if an error occurred we just refresh the lab status
        (error: Error) =>
          this.labService.updateServerTask(
            lab.id,
            `Migration to lab manager v2 failed: ${error}`,
            CnLabServerTaskStatus.ERROR
          )
      )
      .catch((error) => this.logger.error(`Error updating server task after migration failure: ${error}`));

    return this.getStatus(lab);
  }

  private async migrateToLabManagerV2(lab: CnLab, version?: string): Promise<void> {
    // Delete main services
    await this.labManagerService.oldDeleteContainers(lab).catch((error) => {
      // log the error but continue the migration
      console.error(`Error deleting old containers: ${error}, continuing migration...`);
    });

    // Update the brick version
    const brickVersions: CnBrickVersionDTO[] = [
      { name: CnBrickGWS.GWS_CORE, version: '0.17.0' },
      { name: CnBrickGWS.GWS_BIOTA, version: '0.9.0' },
      { name: CnBrickGWS.GWS_UBIOME, version: '0.13.0' },
      { name: CnBrickGWS.GWS_OMIX, version: '0.12.0' },
    ];

    await this.labService.updateServerTask(lab.id, `Updating brick versions`, CnLabServerTaskStatus.RUNNING);
    await this.labAggregateService.updateBricksToMinimumVersion(lab.id, {
      brickVersions,
    });

    // Stop the lab
    await this.labService.updateServerTask(
      lab.id,
      `Stopping global docker container`,
      CnLabServerTaskStatus.RUNNING
    );
    await this.labConfigurerService.composeDown(lab);

    // Run migration
    await this.labService.updateServerTask(
      lab.id,
      `Running permission migration`,
      CnLabServerTaskStatus.RUNNING
    );
    await this.labConfigurerService.migrateAccessRight(lab);

    // Start the lab
    await this.labService.updateServerTask(
      lab.id,
      `Starting global docker container`,
      CnLabServerTaskStatus.RUNNING
    );
    await this.labConfigurerService.composeUp(lab);

    // Update lab manager to latest version
    await this.labService.updateServerTask(
      lab.id,
      `Updating lab manager to version ${version ?? CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION}`,
      CnLabServerTaskStatus.RUNNING
    );
    await this.labConfigurerService.updateLabManager(
      lab,
      version ?? CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION
    );
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
