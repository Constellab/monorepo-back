import {Injectable} from '@nestjs/common';
import {CnCoreConfigService} from '../src/app/cn-core/modules/cn-core-config/cn-core-config.service';
import {CnDatabaseConfig, CnEnvironmentProfile} from '../src/app/cn-core/model/config/cn-config.class';

/**
 * Override CnCoreConfigService for test to set Test env and correct DB
 */
@Injectable()
export class TestConfigService extends CnCoreConfigService {


  getEnvironmentProfile(): CnEnvironmentProfile {
    return 'test';
  }


  public getDatabaseConfig(): CnDatabaseConfig {
    return {
      host: 'localhost',
      port: 3307,
      username: 'gencoveryUserTest',
      password: 'gencovery2020$',
      database: 'gencoveryDbTest'
    };
  }
}
