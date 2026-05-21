import { Logger } from '@nestjs/common';

import { CnBrickGWS, CnBrickVersionDTO } from '../../../cn-bricks/cn-brick.dto';
import { CnLab } from '../../cn-lab.entity';
import { CnLabAggregateService } from '../../cn-lab-aggregate.service';
import { CnLabsService } from '../../cn-labs.service';
import { CnLabServerTaskStatus } from '../../status/cn-lab-status.enum';
import { CnLabMigration } from '../cn-lab-migration.abstract';

/**
 * Migration to Lab Manager v2.13.0
 *
 * This migration performs the following operations:
 * 1. Updates GWS_CORE brick to minimum version 0.22.0
 */
export class CnLabMigration2130 extends CnLabMigration {
  private readonly logger = new Logger(CnLabMigration2130.name);
  private static readonly VERSION = '2.13.0';

  constructor(
    private labAggregateService: CnLabAggregateService,
    private labService: CnLabsService
  ) {
    super();
  }

  getDestinationVersion(): string {
    return CnLabMigration2130.VERSION;
  }

  async migrate(lab: CnLab): Promise<void> {
    this.logger.log(`Starting migration to Lab Manager v${CnLabMigration2130.VERSION}`);

    const brickVersions: CnBrickVersionDTO[] = [{ name: CnBrickGWS.GWS_CORE, version: '0.22.0' }];

    await this.labService.updateServerTask(lab.id, `Updating brick versions`, CnLabServerTaskStatus.RUNNING);
    await this.labAggregateService.updateBricksToMinimumVersion(lab.id, {
      brickVersions,
    });

    this.logger.log(`Completed migration to Lab Manager v${CnLabMigration2130.VERSION}`);
  }

  getDescription(): string {
    return `#### Brick Version Updates
Updates the following bricks to minimum required versions:
- **GWS Core**: v0.22.0`;
  }
}
