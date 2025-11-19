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
  private static readonly LAB_MANAGER_MIGRATION_VERSION_2_0_0 = '2.0.0';
  private static readonly LAB_MANAGER_MIGRATION_VERSION_2_3_0 = '2.3.0';

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

    // Determine which migrations need to be run
    const migrationsToRun = this.getMigrationsToRun(currentVersion, newVersion);

    if (migrationsToRun.length > 0) {
      return this.runMigrationsAsync(labId, version, migrationsToRun);
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

  /**
   * Run migrations asynchronously in background
   * @param labId - Lab ID
   * @param targetVersion - Target version to update to after migrations
   * @param migrations - Array of migration versions to run in order
   */
  public async runMigrationsAsync(
    labId: string,
    targetVersion: string,
    migrations: string[]
  ): Promise<CnLabStatusDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    const migrationList = migrations.join(' -> ');
    await this.labService.updateServerTask(
      lab.id,
      `Migrating Lab Manager: ${migrationList}`,
      CnLabServerTaskStatus.RUNNING
    );

    this.runMigrations(lab, targetVersion, migrations)
      .then(() =>
        this.labService.updateServerTask(
          lab.id,
          `Migration successful: ${migrationList}`,
          CnLabServerTaskStatus.SUCCESS
        )
      )
      .catch((error: Error) =>
        this.labService.updateServerTask(
          lab.id,
          `Migration failed: ${error.message}`,
          CnLabServerTaskStatus.ERROR
        )
      )
      .catch((err: unknown) =>
        this.logger.error(`Error updating server task after migration failure: ${String(err)}`)
      );

    return this.getStatus(lab);
  }

  /**
   * @deprecated Use runMigrationsAsync instead
   */
  public async migrateToLabManagerV2Async(labId: string, version?: string): Promise<CnLabStatusDTO> {
    return this.runMigrationsAsync(
      labId,
      version ?? CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_0_0,
      [CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_0_0]
    );
  }

  /**
   * Determine which migrations need to be run based on current and target versions
   */
  private getMigrationsToRun(currentVersion: BlVersion, targetVersion: BlVersion): string[] {
    const migrations: string[] = [];
    const v2_0_0 = BlVersion.fromString(CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_0_0);
    const v2_3_0 = BlVersion.fromString(CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_3_0);

    // If upgrading to 2.0.0 or higher and currently below 2.0.0
    // Note: 2.0.0 migration already includes 2.3.0 changes, so no need to run 2.3.0 separately
    if (currentVersion.isLowerThan(v2_0_0) && targetVersion.isGreaterThanOrEqualTo(v2_0_0)) {
      migrations.push(CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_0_0);
    }
    // If upgrading to 2.3.0 or higher and currently >= 2.0.0 but < 2.3.0
    // Only run 2.3.0 migration if we're coming from a version that's already on 2.0.0+
    else if (
      currentVersion.isGreaterThanOrEqualTo(v2_0_0) &&
      currentVersion.isLowerThan(v2_3_0) &&
      targetVersion.isGreaterThanOrEqualTo(v2_3_0)
    ) {
      migrations.push(CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_3_0);
    }

    return migrations;
  }

  /**
   * Execute migrations in sequence
   */
  private async runMigrations(lab: CnLab, targetVersion: string, migrations: string[]): Promise<void> {
    for (const migrationVersion of migrations) {
      this.logger.log(`Running migration to version ${migrationVersion}`);
      await this.labService.updateServerTask(
        lab.id,
        `Running migration to v${migrationVersion}`,
        CnLabServerTaskStatus.RUNNING
      );

      switch (migrationVersion) {
        case CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_0_0:
          await this.migrateToLabManagerV2_0_0(lab, targetVersion);
          break;
        case CnLabMigrateService.LAB_MANAGER_MIGRATION_VERSION_2_3_0:
          await this.migrateToLabManagerV2_3_0(lab, targetVersion);
          break;
        default:
          throw new Error(`Unknown migration version: ${migrationVersion}`);
      }
    }
  }

  /**
   * Migration to Lab Manager v2.0.0
   */
  private async migrateToLabManagerV2_0_0(lab: CnLab, targetVersion: string): Promise<void> {
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

    // Update lab manager to target version or 2.0.0
    await this.labService.updateServerTask(
      lab.id,
      `Updating lab manager to version ${targetVersion}`,
      CnLabServerTaskStatus.RUNNING
    );
    await this.labConfigurerService.updateLabManager(lab, targetVersion);
  }

  /**
   * Migration to Lab Manager v2.3.0
   * Only runs when upgrading from >= 2.0.0 to >= 2.3.0
   */
  private async migrateToLabManagerV2_3_0(lab: CnLab, targetVersion: string): Promise<void> {
    this.logger.log('Running migration to Lab Manager v2.3.0');

    await this.labService.updateServerTask(
      lab.id,
      `Running v2.3.0 migration operations`,
      CnLabServerTaskStatus.RUNNING
    );

    // Call the configurer service method which handles the migration
    await this.labConfigurerService.migrateToLabManagerV230(lab, targetVersion);
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
