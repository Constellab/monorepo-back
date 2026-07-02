import { Injectable } from '@nestjs/common';

import { HnEnvironmentProfile } from '../src/app/core/model/config/hn-config.class';
import { HnCoreConfigService } from '../src/app/core/modules/core-config/hn-core-config.service';

/**
 * Override HnCoreConfigService for tests to force the 'test' profile.
 *
 * The database connection itself comes from hn-test.env (loaded by HnAppModule
 * when ENVIRONMENT_PROFILE=test), so the base class getDatabaseConfig() already
 * returns the test database — no override needed here.
 */
@Injectable()
export class TestConfigService extends HnCoreConfigService {
  getEnvironmentProfile(): HnEnvironmentProfile {
    return 'test';
  }
}
