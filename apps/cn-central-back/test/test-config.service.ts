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
      host: this.configService.get('DATABASE_HOST'),
      port: this.getConfigNumber('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: 'gencoveryDbTest'
    };
  }
}
