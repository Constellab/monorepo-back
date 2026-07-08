/**
 * DTO representing a single migration's description
 */
export class CnLabMigrationDescriptionDTO {
  /**
   * The version this migration upgrades to (e.g., "2.0.0")
   */
  version: string;

  /**
   * Markdown-formatted description of what this migration does
   */
  description: string;

  constructor(version: string, description: string) {
    this.version = version;
    this.description = description;
  }
}

/**
 * DTO representing a complete migration plan
 */
export class CnLabMigrationPlanDTO {
  /**
   * The current source version (null when the current version cannot be determined)
   */
  sourceVersion: string | null;

  /**
   * The target version to migrate to
   */
  targetVersion: string;

  /**
   * List of migrations that will be executed, in order
   */
  migrations: CnLabMigrationDescriptionDTO[];

  constructor(
    sourceVersion: string | null,
    targetVersion: string,
    migrations: CnLabMigrationDescriptionDTO[]
  ) {
    this.sourceVersion = sourceVersion;
    this.targetVersion = targetVersion;
    this.migrations = migrations;
  }
}
