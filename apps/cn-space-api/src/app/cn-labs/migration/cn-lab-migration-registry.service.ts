import { BlVersion } from '@monorepo/back-core-lib';
import { Injectable, Logger } from '@nestjs/common';

import { CnLabAggregateService } from '../cn-lab-aggregate.service';
import { CnLabManagerService } from '../cn-lab-manager.service';
import { CnLabsService } from '../cn-labs.service';
import { CnCloudProviderFactory } from '../server/cn-cloud-provider.factory';
import { CnLabConfigurerService } from '../server/cn-lab-configurer.service';
import { CnLabMigration } from './cn-lab-migration.abstract';
import { CnLabMigrationDescriptionDTO, CnLabMigrationPlanDTO } from './cn-lab-migration.dto';
import { CnLabMigration200 } from './migrations/cn-lab-migration-2.0.0';
import { CnLabMigration230 } from './migrations/cn-lab-migration-2.3.0';
import { CnLabMigration280 } from './migrations/cn-lab-migration-2.8.0';

/**
 * Registry service for managing lab migrations.
 * This service maintains a list of available migrations and provides
 * methods to determine which migrations need to be executed.
 *
 * Migrations are created and managed by this service, which injects
 * all required dependencies.
 */
@Injectable()
export class CnLabMigrationRegistryService {
  private readonly logger = new Logger(CnLabMigrationRegistryService.name);

  constructor(
    private labManagerService: CnLabManagerService,
    private labConfigurerService: CnLabConfigurerService,
    private labAggregateService: CnLabAggregateService,
    private labService: CnLabsService,
    private cloudProviderFactory: CnCloudProviderFactory
  ) {}

  /**
   * Gets all registered migrations sorted by version
   * @returns Array of migrations sorted from oldest to newest
   */
  getAllMigrations(): CnLabMigration[] {
    const migrations: CnLabMigration[] = [
      new CnLabMigration200(
        this.labManagerService,
        this.labConfigurerService,
        this.labAggregateService,
        this.labService
      ),
      new CnLabMigration230(this.labConfigurerService, this.labService),
      new CnLabMigration280(this.cloudProviderFactory, this.labConfigurerService, this.labService),
    ];
    return migrations.sort((a, b) => {
      const versionA = a.getDestinationVersionObject();
      const versionB = b.getDestinationVersionObject();
      return versionA.getDif(versionB);
    });
  }

  /**
   * Determines which migrations need to be executed based on source and target versions
   * @param sourceVersion - The current version
   * @param targetVersion - The desired target version
   * @returns Array of migrations to execute, in order
   */
  getMigrationsToExecute(sourceVersion: BlVersion, targetVersion: BlVersion): CnLabMigration[] {
    const applicableMigrations = this.getAllMigrations().filter((migration) =>
      migration.applies(sourceVersion, targetVersion)
    );

    // Sort by destination version to ensure proper execution order
    return applicableMigrations.sort((a, b) => {
      const versionA = a.getDestinationVersionObject();
      const versionB = b.getDestinationVersionObject();
      return versionA.getDif(versionB);
    });
  }

  /**
   * Gets a migration by its destination version
   * @param version - The version string to search for
   * @returns The migration or undefined if not found
   */
  getMigrationByVersion(version: string): CnLabMigration | undefined {
    return this.getAllMigrations().find((migration) => migration.getDestinationVersion() === version);
  }

  /**
   * Gets structured migration plan with descriptions for all migrations that would be executed
   * @param sourceVersion - The current version
   * @param targetVersion - The desired target version
   * @returns Migration plan with list of migrations and their descriptions
   */
  getMigrationPlan(sourceVersion: BlVersion, targetVersion: BlVersion): CnLabMigrationPlanDTO {
    const migrationsToExecute = this.getMigrationsToExecute(sourceVersion, targetVersion);

    const migrationDescriptions = migrationsToExecute.map(
      (migration) =>
        new CnLabMigrationDescriptionDTO(migration.getDestinationVersion(), migration.getDescription())
    );

    return new CnLabMigrationPlanDTO(
      sourceVersion.toString(),
      targetVersion.toString(),
      migrationDescriptions
    );
  }
}
