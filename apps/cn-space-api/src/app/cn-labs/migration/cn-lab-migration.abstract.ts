import { BlVersion } from '@monorepo/back-core-lib';

import { CnLab } from '../cn-lab.entity';

/**
 * Abstract base class for lab migrations.
 * Each migration should extend this class and implement the required methods.
 */
export abstract class CnLabMigration {
  /**
   * Returns the destination version this migration upgrades to
   */
  abstract getDestinationVersion(): string;

  /**
   * Executes the migration
   * @param lab - The lab entity to migrate
   * @param targetVersion - The final target version (may be higher than destination version)
   */
  abstract migrate(lab: CnLab, targetVersion: string): Promise<void>;

  /**
   * Returns a markdown formatted description explaining what this migration does
   * This is useful for documentation and user communication
   */
  abstract getDescription(): string;

  /**
   * Returns the destination version as a BlVersion object
   */
  getDestinationVersionObject(): BlVersion {
    return BlVersion.fromString(this.getDestinationVersion());
  }

  /**
   * Helper method to compare versions
   */
  protected compareVersions(v1: BlVersion, v2: BlVersion): number {
    return v1.getDif(v2);
  }

  /**
   * Checks if this migration applies based on source and destination versions
   * @param sourceVersion - The current version of the lab
   * @param targetVersion - The version the lab is being upgraded to
   * @returns true if this migration should be executed
   */
  applies(sourceVersion: BlVersion, targetVersion: BlVersion): boolean {
    const version = this.getDestinationVersionObject();

    // Migration applies if:
    // - Current version is below the migration version
    // - Target version is the migration version or higher
    return sourceVersion.isLowerThan(version) && targetVersion.isGreaterThanOrEqualTo(version);
  }
}
