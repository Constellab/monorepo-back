import { Logger } from '@nestjs/common';

import { CnBrickGWS, CnBrickVersionDTO } from '../../../cn-bricks/cn-brick.dto';
import { CnLab } from '../../cn-lab.entity';
import { CnLabAggregateService } from '../../cn-lab-aggregate.service';
import { CnLabManagerService } from '../../cn-lab-manager.service';
import { CnLabsService } from '../../cn-labs.service';
import { CnLabConfigurerService } from '../../server/cn-lab-configurer.service';
import { CnLabServerTaskStatus } from '../../status/cn-lab-status.enum';
import { CnLabMigration } from '../cn-lab-migration.abstract';

/**
 * Migration to Lab Manager v2.0.0
 *
 * This migration performs the following operations:
 * 1. Deletes old containers
 * 2. Updates brick versions to minimum required versions
 * 3. Stops the lab
 * 4. Runs permission migration
 * 5. Starts the lab
 * 6. Updates lab manager to target version
 */
export class CnLabMigration200 extends CnLabMigration {
  private readonly logger = new Logger(CnLabMigration200.name);
  private static readonly VERSION = '2.0.0';

  constructor(
    private labManagerService: CnLabManagerService,
    private labConfigurerService: CnLabConfigurerService,
    private labAggregateService: CnLabAggregateService,
    private labService: CnLabsService
  ) {
    super();
  }

  getDestinationVersion(): string {
    return CnLabMigration200.VERSION;
  }

  async migrate(lab: CnLab, targetVersion: string): Promise<void> {
    this.logger.log(`Starting migration to Lab Manager v${CnLabMigration200.VERSION}`);

    // Delete main services
    await this.labManagerService.oldDeleteContainers(lab).catch((error) => {
      // log the error but continue the migration
      this.logger.error(`Error deleting old containers: ${error}, continuing migration...`);
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

    this.logger.log(`Completed migration to Lab Manager v${CnLabMigration200.VERSION}`);
  }

  getDescription(): string {
    return `#### 1. Brick Version Updates
Updates the following bricks to minimum required versions:
- **GWS Core**: v0.17.0
- **GWS Biota**: v0.9.0
- **GWS Ubiome**: v0.13.0
- **GWS Omix**: v0.12.0

#### 2. Permission System Migration
- Stops all lab services temporarily
- Migrates access rights to the new permission model
- Restarts services with updated configuration`;
  }
}
