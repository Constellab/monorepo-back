import { CnLab } from '../../cn-lab.entity';
import { CnLabsService } from '../../cn-labs.service';
import { CnCloudProviderFactory } from '../../server/cn-cloud-provider.factory';
import { CnLabConfigurerService } from '../../server/cn-lab-configurer.service';
import { CnLabServerTaskStatus } from '../../status/cn-lab-status.enum';
import { CnLabMigration } from '../cn-lab-migration.abstract';

/**
 * Migration to Lab Manager v2.8.0
 *
 * This migration is handle by the lab manager. This is only useful to track that
 * changes that will be applied during the upgrade to 2.8.0
 */
export class CnLabMigration280 extends CnLabMigration {
  private static readonly VERSION = '2.8.0';

  constructor(
    private cloudProviderFactory: CnCloudProviderFactory,
    private labConfigurerService: CnLabConfigurerService,
    private labService: CnLabsService
  ) {
    super();
  }

  getDestinationVersion(): string {
    return CnLabMigration280.VERSION;
  }

  async migrate(lab: CnLab): Promise<void> {
    const sshService = await this.cloudProviderFactory.getSshLabService(lab);

    await this.labConfigurerService.composeDown(lab);

    await this.labService.updateServerTask(
      lab.id,
      `Removing biota data directory`,
      CnLabServerTaskStatus.RUNNING
    );

    await sshService.execSshCommand(['sudo rm -rf /app/gws_db/gws_biota/']);
  }

  getDescription(): string {
    return `Updates the following bricks to minimum required versions during lab manager initialization:
- **gws_core**: v0.19.0
- **gws_biota**: v0.11.0

** Please update only if you currently are on gws_core version 0.18.x or higher **`;
  }
}
