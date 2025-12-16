import { BlVersion } from '@monorepo/back-core-lib';
import { Test, TestingModule } from '@nestjs/testing';

import { CnLabMigration } from './cn-lab-migration.abstract';
import { CnLabMigrationRegistryService } from './cn-lab-migration-registry.service';

// Mock migration for testing
class MockMigration100 extends CnLabMigration {
  getDestinationVersion(): string {
    return '1.0.0';
  }

  applies(sourceVersion: BlVersion, targetVersion: BlVersion): boolean {
    const thisVersion = this.getDestinationVersionObject();
    return sourceVersion.isLowerThan(thisVersion) && targetVersion.isGreaterThanOrEqualTo(thisVersion);
  }

  async migrate(): Promise<void> {
    // Mock implementation
  }

  getDescription(): string {
    return '# Mock Migration 1.0.0';
  }
}

class MockMigration200 extends CnLabMigration {
  getDestinationVersion(): string {
    return '2.0.0';
  }

  applies(sourceVersion: BlVersion, targetVersion: BlVersion): boolean {
    const thisVersion = this.getDestinationVersionObject();
    return sourceVersion.isLowerThan(thisVersion) && targetVersion.isGreaterThanOrEqualTo(thisVersion);
  }

  async migrate(): Promise<void> {
    // Mock implementation
  }

  getDescription(): string {
    return '# Mock Migration 2.0.0';
  }
}

describe('CnLabMigrationRegistryService', () => {
  let service: CnLabMigrationRegistryService;
  let migration100: MockMigration100;
  let migration200: MockMigration200;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CnLabMigrationRegistryService],
    }).compile();

    service = module.get<CnLabMigrationRegistryService>(CnLabMigrationRegistryService);
    migration100 = new MockMigration100();
    migration200 = new MockMigration200();
  });

  describe('registerMigration', () => {
    it('should register a single migration', () => {
      service.registerMigration(migration100);
      expect(service.getMigrationCount()).toBe(1);
    });

    it('should register multiple migrations', () => {
      service.registerMigrations([migration100, migration200]);
      expect(service.getMigrationCount()).toBe(2);
    });
  });

  describe('getAllMigrations', () => {
    it('should return migrations sorted by version', () => {
      // Register in reverse order
      service.registerMigration(migration200);
      service.registerMigration(migration100);

      const migrations = service.getAllMigrations();
      expect(migrations[0].getDestinationVersion()).toBe('1.0.0');
      expect(migrations[1].getDestinationVersion()).toBe('2.0.0');
    });
  });

  describe('getMigrationsToExecute', () => {
    beforeEach(() => {
      service.registerMigrations([migration100, migration200]);
    });

    it('should return no migrations when already at target version', () => {
      const source = BlVersion.fromString('2.0.0');
      const target = BlVersion.fromString('2.0.0');

      const migrations = service.getMigrationsToExecute(source, target);
      expect(migrations).toHaveLength(0);
    });

    it('should return one migration when upgrading from 0.5.0 to 1.0.0', () => {
      const source = BlVersion.fromString('0.5.0');
      const target = BlVersion.fromString('1.0.0');

      const migrations = service.getMigrationsToExecute(source, target);
      expect(migrations).toHaveLength(1);
      expect(migrations[0].getDestinationVersion()).toBe('1.0.0');
    });

    it('should return two migrations when upgrading from 0.5.0 to 2.0.0', () => {
      const source = BlVersion.fromString('0.5.0');
      const target = BlVersion.fromString('2.0.0');

      const migrations = service.getMigrationsToExecute(source, target);
      expect(migrations).toHaveLength(2);
      expect(migrations[0].getDestinationVersion()).toBe('1.0.0');
      expect(migrations[1].getDestinationVersion()).toBe('2.0.0');
    });

    it('should return one migration when upgrading from 1.5.0 to 2.0.0', () => {
      const source = BlVersion.fromString('1.5.0');
      const target = BlVersion.fromString('2.0.0');

      const migrations = service.getMigrationsToExecute(source, target);
      expect(migrations).toHaveLength(1);
      expect(migrations[0].getDestinationVersion()).toBe('2.0.0');
    });
  });

  describe('getMigrationByVersion', () => {
    beforeEach(() => {
      service.registerMigrations([migration100, migration200]);
    });

    it('should find migration by version', () => {
      const migration = service.getMigrationByVersion('1.0.0');
      expect(migration).toBeDefined();
      expect(migration?.getDestinationVersion()).toBe('1.0.0');
    });

    it('should return undefined for non-existent version', () => {
      const migration = service.getMigrationByVersion('3.0.0');
      expect(migration).toBeUndefined();
    });
  });

  describe('getMigrationDescriptions', () => {
    beforeEach(() => {
      service.registerMigrations([migration100, migration200]);
    });

    it('should return combined descriptions for applicable migrations', () => {
      const source = BlVersion.fromString('0.5.0');
      const target = BlVersion.fromString('2.0.0');

      const description = service.getMigrationDescriptions(source, target);
      expect(description).toContain('Migration Plan');
      expect(description).toContain('v1.0.0');
      expect(description).toContain('v2.0.0');
    });

    it('should return no migrations message when already up to date', () => {
      const source = BlVersion.fromString('2.0.0');
      const target = BlVersion.fromString('2.0.0');

      const description = service.getMigrationDescriptions(source, target);
      expect(description).toContain('No Migrations Required');
    });
  });

  describe('canMigrate', () => {
    beforeEach(() => {
      service.registerMigrations([migration100, migration200]);
    });

    it('should return true when migrations are available', () => {
      const source = BlVersion.fromString('0.5.0');
      const target = BlVersion.fromString('2.0.0');

      expect(service.canMigrate(source, target)).toBe(true);
    });

    it('should return true when already at target version', () => {
      const source = BlVersion.fromString('2.0.0');
      const target = BlVersion.fromString('2.0.0');

      expect(service.canMigrate(source, target)).toBe(true);
    });
  });
});
