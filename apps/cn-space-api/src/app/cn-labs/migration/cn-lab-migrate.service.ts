import { BlVersion } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnLabManagerStatus } from '../../cn-external-lab-api/model/cn-lab-manager.class';
import { CnLabStatusDTO } from '../cn-lab.dto';
import { CnLab } from '../cn-lab.entity';
import { CnLabAggregateService } from '../cn-lab-aggregate.service';
import { CnLabManagerService } from '../cn-lab-manager.service';
import { CnLabsService } from '../cn-labs.service';
import { CnLabConfigurerService } from '../server/cn-lab-configurer.service';
import { CnLabServerTaskStatus } from '../status/cn-lab-status.enum';
import { CnLabMigration } from './cn-lab-migration.abstract';
import { CnLabMigrationPlanDTO } from './cn-lab-migration.dto';
import { CnLabMigrationRegistryService } from './cn-lab-migration-registry.service';

@Injectable()
export class CnLabMigrateService {
  private readonly logger = new Logger(CnLabMigrateService.name);

  constructor(
    private labManagerService: CnLabManagerService,
    private labConfigurerService: CnLabConfigurerService,
    private labAggregateService: CnLabAggregateService,
    private labService: CnLabsService,
    private migrationRegistry: CnLabMigrationRegistryService
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

    // Get applicable migrations from registry
    const migrationsToRun = this.migrationRegistry.getMigrationsToExecute(currentVersion, newVersion);

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
   * Get version upgrade info for a version upgrade
   * @param currentVersionStr - Current version string
   * @returns Migration plan DTO with list of migrations and their descriptions
   */
  public getVersionUpgradeInfo(currentVersionStr: string): CnLabMigrationPlanDTO {
    const recommendedVersion = this.labManagerService.getLabManagerRecommendedVersion();

    const currentVersion = BlVersion.fromString(currentVersionStr);
    const newVersion = BlVersion.fromString(recommendedVersion);
    return this.migrationRegistry.getMigrationPlan(currentVersion, newVersion);
  }

  public getLabVersionUpgradeInfo(labId: string): Promise<CnLabMigrationPlanDTO> {
    return this.getLabMigrationPlan(labId, this.labManagerService.getLabManagerRecommendedVersion());
  }

  /**
   * Get structured migration plan with descriptions for migrations that would be executed
   * @param labId - Lab ID
   * @param targetVersion - Target version to update to
   * @returns Migration plan DTO with list of migrations and their descriptions
   */
  public async getLabMigrationPlan(labId: string, targetVersion: string): Promise<CnLabMigrationPlanDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);

    let labManagerStatus: CnLabManagerStatus;
    try {
      labManagerStatus = await this.labManagerService.getLabStatus(lab);
    } catch {
      // Return a plan with no migrations when we can't determine current version
      return new CnLabMigrationPlanDTO(null, targetVersion, []);
    }

    const currentVersion = BlVersion.fromString(labManagerStatus.version);
    const newVersion = BlVersion.fromString(targetVersion);

    return this.migrationRegistry.getMigrationPlan(currentVersion, newVersion);
  }

  /**
   * Run migrations asynchronously in background
   * @param labId - Lab ID
   * @param targetVersion - Target version to update to after migrations
   * @param migrations - Array of migration instances to run in order
   */
  public async runMigrationsAsync(
    labId: string,
    targetVersion: string,
    migrations: CnLabMigration[]
  ): Promise<CnLabStatusDTO> {
    const lab = await this.labAggregateService.getAndCheckAuthorizationToManageLab(labId);
    this.checkServerIsRunning(lab);

    const migrationList = migrations.map((m) => `v${m.getDestinationVersion()}`).join(' -> ');
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
   * Execute migrations in sequence
   */
  private async runMigrations(
    lab: CnLab,
    targetVersion: string,
    migrations: import('./cn-lab-migration.abstract').CnLabMigration[]
  ): Promise<void> {
    for (const migration of migrations) {
      const migrationVersion = migration.getDestinationVersion();
      this.logger.log(`Running migration to version ${migrationVersion}`);
      await this.labService.updateServerTask(
        lab.id,
        `Running migration to v${migrationVersion}`,
        CnLabServerTaskStatus.RUNNING
      );

      // Execute the migration
      await migration.migrate(lab, targetVersion);
    }
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
