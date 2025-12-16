import { BlVersion } from '@monorepo/back-core-lib';
import { Logger } from '@nestjs/common';

import { CnLab } from '../../cn-lab.entity';
import { CnLabsService } from '../../cn-labs.service';
import { CnLabConfigurerService } from '../../server/cn-lab-configurer.service';
import { CnLabServerTaskStatus } from '../../status/cn-lab-status.enum';
import { CnLabMigration } from '../cn-lab-migration.abstract';

/**
 * Migration to Lab Manager v2.3.0
 *
 * This migration only runs when upgrading from >= 2.0.0 to >= 2.3.0
 * It performs incremental updates for labs already on the 2.x architecture
 */
export class CnLabMigration230 extends CnLabMigration {
  private readonly logger = new Logger(CnLabMigration230.name);
  private static readonly VERSION = '2.3.0';

  constructor(
    private labConfigurerService: CnLabConfigurerService,
    private labService: CnLabsService
  ) {
    super();
  }

  getDestinationVersion(): string {
    return CnLabMigration230.VERSION;
  }

  applies(sourceVersion: BlVersion, targetVersion: BlVersion): boolean {
    const v2_0_0 = BlVersion.fromString('2.0.0');
    const v2_3_0 = this.getDestinationVersionObject();

    // Migration applies if:
    // - Current version is >= 2.0.0 (already on new architecture)
    // - Current version is < 2.3.0
    // - Target version is >= 2.3.0
    // Note: Labs migrating directly from < 2.0.0 will use the 2.0.0 migration which includes these changes
    return (
      sourceVersion.isGreaterThanOrEqualTo(v2_0_0) &&
      sourceVersion.isLowerThan(v2_3_0) &&
      targetVersion.isGreaterThanOrEqualTo(v2_3_0)
    );
  }

  async migrate(lab: CnLab, targetVersion: string): Promise<void> {
    this.logger.log(`Starting migration to Lab Manager v${CnLabMigration230.VERSION}`);

    await this.labService.updateServerTask(
      lab.id,
      `Running v2.3.0 migration operations`,
      CnLabServerTaskStatus.RUNNING
    );

    // Call the configurer service method which handles the migration
    await this.labConfigurerService.migrateToLabManagerV230(lab, targetVersion);

    this.logger.log(`Completed migration to Lab Manager v${CnLabMigration230.VERSION}`);
  }

  getDescription(): string {
    return `#### Configuration Updates
- Updates Lab Manager configuration files
- Applies v2.3.0-specific settings and optimizations

#### Component Upgrades
- Updates internal components to v2.3.0
- Ensures compatibility with the latest features`;
  }
}
