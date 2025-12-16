import { CnLabMigration } from '../cn-lab-migration.abstract';

/**
 * Migration to Lab Manager v2.8.0
 *
 * This migration is handle by the lab manager. This is only useful to track that
 * changes that will be applied during the upgrade to 2.8.0
 */
export class CnLabMigration280 extends CnLabMigration {
  private static readonly VERSION = '2.8.0';

  getDestinationVersion(): string {
    return CnLabMigration280.VERSION;
  }

  migrate(): Promise<void> {
    // the migration is run during the lab manager initialization process
    return Promise.resolve();
  }

  getDescription(): string {
    return `Updates the following bricks to minimum required versions during lab manager initialization:
- **GWS Core**: v0.18.0
- **GWS Biota**: v0.12.0`;
  }
}
