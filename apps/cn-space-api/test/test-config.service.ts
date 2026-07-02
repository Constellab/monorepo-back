import { Injectable } from '@nestjs/common';

import { CnEnvironmentProfile } from '../src/app/cn-core/model/config/cn-config.class';
import { CnCoreConfigService } from '../src/app/cn-core/modules/cn-core-config/cn-core-config.service';

/**
 * Override CnCoreConfigService for tests to force the 'test' profile.
 *
 * The database connection itself comes from cn-test.env (loaded by CnAppModule
 * when ENVIRONMENT_PROFILE=test), so the base class getDatabaseConfig() already
 * returns the test database — no override needed here.
 */
@Injectable()
export class TestConfigService extends CnCoreConfigService {
  getEnvironmentProfile(): CnEnvironmentProfile {
    return 'test';
  }
}
