import { BlUserCategory } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { HnUser } from '../src/app/users/hn-user.entity';
import { TEST_ADMIN_EMAIL, TEST_ADMIN_ID } from './test-credentials';

/**
 * Service for the test environment to reset and init the database.
 *
 * Seeding goes through TypeORM repositories (not raw SQL) so it always matches
 * the current entity schema and never drifts when a column is added/renamed.
 *
 * Only the admin user is seeded here (the minimum needed to authenticate).
 * Suites that need more fixtures should create them through the app's own
 * endpoints/services so the data stays consistent.
 */
@Injectable()
export class HnTestDbInitializerService {
  constructor(private datasource: DataSource) {}

  async initDb(): Promise<void> {
    this.assertIsTestDatabase();

    await this.datasource.dropDatabase();
    await this.datasource.synchronize();

    await this.seedAdminUser();
  }

  /**
   * Safety net: this service DROPS the whole database, so refuse to run against
   * anything that isn't clearly a test database (guards against a misconfigured
   * env pointing tests at a dev/prod DB).
   */
  private assertIsTestDatabase(): void {
    const database = String(this.datasource.options.database ?? '');
    if (!/test/i.test(database)) {
      throw new Error(
        `Refusing to reset database "${database}": it does not look like a test database. ` +
          `The test harness drops the database — check ENVIRONMENT_PROFILE=test and hn-test.env.`
      );
    }
  }

  private async seedAdminUser(): Promise<void> {
    // hn login is email-only for local auth (no password column on HnUser),
    // so seeding a user with the known email is enough to log in.
    const userRepository = this.datasource.getRepository(HnUser);
    const admin = userRepository.create({
      id: TEST_ADMIN_ID,
      userCode: 'UA-06866542',
      alias: 'User Admin',
      firstname: 'User',
      lastname: 'Admin',
      email: TEST_ADMIN_EMAIL,
      category: BlUserCategory.ADMIN,
    });
    await userRepository.save(admin);
  }
}
